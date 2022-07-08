// Server Side Map Class
// quarterSize2D - How Many Block Are In A QuarterMap
// blockSize2D - The Size Of The Block (Number Of Unit)
class map {
    constructor(quarterSize2D, blockSize2D) {
        this.unitIDList = [

            this.setUnitIDInfo(["image/unit_material/0_ground.jpg"], false, 0),

            this.setUnitIDInfo(["image/unit_material/0_ground.jpg",
                                "image/unit_material/0_ground.jpg",
                                "image/unit_material/0_ground.jpg",
                                "image/unit_material/0_ground.jpg",
                                "image/unit_material/1_wall.jpg",
                                "image/unit_material/1_wall.jpg"], true, 1)
            



        ];

        


        // This PerlinNoise Function Is Imported From Outside Source
        this.PerlinNoise = new function() {
            // Similar To A Randomized Seed For PerlinNoise
            this.initX = Math.floor(Math.random() * 255);
            this.initY = Math.floor(Math.random() * 255);

            this.noise = function(x, y, z) {
                // Variable Declaration
                var p = new Array(512);
                var permutation = [151, 160, 137, 91, 90, 15, 
                131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 
                190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 
                88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 
                77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 
                102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 
                135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 
                5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 
                223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 
                129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 
                251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 
                49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 
                138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
                ];
                
                // p Is An Array Consist Of Two Copies Of Permutation
                for (var i = 0; i < 256 ; i++)
                    p[256 + i] = p[i] = permutation[i]; 
            
                var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
                    Y = Math.floor(y) & 255,                  // CONTAINS POINT.
                    Z = Math.floor(z) & 255;

                x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
                y -= Math.floor(y);                                // OF POINT IN CUBE.
                z -= Math.floor(z);

                var u = fade(x),                                // COMPUTE FADE CURVES
                    v = fade(y),                                // FOR EACH OF X,Y,Z.
                    w = fade(z);

                var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
                    B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,
            
                return scale(lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                                grad(p[BA  ], x-1, y  , z   )), // BLENDED
                                        lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                                grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                                lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                                grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                                        lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                                grad(p[BB+1], x-1, y-1, z-1 )))));
            }
            function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
            function lerp( t, a, b) { return a + t * (b - a); }
            function grad(hash, x, y, z) {
                var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
                var u = h < 8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
                        v = h < 4 ? y : h == 12 || h == 14 ? x : z;
                return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
            } 
            function scale(n) { return (1 + n)/2; }
        }

        // Save The Block Size
        this.blockSize2D = {
            x: blockSize2D[0],
            y: blockSize2D[1],
        };

        this.quarterSize2D = {
            x: quarterSize2D[0],
            y: quarterSize2D[1],
        };

        // QuarterMap
        this.spaceArray = {
            pp: new quarterMap([1, 1], quarterSize2D, blockSize2D, this.PerlinNoise),
            pn: new quarterMap([1, -1], quarterSize2D, blockSize2D, this.PerlinNoise),
            np: new quarterMap([-1, 1], quarterSize2D, blockSize2D, this.PerlinNoise),
            nn: new quarterMap([-1, -1], quarterSize2D, blockSize2D, this.PerlinNoise),
        };
    }


    neighbors([mapX, mapY]){
        let neighborList = [];
        let theUnit;

        let dirSwitch = [false, false, false, false];

        theUnit = this.getUnit([mapX + 1, mapY]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX + 1, mapY]);
            dirSwitch[0] = true;

        }

        theUnit = this.getUnit([mapX - 1, mapY]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX - 1, mapY]);
            dirSwitch[1] = true;
        }

        theUnit = this.getUnit([mapX, mapY + 1]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX, mapY + 1]);
            dirSwitch[2] = true;
        }

        theUnit = this.getUnit([mapX, mapY - 1]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX, mapY - 1]);
            dirSwitch[3] = true;
        }





        if (dirSwitch[0]){
            if (dirSwitch[2]){
                theUnit = this.getUnit([mapX + 1, mapY + 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX + 1, mapY + 1]);
                }
            }

            if (dirSwitch[3]){
                theUnit = this.getUnit([mapX + 1, mapY - 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX + 1, mapY - 1]);
                }
            }
        }

        
        if (dirSwitch[1]){
            if (dirSwitch[2]){
                theUnit = this.getUnit([mapX - 1, mapY + 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX - 1, mapY + 1]);
                }
            }
    
            if (dirSwitch[3]){
                theUnit = this.getUnit([mapX - 1, mapY - 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX - 1, mapY - 1]);
                }
            }
        }
        

        return neighborList;
    }

    // set UnitIDInfo by (texture url address, collision bool)
    setUnitIDInfo(texture, collision, geometryType){
        var unitIDInfo = {
            texture: texture, // texture url address
            collision: collision, //true or false
            geometryType: geometryType
        }
        return unitIDInfo
    }


    map2DToBlock2D([mapX, mapY]){
        let unitX = (mapX < 0) ? -mapX - 1 : mapX;
        let unitY = (mapY < 0) ? -mapY - 1 : mapY;
        return this.unit2DToBlock2D([unitX, unitY]);
    }

    unit2DToBlock2D([unitX, unitY]){
        return [Math.floor(Math.abs(unitX) / this.blockSize2D.x), Math.floor(Math.abs(unitY) / this.blockSize2D.y)];
    }
    
    // Return The QuarterMap Based On xy Coordinate
    getQuarterMap([mapX, mapY]){
        if (mapX >= 0 && mapY >= 0) {
            return this.spaceArray.pp;
        } else if (mapX >= 0 && mapY < 0) {
            return this.spaceArray.pn;
        } else if (mapX < 0 && mapY >= 0) {
            return this.spaceArray.np;
        } else if (mapX < 0 && mapY < 0) {
            return this.spaceArray.nn;
        }
    }

    getQuarterMapByInt([directionX, directionY]){
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

    // Return The Block Based On The Block xy Coordinate
    getBlockByQuarter([blockX, blockY], theQuarterMap) {
        if (theQuarterMap != null && theQuarterMap.blockList != null && this.quarterSize2D.x > blockX && this.quarterSize2D.y > blockY){
            return theQuarterMap.blockList[Math.abs(blockY)][Math.abs(blockX)];
        } else {
            return null;
        }
    }

    getBlock([mapX, mapY]){
        return this.getBlockByQuarter(this.map2DToBlock2D([mapX, mapY]),this.getQuarterMap([mapX, mapY]));
    }

    // Return The Unit Based On xy Coordinate
    getUnit([mapX, mapY]){
        let unitX = (mapX < 0) ? -mapX - 1 : mapX;
        let unitY = (mapY < 0) ? -mapY - 1 : mapY;

        let theBlock = this.getBlockByQuarter(this.unit2DToBlock2D([unitX, unitY]), this.getQuarterMap([mapX, mapY]));
        if (theBlock != null){
            return theBlock.unitList[Math.abs(unitY) % this.blockSize2D.y][Math.abs(unitX) % this.blockSize2D.x];
        }else{
            return null;
        }
        
    }

    


    getInitMap([mapX, mapY], [blockHalfRangeX, blockHalfRangeY]){

        let sendingBlock = [];
        for (let y_Axis = -blockHalfRangeY; y_Axis <= blockHalfRangeY; y_Axis++) {
            for (let x_Axis = -blockHalfRangeX; x_Axis <= blockHalfRangeX; x_Axis++) {



                let [newMapX, newMapY] = [mapX + x_Axis * this.blockSize2D.x, mapY + y_Axis * this.blockSize2D.y];
  
                let [blockX, blockY] = this.map2DToBlock2D([newMapX, newMapY]);

                if (this.quarterSize2D.x > blockX && this.quarterSize2D.y > blockY){
                    let theQuarterMap = this.getQuarterMap([newMapX, newMapY]);


                    let blockInfo = {
                        x: blockX,
                        y: blockY,
                        direction: theQuarterMap.direction,
                        block: {unitList: theQuarterMap.blockList[blockY][blockX].unitList}
                    }
                    sendingBlock.push(blockInfo);
                }
            }
        }
        return [sendingBlock, [this.quarterSize2D.x, this.quarterSize2D.y], [this.blockSize2D.x,this.blockSize2D.y], this.unitIDList];
    }

    getUpdateBlock(blockPosList){

        let sendingBlock = [];
        for (let i = 0; i < blockPosList.length; i++) {
                let theQuarterMap = this.getQuarterMapByInt(blockPosList[i].direction);

                let blockX = blockPosList[i].position[0];
                let blockY = blockPosList[i].position[1];

                let blockInfo = {
                    x: blockX,
                    y: blockY,
                    direction: theQuarterMap.direction,
                    block: {unitList: theQuarterMap.blockList[blockY][blockX].unitList}
                }
                sendingBlock.push(blockInfo);

        }
        return [sendingBlock,[this.quarterSize2D.x, this.quarterSize2D.y],[this.blockSize2D.x,this.blockSize2D.y]];
    }

    

    

    // Adding Additional Block
    /*
    addBlock([blockX, blockY]) {
        let theQuarterMap =  getQuarterMap(blockX, blockY);
        theQuarterMap.blockList[blockY][blockX] = new block(blockX, blockY, this.PerlinNoise);
    }*/
}

// Map QuarterMap
class quarterMap{
    constructor(direction, quarterSize2D, blockSize2D, PerlinNoise) {
        this.blockList = [];
        // Direction Is Either 1 Or -1
        this.direction = {
            x: direction[0],
            y: direction[1]
        }
        this.makeQuarterMap(quarterSize2D[0], quarterSize2D[1]);
        this.initQuarterMap(blockSize2D, PerlinNoise);
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
        for(let i = 0; i < y; i++) {
            this.blockList[i].length = x;
        }
    }

    // Double For Loop To Generate The Block
    initQuarterMap(blockSize2D, PerlinNoise){
        for (let y_Axis = 0; y_Axis < this.blockList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < this.blockList[y_Axis].length; x_Axis++) {
                this.blockList[y_Axis][x_Axis] = new block(x_Axis, y_Axis, this.direction, blockSize2D, PerlinNoise);
            }
        }
    }

}

// Map Block Class
class block{
    constructor(x, y, direction, blockSize2D, PerlinNoise) {
        this.unitList = [];
        this.projectileList = [];
        this.makeBlock(blockSize2D[0], blockSize2D[1]);
        this.initBlock(x, y, direction, PerlinNoise);
    }

    // Create An Empty Block
    makeBlock(x, y) {
        for (let i = 0; i < y; i++) {
            this.unitList.push(new Array(x));
        }
    }

    // Resize The Block
    setBlockSize(x, y){
        this.unitList.length = y;
        for (let i = 0; i < y; i++) {
            this.unitList[i].length = x;
        }
    }

    // To Create The Units Inside The Block
    initBlock(x, y, direction, PerlinNoise){
        for (let y_Axis = 0; y_Axis < this.unitList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < this.unitList[y_Axis].length; x_Axis++) {
                var ID = 1;
                var Height = (2 - PerlinNoise.noise((PerlinNoise.initX + (x * this.unitList[0].length + x_Axis) * direction.x) / 10 , (PerlinNoise.initY + (y * this.unitList.length + y_Axis) * direction.y) / 10, 0.1) * 4) *3;
                if (Height < 0) {
                    Height = 0;
                    ID = 0;
                }else if (Height > 3){
                    Height = 3;
                }


                //let color = [Math.random(), Math.random(), Math.random()];
                /*
                if (x_Axis == 0|| y_Axis == 0 || x_Axis == this.unitList[y_Axis].length-1 || y_Axis == this.unitList.length-1 ){
                    color = [1,0,0];
                    colorHeight = 0.01;
                }*/


                this.unitList[y_Axis][x_Axis] = {
                    ID: ID,
                    Height: Height,
                };

            }
        }
    }
}

// Required Because server.js Uses This JavaScript File
module.exports = map;