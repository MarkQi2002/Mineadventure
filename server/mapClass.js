const {sharedIndexArray} = require('./dataStructure/sharedIndexArray.js');
const {Quadtree} = require('./dataStructure/quadTree.js');
// Server Side Map Class
// blockNumber - How Many Block Are In A QuarterMap
// blockSize - The Size Of The Block (Number Of Unit)

var unitIDList = [
    setUnitIDInfo(["0_ground.jpg"], {IsPhongMaterial: true}),// 0
    setUnitIDInfo(["0_ground.jpg",// Vertical
                   "0_ground.jpg",// Vertical
                   "0_ground.jpg",// Horizontal
                   "0_ground.jpg",// Horizontal
                   "rock1.jpg",
                   "rock1.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true}, {type: "block"}),
    setUnitIDInfo(["tree1.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["tree2.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["tree3.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["tree4.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["tree5.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["tree6.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["bush1.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.2}),
    setUnitIDInfo(["bush2.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.4}),
    setUnitIDInfo(["bush3.glb"], {collision: true, destroyable: true}, {type: "childUnit", scale: 0.4}),// 10
    setUnitIDInfo(["flower1.glb"], {destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["flower2.glb"], {destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["flower3.glb"], {destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["flower4.glb"], {destroyable: true}, {type: "childUnit", scale: 0.3}),
    setUnitIDInfo(["rock1.jpg"], {IsPhongMaterial: true}),
    setUnitIDInfo(["grass1.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass2.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass3.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass4.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass5.jpg"], {base: true, IsPhongMaterial: true}),// 20
    setUnitIDInfo(["grass6.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass7.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass8.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass9.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["grass10.jpg"], {base: true, IsPhongMaterial: true}),
    setUnitIDInfo(["ground3.jpg"], {IsPhongMaterial: true}),
    setUnitIDInfo(["mushroom1.glb"], {destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["mushroom2.glb"], {destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["mushroom3.glb"], {destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["mushroom4.glb"], {destroyable: true}, {type: "childUnit", scale: 0.6}), // 30
    setUnitIDInfo(["mushroom5.glb"], {destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["mushroom6.glb"], {destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["mushroom7.glb"], {destroyable: true}, {type: "childUnit", scale: 0.6}),
    setUnitIDInfo(["stone1.glb"], {destroyable: true}, {type: "childUnit", scale: 3}),
    setUnitIDInfo(["portal1.glb"], {modelType: 1}, {type: "childUnit", scale: 1}),
    setUnitIDInfo(["guider.glb"], {collision: true}, {type: "childUnit", scale: 0.5}),
    setUnitIDInfo(["0_ground.jpg"], {collision: true}), // 37  Invisible wall
    setUnitIDInfo(["rockSideH.jpg", // Horizontal
                   "rockSideH.jpg", // Horizontal
                   "rockSideV.jpg", // Vertical
                   "rockSideV.jpg", // Vertical
                   "rock1.jpg",
                   "rock1.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true, replacingUnit: 39}, {type: "block"}),
    setUnitIDInfo(["rockSideH2.jpg", // Horizontal
                   "rockSideH2.jpg", // Horizontal
                   "rockSideV2.jpg", // Vertical
                   "rockSideV2.jpg", // Vertical
                   "rock2.jpg",
                   "rock2.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true, replacingUnit: 40}, {type: "block"}),
    setUnitIDInfo(["rockSideH3.jpg", // Horizontal
                   "rockSideH3.jpg", // Horizontal
                   "rockSideV3.jpg", // Vertical
                   "rockSideV3.jpg", // Vertical
                   "rock3.jpg",
                   "rock3.jpg"], {collision: true, destroyable: true, IsPhongMaterial: true}, {type: "block"}),
];


// set UnitIDInfo by (texture url address, collision bool)
function setUnitIDInfo(fileName, additionalInfo = {},  additionaTypeInfo = {}) {
    var unitIDInfo = {
        "fileName": fileName, // FileName For url Address
        "collision": false, // Can Walk Through (True Or False)
        "destroyable": false, // Can Be Destroyed (True Or False)
        "base": false, // Can Have childUnit On (True Or False)
        "IsPhongMaterial": false, // Material Can Reflect Light (True or False)
        "replacingUnit": null, // Replacing Unit After Destroy
        "typeInfo": {type: "plane"},
    }

    // Additional Info
    for (let [key, value] of Object.entries(additionalInfo)) {
        unitIDInfo[key] = value;
    }


    switch(unitIDInfo.typeInfo.type){
        case "plane":
            break;
        case "block":
            break;
        case "childUnit":
            unitIDInfo.typeInfo["scale"] = 1;
            break;
    }


    // Additiona Typ eInfo
    for (let [key, value] of Object.entries(additionaTypeInfo)) {
        unitIDInfo.typeInfo[key] = value;
    }

    // Return The Unit Information ID
    return unitIDInfo
}


// ****************************************************** End Of Map Method ******************************************************
var mapSpawnMethod = {
    "perlinNoise": {
        init: function(ChangeSpawnMethodInputs) {
            let spawnMethodInputs = {
                "childUnitSpawnRate": 0,
                "childUnitIDList": [],
                "groundIDList": [0],
                "wallIDList": [1],
                "maxWallHeight": 30,
                "perlinRate": 30, // amplitude of wall (The Max Height Of Unit)
                "perlinOffset": 0, // Offset for determind is ground or wall (between -1 and 1. For -1 there will be no wall, and 1 will be all wall)
                "defaultReplacingUnit": 15,
        
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
            // Similar To A Randomized Seed For PerlinNoise
            spawnMethodInputs["PerlinSeed"] = {
                x: Math.floor(Math.random() * 255),
                y: Math.floor(Math.random() * 255)
            }
        
            return {
                method: "perlinNoise",
                inputs: spawnMethodInputs
            };
        },


        perlinFunction: new function() {
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
        },



        // Perlin Noise Map Method
        spawnUnit: function(spawnMethodInputs, x, y, unitClass){
            var ID;
            var Height = spawnMethodInputs.perlinRate * (
                    spawnMethodInputs.perlinOffset - 1 +
                    mapSpawnMethod.perlinNoise.perlinFunction.noise(
                            (spawnMethodInputs.PerlinSeed.x + x) / 10,
                            (spawnMethodInputs.PerlinSeed.y + y) / 10,
                            0.1
                    ) * 2
            );


            if (Height <= 0) { // Ground
                ID = spawnMethodInputs.groundIDList[(2 / Math.PI * Math.atan(- Height * 1.5 * Math.random()) * spawnMethodInputs.groundIDList.length) >> 0];
                Height = 0;

            } else  { // Wall
                ID = spawnMethodInputs.wallIDList[(2 / Math.PI * Math.atan(- Height * 1.5 * Math.random()) * spawnMethodInputs.wallIDList.length) >> 0];

                // If Exceed Max Height
                if (Height > spawnMethodInputs.maxWallHeight) Height = spawnMethodInputs.maxWallHeight;
            }

            let childID;
            if (unitIDList[ID].base && spawnMethodInputs.totalChildUnitWeight != 0 && Math.random() <= spawnMethodInputs.childUnitSpawnRate){
                let childIDList;

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

                rotation = Math.random() * Math.PI * 2
            }else{
                childID = 0;
                rotation = 0;
            }

            unitClass.set("ID", ID);
            unitClass.set("height", Height);
            unitClass.set("rotation", rotation);
            unitClass.set("childID", childID);
        }


    }






};

// ****************************************************** End Of Map Method ******************************************************






var mapList = [];

function pushMap(){
    new map({
        mapMethod: 
            mapSpawnMethod.perlinNoise.init({
                childUnitSpawnRate: 0.04,
                childUnitIDList: [
                    {list: [2, 3, 4, 5, 6, 7, 8, 9, 10], weight: 3},// (trees and bushes)
                    {list: [13, 14, 31], weight: 15}, // (blue flowers and green mushrooms)
                    {list: [11, 12, 27, 28, 29, 30, 32], weight: 1}, // (other color flowers and mushrooms)
                    {list: [34], weight: 1}, // (stone)
                ],
                groundIDList: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
                wallIDList: [38]
            }),
    });
}







// Map level
class map{
    constructor({size = {x: 200, y: 200}, mapMethod = null, creatureMethod = null}) {
        this.index = mapList.length;
        mapList.push(this);
        this.size = size;
        this.dataSpace = new SharedArrayBuffer(this.size.x * this.size.y * Int32Array.BYTES_PER_ELEMENT * unitPropertyNumber);
        this.unitList = [];
        this.mapMethod = mapMethod;
        this.creatureMethod = creatureMethod;

        this.playerIDArray = new sharedIndexArray(1000, "playerIDArrayIndex");

        this.projectileIDArray = new sharedIndexArray(100000, "projectileIDArrayIndex");

        this.AIIDArray = new sharedIndexArray(10000, "AIIDArrayIndex");


    }

    // Create A Empty 2D Array
    newEmptyMap() {
        // Set empty unitList
        for (let i = 0; i < this.size.y; i++) {
            this.unitList.push(new Array(this.size.x));
        }

        // Set DataView to unitList
        let offset = 0;
        for (let y = 0; y < this.unitList.length; ++y) {
            for (let x = 0; x < this.unitList[y].length; ++x) {
                this.unitList[y][x] = new mapUnit(x, y, offset, this.dataSpace);
                offset += Int32Array.BYTES_PER_ELEMENT * unitPropertyNumber;
            }
        }
    }

    initWorkerMap(){
        Object.setPrototypeOf(this.playerIDArray, sharedIndexArray.prototype);
        Object.setPrototypeOf(this.projectileIDArray, sharedIndexArray.prototype);
        Object.setPrototypeOf(this.AIIDArray, sharedIndexArray.prototype);
        this.newEmptyMap();
        if (mapList.length <= this.index) mapList.length = this.index + 1;
        mapList[this.index] = this;
        
        this.objectTree =  new Quadtree({
            x: 0,
            y: 0,
            width: this.size.x,
            height: this.size.y
        });
    }
    
    initMap(){
        for (let y = 0; y < this.unitList.length; ++y) {
            for (let x = 0; x < this.unitList[y].length; ++x) {
                mapSpawnMethod[this.mapMethod.method].spawnUnit(this.mapMethod.inputs, x, y, this.unitList[y][x]);
            }
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

}

var unitProperties = {
	"ID": "uint",
    "height": "float",
    "rotation": "float",
    "childID": "uint"
}

var unitPropertyNumber = 0;
for (let [key, value] of Object.entries(unitProperties)) {
	++unitPropertyNumber;
}

var unitModifiedList = [];

// Map Unit
class mapUnit {
	constructor(x, y, offSet, dataSpace) {
        this.x = x;
        this.y = y;

        let count = 0;
		for (let [key, info] of Object.entries(unitProperties)) {
			this[key] = new DataView(dataSpace, offSet + Int32Array.BYTES_PER_ELEMENT * count++, Int32Array.BYTES_PER_ELEMENT);
		}
        this.modifiedHistory = [];
	}

    getCollision(){
        let childID = this.get("childID");
        return unitIDList[this.get("ID")].collision || (childID != 0 && unitIDList[childID].collision);
    }

    getIDProperty(type){
        return unitIDList[this.get("ID")][type];
    }

    getChildIDProperty(type){
        let childID = this.get("childID");
        return childID == 0 ? null : unitIDList[childID][type];
    }


	getAllProperties(){
		let allProperties = {};
		for (let [key, info] of Object.entries(unitProperties)) {
			allProperties[key] = this.get(key);
		}
		return allProperties;
	}

	set(key, value){
		switch (unitProperties[key]){
			case "uint":
				this[key].setUint32(0, value);
				break;
			case "int":
				this[key].setInt32(0, value);
				break;
			case "float":
				this[key].setFloat32(0, value);
				break;
		}
        this.modifiedHistory.push([key, value]);
	}

	get(key){
		switch (unitProperties[key]){
			case "uint":
				return this[key].getUint32(0);
			case "int":
				return this[key].getInt32(0);
			case "float":
				return this[key].getFloat32(0);
		}
	}

    updateToClient(){
        unitModifiedList.push([this.x, this.y, this.modifiedHistory]);
        this.modifiedHistory = [];
    }
}

// Required Because server.js Uses This JavaScript File
module.exports = {map, pushMap, mapList, unitProperties, unitIDList, unitModifiedList};