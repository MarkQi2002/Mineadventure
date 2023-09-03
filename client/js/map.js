// mapX, mapY - Relative To The Entire Map, Use To Access Any Unit
// unitX, unitY - Relative To The Quarter Map, To Select A Unit In The Quarter Map
// blockX, blockY - Relative To The Quarter Map, To Select A Block In The Quarter Map
// Variable Declaration
var unitProperties, unitPropertyNumber;

var planeGeometry =  new THREE.PlaneGeometry(1, 1); // Geometry For All Plane

var blockgeometry = new THREE.BoxGeometry(1, 1, 6); // Geometry For All Block
blockgeometry.translate(0, 0, -3);

// Map Class
class map {
    // Map Class Constructor
    constructor(data) {
        let mapData = data.map

        this.object = new THREE.Object3D();
        this.object.position.set(0, 0, 0);

        this.size = mapData.size;
        this.unitList = [];

        this.createEmptyMap();

        this.unitIDList = mapData.unitIDList;           // Get Unit ID List From Server
        this.loader = new THREE.TextureLoader();        // Texture Loader
        this.GLTFLoader = new THREE.GLTFLoader();       // OBJ Loader
        this.loadModel(this, 0, data);                  // Load GLTF Model, Including afterLoadFunction()
    }

    // Map Change
    loadNewMap(mapData) {
        this.size = mapData.size;
        this.unitList = [];
        this.createEmptyMap();
        this.spawnMap(mapData.dataSpace);
    }

    // Loading The Model Using Imported Module
    loadModel(scope, index, data) {
        // DEBUG LOG
        console.log(index)

        // Variable Declaration
        let unitIDInfo = scope.unitIDList[index];
        let texture;

        // Load Materials
        switch(unitIDInfo.typeInfo.type) {
            case "plane":
                unitIDInfo["geometry"] = planeGeometry;
                console.log("image/unit_material/" + unitIDInfo.fileName[0])
                texture = scope.loader.load("image/unit_material/" + unitIDInfo.fileName[0]);
                if (unitIDInfo.IsPhongMaterial) {
                    unitIDInfo["material"] =  new THREE.MeshPhongMaterial({map: texture});
                    unitIDInfo["transparentMaterial"] = new THREE.MeshPhongMaterial({map: texture, transparent: true, opacity: 0.2});
                } else {
                    unitIDInfo["material"] =  new THREE.MeshBasicMaterial({map: texture});
                    unitIDInfo["transparentMaterial"] = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.2});
                }

                break;

            case "block":
                unitIDInfo["geometry"] = blockgeometry;
                let materials = [];
                let transparentMaterial = [];
                for (let i = 0; i < unitIDInfo.fileName.length; ++i) {
                    texture = scope.loader.load("image/unit_material/" + unitIDInfo.fileName[i]);
                    if (unitIDInfo.IsPhongMaterial) {
                        materials.push(new THREE.MeshPhongMaterial({map: texture}));
                        transparentMaterial.push(new THREE.MeshPhongMaterial({map: texture, transparent: true, opacity: 0.2}));
                    } else {
                        materials.push(new THREE.MeshBasicMaterial({map: texture}));
                        transparentMaterial.push(new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: 0.2}));
                    }
                }
                unitIDInfo["material"] = materials;
                unitIDInfo["transparentMaterial"] = transparentMaterial

                break;

            case "childUnit":
                scope.GLTFLoader.load("model/" + unitIDInfo.fileName[0], function (gltf) {

                    var newModel = gltf.scene.children[0];
                    // Set Scale
                    //newModel.scale.set(unitIDInfo.scale, unitIDInfo.scale, unitIDInfo.scale);

                    console.log(newModel)

                    unitIDInfo["geometry"] = newModel.geometry;
                    unitIDInfo["material"] = newModel.material;
                    if (newModel.material != null) {
                        unitIDInfo["transparentMaterial"] = newModel.material.clone();
                        unitIDInfo.transparentMaterial.transparent = true;
                        unitIDInfo.transparentMaterial.opacity = 0.2;
                    } else {
                        unitIDInfo["transparentMaterial"] = null;
                    }

                    if (scope.unitIDList.length > index + 1) {
                        scope.loadModel(scope, index + 1, data)
                    } else {
                        scope.afterLoadFunction(data);
                    }
                });
                return;
        }

        if (scope.unitIDList.length > index + 1) {
            scope.loadModel(scope, index + 1, data)
        } else {
            scope.afterLoadFunction(data);
        }
    }

    // After Load Function
    afterLoadFunction(data) {
        this.spawnMap(data.map.dataSpace);
        scene.add(this.object);
        afterMapEvent(data);
    }

    // Generating A Completely Empty Map
    createEmptyMap() {
        for (let i = 0; i < this.size.y; i++) {
            this.unitList.push(new Array(this.size.x));
        }
    }

    // Check If Within Map Rnage
    IsNotInMapRange(floatX, floatY) {
        return this.size.x <= floatX || 0 > floatX || this.size.y <= floatY || 0 > floatY;
    }

    // Return The Unit Based On xy Coordinate
    getUnit([mapX, mapY]) {
        if (this.IsNotInMapRange(mapX, mapY)) return null;
        return this.unitList[mapY][mapX];
    }

    // Creating Client Side Blocks
    spawnMap(dataSpace) {
        let dataView = new DataView(dataSpace);
        let unitClass, offset;
        let dataShift = 0;
        // Set DataView to unitList
        for (let y = 0; y < this.unitList.length; ++y) {
            for (let x = 0; x < this.unitList[y].length; ++x) {
                unitClass = {
                    x: x,
                    y: y,
                    mesh: null,
                    childMesh: null,
                    transparent: false
                };

                offset = 0;
                for (let [key, value] of Object.entries(unitProperties)) {
                    switch (value){
                        case "uint":
                            unitClass[key] = dataView.getUint32(dataShift + offset);
                            break;
                        case "int":
                            unitClass[key] = dataView.getInt32(dataShift + offset);
                            break;
                        case "float":
                            unitClass[key] = dataView.getFloat32(dataShift + offset);
                            break;
                    }
                    offset += Int32Array.BYTES_PER_ELEMENT;
                }

                this.unitList[y][x] = unitClass;

                dataShift += Int32Array.BYTES_PER_ELEMENT * unitPropertyNumber;
            }
        }
    }

    // Creating Client Side Unit
    spawnUnit(unitClass) {
        let unitInfo = this.unitIDList[unitClass.ID];

        let mesh = new THREE.Mesh(unitInfo.geometry, unitInfo.material);

        if (unitClass.height > 6 && unitInfo.typeInfo.type == "block") {
            mesh.scale.z = unitClass.height / 6;
        }

        // Adding Unit To Parent
        this.object.add(mesh);
        unitClass.mesh = mesh;
        mesh.position.set(unitClass.x, unitClass.y, unitClass.height);

        if (unitClass.childID != 0) {
            this.spawnChildUnit(unitClass);
        }
    }

    // Creating Client Side Unit
    spawnChildUnit(unitClass){
        let childInfo = this.unitIDList[unitClass.childID];

        if (childInfo.geometry == null || childInfo.material == null) return;
        let mesh = new THREE.Mesh(childInfo.geometry, childInfo.material);
        let scale = childInfo.typeInfo.scale;
        mesh.scale.set(scale, scale, scale);

        // Adding Unit To Parent
        unitClass.mesh.add(mesh);
        unitClass.childMesh = mesh;
        //mesh.rotation.z = unitClass.rotation;
    }
}