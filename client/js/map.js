// mapX, mapY - Relative To The Entire Map, Use To Access Any Unit
// unitX, unitY - Relative To The Quarter Map, To Select A Unit In The Quarter Map
// blockX, blockY - Relative To The Quarter Map, To Select A Block In The Quarter Map

// Map Class
class map {
    // Constructor
    constructor([serverBlocks, quarterSize2D, blockSize2D, unitIDList]) {
        this.object = new THREE.Object3D();
        this.object.position.set(0, 0, 0);
        //this.spawnMap(serverMapClass);
        this.blockSize = {
            x: blockSize2D[0],
            y: blockSize2D[1]
        }

        this.quarterSize2D = {
            x: quarterSize2D[0],
            y: quarterSize2D[1],
        };

        this.spaceArray = {
            pp: new quarterMap([1, 1], quarterSize2D),
            pn: new quarterMap([1, -1], quarterSize2D),
            np: new quarterMap([-1, 1], quarterSize2D),
            nn: new quarterMap([-1, -1], quarterSize2D),
        };




        
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

        
        /*
        let material = new THREE.MeshBasicMaterial({
            map: this.loader.load(texture),
            });*/
    }

    // for each unit ID, load materials
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

    loadGeometry(){
        var geometry;
        geometry = new THREE.PlaneGeometry(1, 1); // geometry for all plane
        this.geometryList.push(geometry); //0

        //******************************************************************
        geometry = new THREE.BoxGeometry(1, 1, 3); // geometry for all cubes
        /*
        var face1 = [
        new THREE.Vector2(0, .666),
        new THREE.Vector2(.5, .666),
        new THREE.Vector2(.5, 1),
        new THREE.Vector2(0, 1)];
        
        var face2 = [
        new THREE.Vector2(.5, .666),
        new THREE.Vector2(1, .666),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(.5, 1)];
        
        var face3 = [
        new THREE.Vector2(0, .333),
        new THREE.Vector2(.5, .333),
        new THREE.Vector2(.5, .666),
        new THREE.Vector2(0, .666)];
        
        var face4 = [
        new THREE.Vector2(.5, .333),
        new THREE.Vector2(1, .333),
        new THREE.Vector2(1, .666),
        new THREE.Vector2(.5, .666)];
        
        var face5 = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(.5, 0),
        new THREE.Vector2(.5, .333),
        new THREE.Vector2(0, .333)];
        
        var face6 = [
        new THREE.Vector2(.5, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, .333),
        new THREE.Vector2(.5, .333)];

        console.log(geometry);

        geometry.faceVertexUvs[0][0] = [ face1[0], face1[1], face1[3] ];
        geometry.faceVertexUvs[0][1] = [ face1[1], face1[2], face1[3] ];

        geometry.faceVertexUvs[0][2] = [ face2[0], face2[1], face2[3] ];
        geometry.faceVertexUvs[0][3] = [ face2[1], face2[2], face2[3] ];

        geometry.faceVertexUvs[0][4] = [ face3[0], face3[1], face3[3] ];
        geometry.faceVertexUvs[0][5] = [ face3[1], face3[2], face3[3] ];

        geometry.faceVertexUvs[0][6] = [ face4[0], face4[1], face4[3] ];
        geometry.faceVertexUvs[0][7] = [ face4[1], face4[2], face4[3] ];

        geometry.faceVertexUvs[0][8] = [ face5[0], face5[1], face5[3] ];
        geometry.faceVertexUvs[0][9] = [ face5[1], face5[2], face5[3] ];

        geometry.faceVertexUvs[0][10] = [ face6[0], face6[1], face6[3] ];
        geometry.faceVertexUvs[0][11] = [ face6[1], face6[2], face6[3] ];
            */
        this.geometryList.push(geometry); //1
    }

    unit2DToBlock2D([unitX, unitY]){
        return [Math.floor(Math.abs(unitX) / this.blockSize.x), Math.floor(Math.abs(unitY) / this.blockSize.y)];
    }


    getBlockByQuarter([blockX, blockY], theQuarterMap) {
        if (theQuarterMap != null && theQuarterMap.blockList != null && this.quarterSize2D.x > blockX && this.quarterSize2D.y > blockY){
            return theQuarterMap.blockList[Math.abs(blockY)][Math.abs(blockX)];
        }else{
            return null;
        }
    }
 
    
    getUnit([mapX, mapY]){
        let unitX = (mapX < 0) ? -mapX - 1 : mapX;
        let unitY = (mapY < 0) ? -mapY - 1 : mapY;

        let theBlock = this.getBlockByQuarter(this.unit2DToBlock2D([unitX, unitY]), this.getQuarterMap([mapX, mapY]));
        if (theBlock != null && theBlock.class != null){
            return theBlock.class.unitList[Math.abs(unitY) % this.blockSize.y][Math.abs(unitX) % this.blockSize.x];
        }else{
            return null;
        }
        
    }

    // Return The Direction QuarterMap
    getQuarterMap([directionX, directionY]){
        var selectArray;
        
        if (directionX >= 0 && directionY >= 0) {
            selectArray = this.spaceArray.pp;
        } else if (directionX >= 0 && directionY < 0) {
            selectArray = this.spaceArray.pn;
        } else if (directionX < 0 && directionY >= 0) {
            selectArray = this.spaceArray.np;
        } else if (directionX < 0 && directionY < 0) {
            selectArray = this.spaceArray.nn;
        }

        return selectArray;
    }

    // Creating Client Side Map
    spawnMap(serverMapClass){
        this.spawnQuarterMap(serverMapClass.spaceArray.pp);
        this.spawnQuarterMap(serverMapClass.spaceArray.pn);
        this.spawnQuarterMap(serverMapClass.spaceArray.np);
        this.spawnQuarterMap(serverMapClass.spaceArray.nn);
    }

    // Creating Client Side QuarterMap
    spawnQuarterMap(quarterClass){
        for (let y_Axis = 0; y_Axis < quarterClass.blockList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < quarterClass.blockList[y_Axis].length; x_Axis++) {
                this.spawnBlock(x_Axis, y_Axis, quarterClass.direction, quarterClass.blockList[y_Axis][x_Axis]);
            }
        }
    }

    // Creating Client Side Blocks
    spawnBlocks(blockInfoList){
        for (let i = 0; i < blockInfoList.length; i++) {
            this.spawnBlock(blockInfoList[i].x, blockInfoList[i].y, blockInfoList[i].direction, blockInfoList[i].block);
        }
    }

    // Creating Client Side Block
    spawnBlock(x, y, direction, blockClass){
        var theQuarterMap = this.getQuarterMap([direction.x, direction.y]);
        if (theQuarterMap.blockList[y][x] == null && this.quarterSize2D.x > x && this.quarterSize2D.y > y){
            theQuarterMap.blockList[y][x] = {
                class: blockClass,
                block: null,
                view: false
            };

            this.spawnBlockObject(x, y, [direction.x, direction.y]);
        }
    }

    // Creating Client Side Block
    spawnBlockObject(x, y, direction){
        var theQuarterMap = this.getQuarterMap([direction[0], direction[1]]);
        if (theQuarterMap.blockList[y][x] != null){
            if (theQuarterMap.blockList[y][x].block == null){
                var block = new THREE.Object3D();
                let offX = (direction[0] == -1) ? -1 : 0;
                let offY = (direction[1] == -1) ? -1 : 0;

                let blockClass = theQuarterMap.blockList[y][x].class;
                
                block.position.set(offX + direction[0] * x * blockClass.unitList.length, offY + direction[1] * y * blockClass.unitList[0].length, 0);
                
                // Double For Loop To Spawn Each Unit Within The Block
                for (let y_Axis = 0; y_Axis < blockClass.unitList.length; y_Axis++) {
                    for (let x_Axis = 0; x_Axis < blockClass.unitList[y_Axis].length; x_Axis++) {
                        this.spawnUnit(direction[0] * x_Axis, direction[1] * y_Axis, blockClass.unitList[y_Axis][x_Axis], block);
                    }
                }

                // Adding New Block Into The Entire Map
                this.object.add(block);
                theQuarterMap.blockList[y][x].block = block;
                this.blockObjectClass.push(theQuarterMap.blockList[y][x]);
            }

            // Setting Its View Tag To True
            theQuarterMap.blockList[y][x].view = true;
        }
    }

    // Creating Client Side Unit
    spawnUnit(x, y, unitClass, block){
        let geometry = this.geometryList[this.unitIDList[unitClass.ID].geometryType];
        let material = this.materialList[unitClass.ID];
            
            //new THREE.MeshBasicMaterial({color: new THREE.Color(unitClass.color3D[0] * colorHeight, unitClass.color3D[1] * colorHeight, unitClass.color3D[2] * colorHeight)});
        let mesh = new THREE.Mesh(geometry, material);
        block.add(mesh);
        mesh.position.set(x, y, unitClass.Height);
    }

    // Removing A Block (No Longer Render This Block)
    deleteBlock(block){
        // Remove All Child Object
        var obj;
        for (var i = block.children.length - 1; i >= 0; i--) { 
            obj = block.children[i];
            //obj.geometry.dispose();
            //obj.material.dispose();
            block.remove(obj); 
        }
        this.object.remove(block);
    }
}

// Client Side quarterMap Class;
class quarterMap{
    constructor(direction, quarterSize2D) {
        this.blockList = [];

        // Direction Is Either 1 Or -1
        this.direction = {
            x: direction[0],
            y: direction[1]
        }
        this.makeQuarterMap(quarterSize2D[0], quarterSize2D[1]);
    }

    // Create A Empty 2D Array
    makeQuarterMap(x, y) {
        for (let i = 0; i < y; i++) {
            this.blockList.push(new Array(x));
        }
    }

    // Resizing The Number Of Blocks In A QuarterMap
    setQuarterSize(x, y){
        this.blockList.length = y;
        for (let i = 0; i < this.blockList.length; i++) {
            this.blockList[i].length = x;
        }
    }
}
