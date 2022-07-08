// mapX, mapY - Relative To The Entire Map, Use To Access Any Unit
// unitX, unitY - Relative To The Quarter Map, To Select A Unit In The Quarter Map
// blockX, blockY - Relative To The Quarter Map, To Select A Block In The Quarter Map

// Map Class
class map {
    // Constructor
    constructor([serverBlocks, blockNumber, blockSize, unitIDList]) {
        this.object = new THREE.Object3D();
        this.object.position.set(0, 0, 0);
        //this.spawnMap(serverMapClass);
        this.blockSize = blockSize;

        this.blockNumber =  blockNumber;

        this.blockList = [];
        this.createEmptyMap();

        this.unitIDList = unitIDList;// get unit ID list from server
        this.loader = new THREE.TextureLoader();// texture loader
        this.materialList = []; // Material List
        this.geometryList = []; // Geometry List
        this.loadMaterials(); // Load Materials
        this.loadGeometry(); // Load Geometry

        this.blockObjectClass = [];
        this.newBlockObjectClass = [];

        this.spawnBlocks(serverBlocks);
        scene.add(this.object);
    }

    // For Each Unit ID, Load Materials
    loadMaterials(){

        this.materialList.length = this.unitIDList.length;
        for (let i = 0; i < this.unitIDList.length; i++) {
            let texture;
            if (this.unitIDList[i].texture.length == 1){
                texture = this.loader.load(this.unitIDList[i].texture[0]);
                this.materialList[i] =  new THREE.MeshPhongMaterial({map: texture});

            } else {// for multi material
                let materials = [];
                for (let ii = 0; ii < this.unitIDList[i].texture.length; ii++) {
                    texture = this.loader.load(this.unitIDList[i].texture[ii]);
                    materials.push(new THREE.MeshPhongMaterial({map: texture}))
                }
                this.materialList[i] =  materials;
            }
        }
    }

    // Load THREE Geometry For Map
    loadGeometry(){
        var geometry;
        geometry = new THREE.PlaneGeometry(1, 1); // geometry for all plane
        this.geometryList.push(geometry); //0

        //******************************************************************
        geometry = new THREE.BoxGeometry(1, 1, 6); // geometry for all cubes
        this.geometryList.push(geometry); //1
    }

    // Generating A Completely Empty Map
    createEmptyMap() {
        for (let i = 0; i < this.blockNumber.y; i++) {
            this.blockList.push(new Array(this.blockNumber.x));
        }
    }

    // Converting xy Coordinate To Block Coordinate
    mapPosToBlockPos([mapX, mapY]){
        return [mapY / this.blockSize.y >> 0, mapX / this.blockSize.x >> 0];
    }

    // Return Block Based On xy Coordinate
    getBlock([mapX, mapY]){
        let [floatBlockX, floatBlockY] = [mapX / this.blockSize.x, mapY / this.blockSize.y];
        if (this.blockNumber.x <= floatBlockX || 0 > floatBlockX || this.blockNumber.y <= floatBlockY || 0 > floatBlockY) return null;
        return this.blockList[floatBlockY >> 0][floatBlockX >> 0];
    }

    // Return The Unit Based On xy Coordinate
    getUnit([mapX, mapY]){
        let theBlock = this.getBlock([mapX, mapY]);
        if (theBlock == null || theBlock.class == null) return null;
        return  theBlock.class.unitList[mapY % this.blockSize.y][mapX % this.blockSize.x];
    }

    // return true when deletion successful
    deleteUnit([[mapX, mapY], replaceUnitInfo]){ 

        let theBlock = this.getBlock([mapX, mapY]);
        if (theBlock != null && theBlock.class != null){
            let [x, y] = [mapX % this.blockSize.x, mapY % this.blockSize.y];
            let unit = theBlock.class.unitList[y][x];


            if (theBlock.block != null){
                theBlock.block.remove(unit.mesh);
            }
        
            if (replaceUnitInfo.ID != null){
                unit.ID = replaceUnitInfo.ID;
                unit.Height = replaceUnitInfo.Height;
                if (theBlock.block != null) this.spawnUnit(x, y, unit, theBlock.block);
            }else{
                unit.mesh = null;
            }

            return true;
        }else{
            return false;
        }
        
    }

    // Creating Client Side Blocks
    spawnBlocks(blockInfoList){
        for (let i = 0; i < blockInfoList.length; i++) {
            this.spawnBlock(blockInfoList[i].x, blockInfoList[i].y, blockInfoList[i].block);
        }
    }

    // Creating Client Side Block
    spawnBlock(x, y, blockClass){
        if (this.blockList[y][x] == null && this.blockNumber.x > x && this.blockNumber.y > y){
            this.blockList[y][x] = {
                class: blockClass,
                block: null,
                view: false,
                mesh: null
            };

            this.spawnBlockObject(x, y);
        }
    }

    // Creating Client Side Block
    spawnBlockObject(x, y){
        let theBlock = this.blockList[y][x];
        if (theBlock != null){
            if (theBlock.block == null){
                var block = new THREE.Object3D();
                let blockClass = theBlock.class;
                
                block.position.set(x * blockClass.unitList.length, y * blockClass.unitList[0].length, 0);
                
                // Double For Loop To Spawn Each Unit Within The Block
                for (let y_Axis = 0; y_Axis < blockClass.unitList.length; y_Axis++) {
                    for (let x_Axis = 0; x_Axis < blockClass.unitList[y_Axis].length; x_Axis++) {
                        this.spawnUnit(x_Axis, y_Axis, blockClass.unitList[y_Axis][x_Axis], block);
                    }
                }

                // Adding New Block Into The Entire Map
                this.object.add(block);
                this.blockList[y][x].block = block;
                this.blockObjectClass.push(this.blockList[y][x]);
            }

            // Setting Its View Tag To True
            this.blockList[y][x].view = true;
        }
    }

    // Creating Client Side Unit
    spawnUnit(x, y, unitClass, block){
        let geometry = this.geometryList[this.unitIDList[unitClass.ID].geometryType];
        let material = this.materialList[unitClass.ID];
        
        let mesh = new THREE.Mesh(geometry, material);
        block.add(mesh);
        unitClass.mesh = mesh;
        mesh.position.set(x, y, unitClass.Height);

    }


    // Removing A Block (No Longer Render This Block)
    deleteBlock(block){
        // Remove All Child Object
        var obj;
        for (var i = block.children.length - 1; i >= 0; i--) { 
            obj = block.children[i];
            block.remove(obj); 
        }
        this.object.remove(block);
    }
}