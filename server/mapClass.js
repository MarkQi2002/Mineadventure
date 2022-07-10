// Server Side Map Class
// blockNumber - How Many Block Are In A QuarterMap
// blockSize - The Size Of The Block (Number Of Unit)
class map {
    constructor(blockNumber, blockSize) {
        // Set Unit ID List Information
        this.unitIDList = [
            this.setUnitIDInfo(["image/unit_material/0_ground.jpg"], false, false, true, 0),
            this.setUnitIDInfo(["image/unit_material/0_ground.jpg",
                                "image/unit_material/0_ground.jpg",
                                "image/unit_material/0_ground.jpg",
                                "image/unit_material/0_ground.jpg",
                                "image/unit_material/1_wall.jpg",
                                "image/unit_material/1_wall.jpg"], true, true, false, 1),
            this.setUnitIDInfo(["image/unit_material/test.jpg"], false, true, false, 0),
        ];

        // Save Block Size
        this.blockSize = {
            x: blockSize[0],
            y: blockSize[1],
        };
        
        // Save Block Number
        this.blockNumber = {
            x: blockNumber[0],
            y: blockNumber[1],
        };

        // Save Map Level (Multiple Map Level)
        this.mapLevel;
    }

    createMapLevel(){
        // Save Map Level (Multiple Map Level)
        this.mapLevel = [new mapLevel(this.blockNumber, this.blockSize, this),
                         new mapLevel(this.blockNumber, this.blockSize, this),
                         new mapLevel(this.blockNumber, this.blockSize, this)
                        ];
    }

    // set UnitIDInfo by (texture url address, collision bool)
    setUnitIDInfo(texture, collision, destroyable, base, geometryType) {
        var unitIDInfo = {
            texture: texture, // texture url address
            collision: collision, // Can Walk through (true or false)
            destroyable: destroyable, // Can be destroyed (true or false)
            base: base, // Can have childUnit On (true or false)
            geometryType: geometryType
        }
        return unitIDInfo
    }

    // Find Neighboring Map Blocks
    neighbors([mapX, mapY], mapLevelIndex){
        let neighborList = [];
        
        let theUnit;

        let dirSwitch = [false, false, false, false];

        // Get Direction Switch
        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX + 1, mapY]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX + 1, mapY]);
            dirSwitch[0] = true;
        }

        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX - 1, mapY]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX - 1, mapY]);
            dirSwitch[1] = true;
        }

        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX, mapY + 1]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX, mapY + 1]);
            dirSwitch[2] = true;
        }

        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX, mapY - 1]);
        if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
            neighborList.push([mapX, mapY - 1]);
            dirSwitch[3] = true;
        }

        // Seting neighborList Based On Direction Switch
        if (dirSwitch[0]){
            if (dirSwitch[2]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX + 1, mapY + 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX + 1, mapY + 1]);
                }
            }

            if (dirSwitch[3]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX + 1, mapY - 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX + 1, mapY - 1]);
                }
            }
        }

        // Setting neightborList Based On Direction Switch
        if (dirSwitch[1]){
            if (dirSwitch[2]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX - 1, mapY + 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX - 1, mapY + 1]);
                }
            }
    
            if (dirSwitch[3]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX - 1, mapY - 1]);
                if (theUnit != null && this.unitIDList[theUnit.ID].collision == false){
                    neighborList.push([mapX - 1, mapY - 1]);
                }
            }
        }
        
        // Return neightborList To Caller
        return neighborList;
    }

    // Function To Initialize The Block And Package It To Send To Client
    getInitMap([mapX, mapY], mapLevelIndex, [blockHalfRangeX, blockHalfRangeY]) {
        let  [centerBlockX, centerBlockY] = [mapX / this.blockSize.x >> 0, mapY / this.blockSize.y >> 0];
        let sendingBlock = [];
        let theBlock;
        for (let y_Axis = -blockHalfRangeY; y_Axis <= blockHalfRangeY; y_Axis++) {
            for (let x_Axis = -blockHalfRangeX; x_Axis <= blockHalfRangeX; x_Axis++) {

                let [blockX, blockY] = [centerBlockX + x_Axis, centerBlockY + y_Axis];

                if (blockX < 0 || blockX >= this.blockNumber.x || blockY < 0 || blockY >= this.blockNumber.y) continue;
                
                theBlock = this.mapLevel[mapLevelIndex].blockList[blockY][blockX];

                if (theBlock == null) continue;

                let blockInfo = {
                    x: blockX,
                    y: blockY,
                    block: {unitList: theBlock.unitList}
                }
                sendingBlock.push(blockInfo);
                
            }
        }
        return [sendingBlock, this.blockNumber, this.blockSize, this.unitIDList];
    }

    // Function To Get Required Block Based On Client Request
    getUpdateBlock(blockPosList, mapLevelIndex) {
        let theBlock;
        let sendingBlock = [];
        for (let i = 0; i < blockPosList.length; i++) {
                let [blockX, blockY] = blockPosList[i].position;

                theBlock = this.mapLevel[mapLevelIndex].blockList[blockY][blockX];

                if (theBlock == null) continue;

                let blockInfo = {
                    x: blockX,
                    y: blockY,
                    block: {unitList: theBlock.unitList}
                }
                sendingBlock.push(blockInfo);

        }
        return [sendingBlock,[this.blockNumber.x, this.blockNumber.y],[this.blockSize.x,this.blockSize.y]];
    }
}

// Map level
class mapLevel {
    constructor(blockNumber, blockSize, this_game_map) {
        this.blockList = [];
        this.blockNumber = blockNumber;
        this.blockSize = blockSize;

        // Player In the Level
        this.levelPlayerArray = [];

        // Monster In the Level
        this.levelMonsterArray = [];
        this.updateMonsterPos = [];

         // Projectile In the Level
        this.levelProjectileArray = [];
        this.levelProjectileArray.length = 1000;
        this.projectile_count = 0;

        // Variable Declaration For Updating Projectiles
        this.updateProjectileArray = [];
        this.clearBlockProjectileArray = [];

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

        this.newEmptyLevel(blockNumber);
        this.initQuarterMap(blockSize, this_game_map);

    }

    // Create A Empty 2D Array
    newEmptyLevel(blockNumber) {
        for (let i = 0; i < blockNumber.y; i++) {
            this.blockList.push(new Array(blockNumber.x));
        }
    }

    // Double For Loop To Generate The Block
    initQuarterMap(blockSize, this_game_map){
        for (let y_Axis = 0; y_Axis < this.blockList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < this.blockList[y_Axis].length; x_Axis++) {
                this.blockList[y_Axis][x_Axis] = new block(x_Axis, y_Axis, blockSize, this.PerlinNoise, this_game_map);
            }
        }
    }

    IsNotInMapRange(floatBlockX, floatBlockY){
        return this.blockNumber.x <= floatBlockX || 0 > floatBlockX || this.blockNumber.y <= floatBlockY || 0 > floatBlockY;
    }

    // Return The Block Based On xy Coordinate
    getBlock([mapX, mapY]){
        let [floatBlockX, floatBlockY] = [mapX / this.blockSize.x, mapY / this.blockSize.y];
        if (this.IsNotInMapRange(floatBlockX, floatBlockY)) return null;
        return this.blockList[floatBlockY >> 0][floatBlockX >> 0];
    }

    // Return The Unit Based On xy Coordinate
    getUnit([mapX, mapY]){
        let theBlock = this.getBlock([mapX, mapY]);
        if (theBlock == null) return null;
        return theBlock.unitList[mapY % this.blockSize.y][mapX % this.blockSize.x];
    }

    getNewProjectileID(){
        let exceedCount = 0;
        // Stop Untill Get An Projectile ID Corresponding To An Empty Space In LevelProjectileArray
        while (this.levelProjectileArray[this.projectile_count] != null) {
            this.projectile_count = (this.projectile_count + 1) % this.levelProjectileArray.length;
            exceedCount++;
            
            // If Exceed Max LevelProjectileArray Length
            if (exceedCount >= this.levelProjectileArray.length){
                this.levelProjectileArray.length += 100;
                console.log("Exceed Max LevelProjectileArray Length, Double The LevelProjectileArray Length! Current Length:", this.levelProjectileArray.length);
            }
        }
        return this.projectile_count;
    }
}

// Map Block Class
class block {
    // Block Class Constructor
    constructor(x, y, blockSize, PerlinNoise, this_game_map) {
        this.unitList = [];
        this.projectileList = [];
        this.makeBlock(blockSize);
        this.initBlock(x, y, PerlinNoise, this_game_map);
    }

    // Create An Empty Block
    makeBlock(blockSize) {
        for (let i = 0; i < blockSize.y; i++) {
            this.unitList.push(new Array(blockSize.x));
        }
    }

    // To Create The Units Inside The Block
    initBlock(x, y, PerlinNoise, this_game_map) {
        for (let y_Axis = 0; y_Axis < this.unitList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < this.unitList[y_Axis].length; x_Axis++) {
                var ID = 1;
                var Height = 6 - 12 * PerlinNoise.noise((PerlinNoise.initX + x * this.unitList[0].length + x_Axis) / 10,
                                                    (PerlinNoise.initY + y * this.unitList.length + y_Axis) / 10,
                                                     0.1);
                if (Height < 0) {
                    Height = 0;
                    ID = 0;
                } else if (Height > 3) {
                    Height = 3;
                }

                let newChildUnit;
                if (this_game_map.unitIDList[ID].base && (Math.random() * 50) >> 0 == 0){
                    newChildUnit = {
                        ID: 2,
                        Height: 1,
                        childUnit: null
                    };
                }else{
                    newChildUnit = null;
                }



                this.unitList[y_Axis][x_Axis] = {
                    ID: ID,
                    Height: Height,
                    childUnit: newChildUnit
                };

            }
        }
    }
}

// Required Because server.js Uses This JavaScript File
module.exports = map;