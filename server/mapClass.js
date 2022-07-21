// Server Side Map Class
// blockNumber - How Many Block Are In A QuarterMap
// blockSize - The Size Of The Block (Number Of Unit)
const BinarySearchTree = require('./tree.js');

class map {
    constructor(blockNumber, blockSize) {
        // Set Unit ID List Information
        this.unitIDList = [
            this.setUnitIDInfo(["0_ground.jpg"], {IsPhongMaterial: true, geometryType: 0}),// 0
            this.setUnitIDInfo(["0_ground.jpg",// Vertical
                                "0_ground.jpg",// Vertical
                                "0_ground.jpg",// Horizontal
                                "0_ground.jpg",// Horizontal
                                "rock1.jpg",
                                "rock1.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true, geometryType: 1}),
            this.setUnitIDInfo(["tree1.glb"], {collision: true, destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["tree2.glb"], {collision: true, destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["tree3.glb"], {collision: true, destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["tree4.glb"], {collision: true, destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["tree5.glb"], {collision: true, destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["tree6.glb"], {collision: true, destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["bush1.glb"], {collision: true, destroyable: true, modelType: 0.2}),
            this.setUnitIDInfo(["bush2.glb"], {collision: true, destroyable: true, modelType: 0.4}),
            this.setUnitIDInfo(["bush3.glb"], {collision: true, destroyable: true, modelType: 0.4}),// 10
            this.setUnitIDInfo(["flower1.glb"], {destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["flower2.glb"], {destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["flower3.glb"], {destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["flower4.glb"], {destroyable: true, modelType: 0.3}),
            this.setUnitIDInfo(["rock1.jpg"], {IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass1.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass2.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass3.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass4.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass5.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),// 20
            this.setUnitIDInfo(["grass6.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass7.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass8.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass9.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["grass10.jpg"], {base: true, IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["ground3.jpg"], {IsPhongMaterial: true, geometryType: 0}),
            this.setUnitIDInfo(["mushroom1.glb"], {destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["mushroom2.glb"], {destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["mushroom3.glb"], {destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["mushroom4.glb"], {destroyable: true, modelType: 0.6}), // 30
            this.setUnitIDInfo(["mushroom5.glb"], {destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["mushroom6.glb"], {destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["mushroom7.glb"], {destroyable: true, modelType: 0.6}),
            this.setUnitIDInfo(["stone1.glb"], {destroyable: true, modelType: 3}),
            this.setUnitIDInfo(["portal1.glb"], {modelType: 1}),
            this.setUnitIDInfo(["guider.glb"], {collision: true, modelType: 0.5}),
            this.setUnitIDInfo(null, {collision: true}), // 37  Invisible wall
            this.setUnitIDInfo(["rockSideH.jpg", // Horizontal
                                "rockSideH.jpg", // Horizontal
                                "rockSideV.jpg", // Vertical
                                "rockSideV.jpg", // Vertical
                                "rock1.jpg",
                                "rock1.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true, geometryType: 1, replacingUnit: 39}),
            this.setUnitIDInfo(["rockSideH2.jpg", // Horizontal
                                "rockSideH2.jpg", // Horizontal
                                "rockSideV2.jpg", // Vertical
                                "rockSideV2.jpg", // Vertical
                                "rock2.jpg",
                                "rock2.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true, geometryType: 1, replacingUnit: 40}),
            this.setUnitIDInfo(["rockSideH3.jpg", // Horizontal
                                "rockSideH3.jpg", // Horizontal
                                "rockSideV3.jpg", // Vertical
                                "rockSideV3.jpg", // Vertical
                                "rock3.jpg",
                                "rock3.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true, geometryType: 1}),
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

    // Create New MapLevel
    createMapLevel(){
        // Save Map Level (Multiple Map Level)
        this.mapLevel = [new mapLevel(this.blockNumber, this.blockSize, this,
                                    this.init_perlinNoiseMapMethod({childUnitSpawnRate: 0.04,
                                                                    childUnitIDList: [{list: [2, 3, 4, 5, 6, 7, 8, 9, 10], weight: 3},// (trees and bushes)
                                                                                      {list: [13, 14, 31], weight: 15}, // (blue flowers and green mushrooms)
                                                                                      {list: [11, 12, 27, 28, 29, 30, 32], weight: 1}, // (other color flowers and mushrooms)
                                                                                      {list: [34], weight: 1}, // (stone)
                                                                                    ],
                                                                    groundIDList: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                                                                    wallIDList: [38]
                                                                    }),
                                    this.init_defaultMonsterMethod({defaultMinLevel: 1,
                                                                    defaultMaxLevel: 10,
                                                                    monsterSpawnList: [{ID: 0, weight: 2, minLevel: 1, maxLevel: 15}


                                                                                        ],

                                                                    }),    //monsterSetting
                            ),


                        new mapLevel(this.blockNumber, this.blockSize, this,
                                    this.init_perlinNoiseMapMethod({childUnitSpawnRate: 0.1,
                                                                    childUnitIDList: [{list: [2, 3, 4, 5, 6, 7, 8, 9, 10], weight: 5}, // (trees and bushes)
                                                                                      {list: [11, 12, 13, 14, 27, 28, 29, 30, 31, 32], weight: 1}, // (flowers and mushrooms)
                                                                                    ],
                                                                    groundIDList: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                                                                    wallIDList: [1],
                                                                    perlinRate: 10,
                                                                    perlinOffset: -0.4
                                                                    }),
                                    this.init_defaultMonsterMethod({defaultMinLevel: 10,
                                                                    defaultMaxLevel: 20,
                                                                    monsterSpawnList: [{ID: 0, weight: 2}
                                
                                
                                                                                    ],
                                
                                                                    }), //monsterSetting
                            ),

                        ];
    }

    // set UnitIDInfo by (texture url address, collision bool)
    setUnitIDInfo(fileName, additionalInfo) {
        var unitIDInfo = {
            ["fileName"]: fileName, // FileName For url Address
            ["collision"]: false, // Can Walk Through (True Or False)
            ["destroyable"]: false, // Can Be Destroyed (True Or False)
            ["base"]: false, // Can Have childUnit On (True Or False)
            ["geometryType"]: null, // If Is Not null, Load Geometry And Texture (Need To Be Geometry Index)
            ["modelType"]: null, // If Is Not null, Load Model (Inside Is Model Scale)
            ["IsPhongMaterial"]: false, // Material Can Reflect Light (True or False)
            ["replacingUnit"]: null, // Replacing Unit After Destroy
        }

        // AdditionalInfo
	    for (let [key, value] of Object.entries(additionalInfo)) {
		    unitIDInfo[key] = value;
	    }

        // Return The Unit Information ID
        return unitIDInfo
    }
    // ****************************************************** Map Method ******************************************************

    // ------------------- Method One - Perlin Noise -------------------
    init_perlinNoiseMapMethod(ChangeSpawnMethodInputs){
        let spawnMethodInputs = {
            ["childUnitSpawnRate"]: 0,
            ["childUnitIDList"]: [],
            ["groundIDList"]: [0],
            ["wallIDList"]:[1],
            ["maxWallHeight"]: 3,
            ["perlinRate"]: 10, // amplitude of wall
            ["perlinOffset"]: 0, // Offset for determind is ground or wall (between -0.5 and 0.5. For -0.5 there will be no wall, and 0.5 will be all wall)
            ["defaultReplacingUnit"]: 15,

        }

        // Change
	    for (let [key, value] of Object.entries(ChangeSpawnMethodInputs)) {
		    spawnMethodInputs[key] = value;
	    }


        // Get The Total Weight For Random
        spawnMethodInputs["totalChildUnitWeight"] = 0;
        for (let i = 0; i < spawnMethodInputs.childUnitIDList.length; ++i){
            spawnMethodInputs.totalChildUnitWeight += spawnMethodInputs.childUnitIDList[i].weight;
        }

        // This PerlinNoise Function Is Imported From Outside Source
        spawnMethodInputs["PerlinNoise"] = new function() {
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

        return [this.perlinNoiseMapMethod, spawnMethodInputs];
    }

    // Perlin Noise Map Method
    perlinNoiseMapMethod(spawnMethodInputs, blockX, blockY, unitX, unitY, theBlock, this_game_map){
        var ID;
        var Height = spawnMethodInputs.perlinRate * 
                    (spawnMethodInputs.perlinOffset - 0.5 + 
                    spawnMethodInputs.PerlinNoise.noise((spawnMethodInputs.PerlinNoise.initX + blockX * theBlock.unitList[0].length + unitX) / 10,
                                                        (spawnMethodInputs.PerlinNoise.initY + blockY * theBlock.unitList.length + unitY) / 10,
                                                        0.1));


        if (Height <= 0) { // Ground
            ID = spawnMethodInputs.groundIDList[(2 / Math.PI * Math.atan(- Height * 1.5 * Math.random()) * spawnMethodInputs.groundIDList.length) >> 0];
            Height = 0;

        } else  { // Wall
            ID = spawnMethodInputs.wallIDList[(2 / Math.PI * Math.atan(- Height * 1.5 * Math.random()) * spawnMethodInputs.wallIDList.length) >> 0];

            // If Exceed Max Height
            if (Height > spawnMethodInputs.maxWallHeight) Height = spawnMethodInputs.maxWallHeight;
        }

        let newChildUnit;
        if (this_game_map.unitIDList[ID].base && spawnMethodInputs.totalChildUnitWeight != 0 && Math.random() <= spawnMethodInputs.childUnitSpawnRate){
            let childID, childIDList;

            // Get A Random ChildIDList From ALL List By Their Weight
            let randomChildListWeight = Math.random() * spawnMethodInputs.totalChildUnitWeight;
            for (let i = 0; i < spawnMethodInputs.childUnitIDList.length; ++i){
                childIDList = spawnMethodInputs.childUnitIDList[i];
                if (randomChildListWeight < childIDList.weight){
                    // Get A Random ChildUnit From The List
                    childID = childIDList.list[(Math.random() * childIDList.list.length) >> 0];
                    break;
                }
                randomChildListWeight -= childIDList.weight;
            }

            newChildUnit = new mapUnit(childID, 0, null, Math.random() * Math.PI * 2);
        }else{
            newChildUnit = null;
        }

        return new mapUnit(ID, Height, newChildUnit);

    }
    // ------------------- End Of Method One -------------------

    // ****************************************************** End Of Map Method ******************************************************


    // ****************************************************** Monster Method ******************************************************


    // ------------------- Method One - Default Monster -------------------
    init_defaultMonsterMethod(ChangeMonsterSpawnInputs){
        let monsterSpawnInputs = {
            ["defaultMinLevel"]: 1,
            ["defaultMaxLevel"]: 99999,
            ["monsterSpawnList"]: [],
            ["levelHalfRange"]: 2,
        }

        // Change
	    for (let [key, value] of Object.entries(ChangeMonsterSpawnInputs)) {
		    monsterSpawnInputs[key] = value;
	    }

        // Get The Total Weight For Random
        monsterSpawnInputs["totalMonsterWeight"] = 0;
        for (let i = 0; i < monsterSpawnInputs.monsterSpawnList.length; ++i){
            monsterSpawnInputs.totalMonsterWeight += monsterSpawnInputs.monsterSpawnList[i].weight;
        }

        return [this.defaultMonsterMethod, monsterSpawnInputs];
    }
    
    // Default Monster Method
    defaultMonsterMethod(monsterSpawnInputs){
        let spawnMonster;
        // Get A Random Monster From monsterSpawnList By Their Weight
        let randomMonsterWeight = Math.random() * monsterSpawnInputs.totalMonsterWeight;
        for (let i = 0; i < monsterSpawnInputs.monsterSpawnList.length; ++i){
            if (randomMonsterWeight < monsterSpawnInputs.monsterSpawnList[i].weight){
                spawnMonster = monsterSpawnInputs.monsterSpawnList[i];
                break;
            }
            randomMonsterWeight -= monsterSpawnList[i].weight;
        }


        let minLevel = monsterSpawnInputs.defaultMinLevel;
        if ('minLevel' in spawnMonster) minLevel = spawnMonster.minLevel;

        let maxLevel = monsterSpawnInputs.defaultMaxLevel;
        if ('maxLevel' in spawnMonster) maxLevel = spawnMonster.maxLevel;

        return [spawnMonster.ID, minLevel, maxLevel, monsterSpawnInputs.levelHalfRange];
    }

    // ------------------- End Of Method One -------------------

    // ****************************************************** End Of Monster Method ******************************************************

    getAllChildUnitCollision(unit){
        return this.unitIDList[unit.ID].collision || (unit.childUnit == null ? false : this.getAllChildUnitCollision(unit.childUnit));
    }

    // Find Neighboring Map Blocks
    neighbors([mapX, mapY], mapLevelIndex){
        let neighborList = [];
        
        let theUnit;

        let dirSwitch = [false, false, false, false];

        // Get Direction Switch
        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX + 1, mapY]);
        if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
            neighborList.push([mapX + 1, mapY]);
            dirSwitch[0] = true;
        }

        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX - 1, mapY]);
        if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
            neighborList.push([mapX - 1, mapY]);
            dirSwitch[1] = true;
        }

        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX, mapY + 1]);
        if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
            neighborList.push([mapX, mapY + 1]);
            dirSwitch[2] = true;
        }

        theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX, mapY - 1]);
        if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
            neighborList.push([mapX, mapY - 1]);
            dirSwitch[3] = true;
        }

        // Seting neighborList Based On Direction Switch
        if (dirSwitch[0]){
            if (dirSwitch[2]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX + 1, mapY + 1]);
                if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
                    neighborList.push([mapX + 1, mapY + 1]);
                }
            }

            if (dirSwitch[3]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX + 1, mapY - 1]);
                if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
                    neighborList.push([mapX + 1, mapY - 1]);
                }
            }
        }

        // Setting neightborList Based On Direction Switch
        if (dirSwitch[1]){
            if (dirSwitch[2]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX - 1, mapY + 1]);
                if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
                    neighborList.push([mapX - 1, mapY + 1]);
                }
            }
    
            if (dirSwitch[3]){
                theUnit = this.mapLevel[mapLevelIndex].getUnit([mapX - 1, mapY - 1]);
                if (theUnit != null && this.getAllChildUnitCollision(theUnit) == false){
                    neighborList.push([mapX - 1, mapY - 1]);
                }
            }
        }
        
        // Return neightborList To Caller
        return neighborList;
    }

    // FUnction To Return All Surrounding Block
    getSurroundingBlock([centerBlockX, centerBlockY], mapLevelIndex, [blockHalfRangeX, blockHalfRangeY]){
        let theBlock;
        let surroundingBlocks = [];
        for (let y_Axis = -blockHalfRangeY; y_Axis <= blockHalfRangeY; y_Axis++) {
            for (let x_Axis = -blockHalfRangeX; x_Axis <= blockHalfRangeX; x_Axis++) {

                let [blockX, blockY] = [centerBlockX + x_Axis, centerBlockY + y_Axis];

                
                theBlock = this.mapLevel[mapLevelIndex].getBlockByBlockPos([blockX, blockY]);

                if (theBlock != null) surroundingBlocks.push([blockX, blockY, theBlock]);
            }
        }
        return surroundingBlocks;
    }

    // Function To Initialize The Block And Package It To Send To Client
    getInitMap([mapX, mapY], mapLevelIndex, [blockHalfRangeX, blockHalfRangeY]) {
        let sendingBlock = [];
        let surroundingBlocks = this.getSurroundingBlock([mapX / this.blockSize.x >> 0, mapY / this.blockSize.y >> 0], mapLevelIndex, [blockHalfRangeX, blockHalfRangeY])
        for (let i = 0; i < surroundingBlocks.length; ++i) {

            let blockInfo = {
                x: surroundingBlocks[i][0],
                y: surroundingBlocks[i][1],
                block: {unitList: surroundingBlocks[i][2].unitList}
            }
            sendingBlock.push(blockInfo);
                
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
class mapLevel{
    constructor(blockNumber, blockSize, this_game_map, initSpawnMethodOutput, monsterMethodOutput) {
        this.blockList = [];
        this.blockNumber = blockNumber;
        this.blockSize = blockSize;
        this.initSpawnMethodOutput = initSpawnMethodOutput;
        this.monsterSpawnFunction = monsterMethodOutput[0];
        this.monsterSpawnInfo = monsterMethodOutput[1];

        // Item Related Variable Declaration
        this.currentItemIndex = 0;
        this.itemArray = [];
        this.itemArray.length = 256;

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

        this.resetBlockUpdated = [];

        this.newEmptyLevel(blockNumber);
        this.initLevelMap(blockSize, this_game_map);

    }

    // Create A Empty 2D Array
    newEmptyLevel(blockNumber) {
        for (let i = 0; i < blockNumber.y; i++) {
            this.blockList.push(new Array(blockNumber.x));
        }
    }

    // Double For Loop To Generate The Block
    initLevelMap(blockSize, this_game_map){
        for (let y_Axis = 0; y_Axis < this.blockList.length; ++y_Axis) {
            for (let x_Axis = 0; x_Axis < this.blockList[y_Axis].length; ++x_Axis) {
                this.blockList[y_Axis][x_Axis] = new block(x_Axis, y_Axis, blockSize, this_game_map, this.initSpawnMethodOutput);
            }
        }

        // Spawn Portal
        let count = 0;
        let surroundingUnitList;
        let portalX, portalY, allBase;
        let [halfRangeX, halfRangeY] = [3,3];
        let numberOfUnit = (halfRangeX * 2 + 1) * (halfRangeY * 2 + 1);
        
        // Looping Through Multiple Position To Spawn A Protal
        while (count < 100){
            ++count;
            portalX = (Math.random() * this_game_map.blockNumber.x * this_game_map.blockSize.x) >> 0;
		    portalY = (Math.random() * this_game_map.blockNumber.y * this_game_map.blockSize.y) >> 0;
            surroundingUnitList = this.getSurroundingUnit([portalX , portalY], [halfRangeX, halfRangeY]);
            if (surroundingUnitList.length != numberOfUnit) continue;
            allBase = true;
            for (let i = 0; i < surroundingUnitList.length; ++i) {
                if (!this_game_map.unitIDList[surroundingUnitList[i].ID].base) {
                    allBase = false;
                    break;
                }
            }
            if (allBase) break;
        }
        console.log ("Spawn Portal On:", portalX, portalY, "   Number Of Run:", count)

        for (let i = 0; i < surroundingUnitList.length; ++i) {
            surroundingUnitList[i].childUnit = null;
        }

        // Invisible Wall For Portal
        let portalCollision =  [23, 25];
        for (let i = 0; i < portalCollision.length; ++i) {
            surroundingUnitList[portalCollision[i]].childUnit = new mapUnit(37, 0, null);
        }
        surroundingUnitList[numberOfUnit / 2 >> 0].childUnit = new mapUnit(35, 0, null);

        let guiderX, guiderY, guiderUnit;

        let numberOfGuider = this.blockNumber.x * this.blockSize.x * this.blockNumber.y * this.blockSize.y / 1000;
        for (let i = 0; i < numberOfGuider; ++i) {
            count = 0;
            while (count < 100){
                ++count;
                guiderX = (Math.random() * this_game_map.blockNumber.x * this_game_map.blockSize.x) >> 0;
                guiderY = (Math.random() * this_game_map.blockNumber.y * this_game_map.blockSize.y) >> 0;
                guiderUnit = this.getUnit([guiderX , guiderY]);

                if (guiderUnit != null && this_game_map.unitIDList[guiderUnit.ID].base) break;
            }

            guiderUnit.childUnit = new mapUnit(36, 0, null, Math.atan2((guiderY - portalY), (guiderX - portalX)) - Math.PI / 2);
        }
    }

    // Check If Within Map Rnage
    IsNotInMapRange(floatBlockX, floatBlockY){
        return this.blockNumber.x <= floatBlockX || 0 > floatBlockX || this.blockNumber.y <= floatBlockY || 0 > floatBlockY;
    }

    // Return The Block By Block Coordinate
    getBlockByBlockPos([blockX, blockY]){
        if (this.IsNotInMapRange(blockX, blockY)) return null;
        return this.blockList[blockY][blockX];
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

    // Reutnr The Surrounding Unit
    getSurroundingUnit([centerUnitX, centerUnitY], [unitHalfRangeX, unitHalfRangeY]){
        let theUnit;
        let surroundingUnit = [];
        for (let y_Axis = -unitHalfRangeY; y_Axis <= unitHalfRangeY; y_Axis++) {
            for (let x_Axis = -unitHalfRangeX; x_Axis <= unitHalfRangeX; x_Axis++) {
                let [unitX, unitY] = [centerUnitX + x_Axis, centerUnitY + y_Axis];

                theUnit = this.getUnit([unitX, unitY]);

                if (theUnit != null) surroundingUnit.push(theUnit);
            }
        }
        return surroundingUnit;
    }
}

// Map Block Class
class block {
    // Block Class Constructor
    constructor(x, y, blockSize, this_game_map, initSpawnMethodOutput) {
        this.unitList = [];
        this.projectileList = new BinarySearchTree();
        this.blockCreatureArray = [];
        this.updated = false;
        this.surroundingMonsterNumber = 0;

        this.makeBlock(blockSize);
        this.initBlock(x, y, this_game_map, initSpawnMethodOutput[0], initSpawnMethodOutput[1]);
    }

    // Create An Empty Block
    makeBlock(blockSize) {
        for (let i = 0; i < blockSize.y; i++) {
            this.unitList.push(new Array(blockSize.x));
        }
    }

    // To Create The Units Inside The Block
    initBlock(blockX, blockY, this_game_map, spawnMethod, spawnMethodInputs) {
        for (let y_Axis = 0; y_Axis < this.unitList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < this.unitList[y_Axis].length; x_Axis++) {

                this.unitList[y_Axis][x_Axis] = spawnMethod(spawnMethodInputs, blockX, blockY, x_Axis, y_Axis, this, this_game_map);

            }
        }
    }
}

// Setting Map Unit
function mapUnit(ID, Height, newChildUnit, rotation = 0) {
    this.ID = ID;
    this.Height = Height;
    this.childUnit = newChildUnit;
    this.rotation = rotation;
}


// Required Because server.js Uses This JavaScript File
module.exports = map;