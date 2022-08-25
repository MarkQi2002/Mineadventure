// mapX, mapY - Relative To The Entire Map, Use To Access Any Unit
// unitX, unitY - Relative To The Quarter Map, To Select A Unit In The Quarter Map
// blockX, blockY - Relative To The Quarter Map, To Select A Block In The Quarter Map

var unitProperties, unitPropertyNumber;

var planeGeometry =  new THREE.PlaneGeometry(1, 1); // Geometry For All Plane

var blockgeometry = new THREE.BoxGeometry(1, 1, 6); // Geometry For All Block
blockgeometry.translate(0, 0, -3);

// Map Class
class map {
    // Map Constructor
    constructor(data) {
        let mapData = data.map

        this.object = new THREE.Object3D();
        this.object.position.set(0, 0, 0);

        this.size = mapData.size;
        this.unitList = [];

        this.createEmptyMap();

        this.unitIDList = mapData.unitIDList;// get unit ID list from server
        this.loader = new THREE.TextureLoader();// texture loader
        this.GLTFLoader = new THREE.GLTFLoader();// OBJ loader
        this.loadModel(this, 0, data); // Load GLTF Model, including afterLoadFunction()
    }

    // For Map Change
    loadNewMap(mapData){
        this.size = mapData.size;
        this.unitList = [];
        this.createEmptyMap();
        this.spawnMap(mapData.dataSpace);
    }

    // After Load Function
    afterLoadFunction(data){
        this.spawnMap(data.map.dataSpace);
        scene.add(this.object);
        afterMapEvent(data);
    }

    // Loading The Model Using Imported Module
    loadModel(scope, index, data) {
        console.log(index)
        let unitIDInfo = scope.unitIDList[index];
        let texture;

        switch(unitIDInfo.typeInfo.type){
            case "plane":
                unitIDInfo["geometry"] = planeGeometry;
                console.log("image/unit_material/" + unitIDInfo.fileName[0])
                texture = scope.loader.load("image/unit_material/" + unitIDInfo.fileName[0]);
                if (unitIDInfo.IsPhongMaterial){
                    unitIDInfo["material"] =  new THREE.MeshPhongMaterial({map: texture});
                    unitIDInfo["transparentMaterial"] = new THREE.MeshPhongMaterial({map: texture, transparent: true, opacity: 0.2});
                }else{
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
                    if (unitIDInfo.IsPhongMaterial){
                        materials.push(new THREE.MeshPhongMaterial({map: texture}));
                        transparentMaterial.push(new THREE.MeshPhongMaterial({map: texture, transparent: true, opacity: 0.2}));
                    }else{
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
                    if (newModel.material != null){
                        unitIDInfo["transparentMaterial"] = newModel.material.clone();
                        unitIDInfo.transparentMaterial.transparent = true;
                        unitIDInfo.transparentMaterial.opacity = 0.2;
                    }else{
                        unitIDInfo["transparentMaterial"] = null;
                    }



                    if (scope.unitIDList.length > index + 1){
                        scope.loadModel(scope, index + 1, data)
                    } else {
                        scope.afterLoadFunction(data);
                    }
                });
                return;
        }


        if (scope.unitIDList.length > index + 1){
            scope.loadModel(scope, index + 1, data)
        } else {
            scope.afterLoadFunction(data);
        }
    }

    // Generating A Completely Empty Map
    createEmptyMap() {
        for (let i = 0; i < this.size.y; i++) {
            this.unitList.push(new Array(this.size.x));
        }
    }

    // Check If Within Map Rnage
    IsNotInMapRange(floatX, floatY){
        return this.size.x <= floatX || 0 > floatX || this.size.y <= floatY || 0 > floatY;
    }

    // Return The Unit Based On xy Coordinate
    getUnit([mapX, mapY]){
        if (this.IsNotInMapRange(mapX, mapY)) return null;
        return this.unitList[mapY][mapX];
    }

    // Creating Client Side Blocks
    spawnMap(dataSpace){
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
    spawnUnit(unitClass){
        //let height = unitClass.height;


        let unitInfo = this.unitIDList[unitClass.ID];

        let mesh = new THREE.Mesh(unitInfo.geometry, unitInfo.material);


        if (unitClass.height > 6 && unitInfo.typeInfo.type == "block"){
            mesh.scale.z = unitClass.height / 6;
        }

            //if (this.unitIDList[unitClass.ID].geometryType == 1){
                //console.log(material)

              //let newMaterial = []
              //for (let i = 0; i < material.length; ++i){
                //newMaterial.push(material[i].clone())
              //}
              //material = newMaterial;
                /*
                geometry.attributes.uv.array = new Float32Array([
                    0, height, height,
                    height, 0, 0,
                    height, 0, 0, 
                    height, height, height, 
                    0, 0, height, 
                    0, 0, height, 
                    height, height, 0, 
                    0, height, 0, 
                    0, height, height, 
                    height, 0, 0, 
                    height, 0, 0, 
                    height, height, height, 
                    0, 0, height, 
                    0, 0, height, 
                    height, height, 0, 
                    0, height, 0]);
                /*
                geometry.faceVertexUvs[0][0] = [new THREE.Vector2(0,1), new THREE.Vector2(0,height), new THREE.Vector2(1, 1)];
                geometry.faceVertexUvs[0][1] = [new THREE.Vector2(0,height), new THREE.Vector2(1,height), new THREE.Vector2(1, 1)];
                geometry.faceVertexUvs[0][2] = [new THREE.Vector2(1,1), new THREE.Vector2(1,height), new THREE.Vector2(1, 1)];
                geometry.faceVertexUvs[0][3] = [new THREE.Vector2(1,height), new THREE.Vector2(1,height), new THREE.Vector2(1, 1)];
                geometry.faceVertexUvs[0][4] = [new THREE.Vector2(0,height), new THREE.Vector2(0,height), new THREE.Vector2(1, height)];
                geometry.faceVertexUvs[0][5] = [new THREE.Vector2(0,height), new THREE.Vector2(1,height), new THREE.Vector2(1, height)];
                geometry.faceVertexUvs[0][6] = [new THREE.Vector2(1,height), new THREE.Vector2(1,height), new THREE.Vector2(1, height)];
                geometry.faceVertexUvs[0][7] = [new THREE.Vector2(1,height), new THREE.Vector2(1,height), new THREE.Vector2(1, height)];
                geometry.faceVertexUvs[0][8] = [new THREE.Vector2(0,height), new THREE.Vector2(0,0), new THREE.Vector2(1, height)];
                geometry.faceVertexUvs[0][9] = [new THREE.Vector2(0,0), new THREE.Vector2(1,0), new THREE.Vector2(1, height)];
                geometry.faceVertexUvs[0][10] = [new THREE.Vector2(1,height), new THREE.Vector2(1,0), new THREE.Vector2(1, height)];
                geometry.faceVertexUvs[0][11] = [new THREE.Vector2(1,0), new THREE.Vector2(1,0), new THREE.Vector2(1, height)];
                */
            //}



                        /*

            mesh = new THREE.Mesh(geometry, material); 
            //mesh.toStatic();    
        } else if(this.unitIDList[unitClass.ID].modelType != null) {
            mesh = this.unitIDList[unitClass.ID].modelType.clone();
        } else {
            return;
        }*/

        // Adding Unit To Parent
        this.object.add(mesh);
        unitClass.mesh = mesh;
        mesh.position.set(unitClass.x, unitClass.y, unitClass.height);

        if (unitClass.childID != 0){
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



    
    // return true when deletion successful
    /*
    deleteUnit([[mapX, mapY], replaceUnitInfo]){ 
        let theBlock = this.getBlock([mapX, mapY]);
        if (theBlock != null && theBlock.class != null){
            let [x, y] = [mapX % this.blockSize.x, mapY % this.blockSize.y];
            let unit = theBlock.class.unitList[y][x];

            // If The Block Is Not null
            if (theBlock.block != null){
                this.removeAllChildUnit(unit.mesh);
                theBlock.block.remove(unit.mesh);
            }
            
            // If ReplaceUnitInfo Is Valid
            if (replaceUnitInfo.ID != null){
                unit.ID = replaceUnitInfo.ID;
                unit.Height = replaceUnitInfo.Height;
                unit.childUnit = replaceUnitInfo.childUnit;
                if (theBlock.block != null) this.spawnUnit(x, y, unit, theBlock.block);
            } else {
                unit.mesh = null;
            }

            return true;
        } else {
            return false;
        }
    }*/

    // Remove All Child Units
    /*
    removeAllChildUnit(parent){
        for (var i = parent.children.length - 1; i >= 0; i--) {
            this.removeAllChildUnit(parent.children[i]);
            parent.remove(parent.children[i]);
        }
    }*/

}