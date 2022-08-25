const {dynamicList} = require('./dataStructure/dynamicList.js');
const {sharedIndexArray} = require('./dataStructure/sharedIndexArray.js');
const {mapList} = require('./mapClass.js')
const {object, sphere, allObject} = require('./object.js');

var allPlayer = new dynamicList("Player List", 30, 10);

var displayRange = {x: 30, y: 30}; // The Range For Player To Get Object Information On Server

var defaultProperties = {
	// Level Related Properties
	// Exp Required To Level Up Is Increased Exponentially
	// Exp Function: level * 100 * e ^ ((level - 1) / 15)
	// Need 93745637 Exp To Get To Level 100
	"level": {type: "uint", value: 1},
	"experience": {type: "uint", value: 0},
	
	// Level Up Growth Amount
	// Growth Is Linearly Scaled
	// Defensive Property Growth
	"maxHealthGrowth": {type: "int", value: 50},
	"armorGrowth": {type: "int", value: 5},

	// Offensive Property Growth
	"attackDamageGrowth": {type: "int", value: 5},
	"attackSpeedGrowth": {type: "float", value: 0.05},
	"criticalRateGrowth": {type: "float", value: 0.005},

	// Defensive Properties
	"health": {type: "int", value: 100},
	"maxHealth": {type: "int", value: 100},
	"armor": {type: "int", value: 10},
	"fireResistance": {type: "float", value: 0},
	"poisonResistance": {type: "float", value: 0},
	"iceResistance": {type: "float", value: 0},

	// Attack Properties
	"attackDamage": {type: "int", value: 10},
	"attackSpeed": {type: "float", value: 100},
	"criticalRate": {type: "float", value: 0.01},

	// Movement Properties40
	"moveSpeed": {type: "float", value: 3},
	"projectileSpeed": {type: "float", value: 8},
}

var propertyNumber = 0;
for (let [key, value] of Object.entries(defaultProperties)) {
	++propertyNumber;
}

class creature extends sphere{
    constructor(name, objectType, spawnPos, mapIndex, camp, radius) {
		super(spawnPos, objectType, radius, mapIndex);  // explicitly call parent constructor.
	
		// Creature Identification Information
		this["name"] = name;

		this["camp"] = camp
		this["campInfo"] = new campInfo();
			
		// Creature Properties Information
		this["properties"] = new properties();
		
		// Creature Item Array
		this["creatureItemArray"] = {};

		// Creature state
		this["state"] = {};

		// Ability
		this["ability"] = {};
        
    }

	initWorker(){
		Object.setPrototypeOf(this.properties, properties.prototype);
	}

	collision(){
		// Hit Projectile
		let candidates = mapList[this.mapIndex].objectTree.retrieve({
			x: this.position[0],
			y: this.position[1],
			width: this.getRadius(),
			height: this.getRadius(),
		});

		let theObject;
		for(let i = 0; i < candidates.length; ++i) {

			theObject = allObject.list[candidates[i].ID];

			if (theObject == null || this.ID == theObject.ID || this.ID == theObject.senderID) continue;
			
			theObject.isOverlapping(this);
			
		}
	}

	update(){
		this.collision();
	}


	collisionReaction(hitCreature){
		console.log("creature coll", hitCreature)

	}

	

	remove(){
		sphere.prototype.remove.call(this); // call parent remove function
	}

	getInfo(){
		return{
			... sphere.prototype.getInfo.call(this),
			name: this.name,
			camp: this.camp,
			campInfo: this.campInfo,
			properties: this.properties.getAllProperties(),
			creatureItemArray: this.creatureItemArray,
			state: this.state,
			ability: this.ability,
		};
	}
}

class player extends creature{
    constructor(name, mapIndex, spawnPos) {
        super(name, "player", spawnPos == null ? [0, 0, 0] : spawnPos, mapIndex, "defaultPlayer", 0.45);  // explicitly call parent constructor.
		if (spawnPos == null) this.changePosition(this.findNoCollisionPosition());
        this.playerID = allPlayer.add(this);

		this.displayObjects = new Uint32Array(new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * 150000));
        this.displayObjectsLength = new Uint32Array(new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT));
        this.displayObjectsLength[0] = 0;

    }

	initWorker(){
		creature.prototype.initWorker.call(this); // call parent initWorker function

		if (allPlayer.list.length <= this.playerID) allPlayer.list.length = this.playerID + 10;
		allPlayer.list[this.playerID] = this;

		mapList[this.mapIndex].playerIDArray.add(allObject.list, this.ID);
	}

	collisionReaction(hitCreature){
		if (hitCreature.objectType == "player") return;
		creature.prototype.collisionReaction.call(this, hitCreature); // call parent collisionReaction function

		
	}

	update(){
		let theMap = mapList[this.mapIndex];

		creature.prototype.update.call(this); // call parent update function

		// Find Surrounding Object For Displaying
		let displayCount = 0;

		let displayObjects = theMap.objectTree.retrieve({
			x: this.position[0] - displayRange.x,
			y: this.position[1] - displayRange.y,
			width: displayRange.x * 2,
			height: displayRange.y * 2
		});
		

		let theObject;
		for(let i = 0; i < displayObjects.length; ++i) {
			theObject = allObject.list[displayObjects[i].ID];

			if (theObject == null || this.ID == theObject.ID) continue;
			
			if (Math.abs(this.position[0] - theObject.position[0]) < displayRange.x &&
				Math.abs(this.position[1] - theObject.position[1]) < displayRange.y){
				this.displayObjects[displayCount++] = theObject.ID;
			}

		}

		this.displayObjectsLength[0] = displayCount;

	}


	removeOnWorker(){ // Worker side
		mapList[this.mapIndex].playerIDArray.remove(allObject.list, this.ID);
		this.remove();
	}

	remove(){
		creature.prototype.remove.call(this); // call parent remove function
		allPlayer.remove(this.playerID);
		
	}
	

	getInfo(){
		return {
			... creature.prototype.getInfo.call(this),
			playerID: this.playerID
		};
	}
}


class AI extends creature{
    constructor(name, mapIndex, spawnPos) {
        super(name, "AI", spawnPos == null ? [0, 0, 0] : spawnPos, mapIndex, "defaultMonster", 3);  // explicitly call parent constructor.
		if (spawnPos == null) this.changePosition(this.findNoCollisionPosition());
    }

	initWorker(){
		creature.prototype.initWorker.call(this); // call parent initWorker function
	}

	collisionReaction(hitCreature){
		if (hitCreature.objectType == "player") return;
		creature.prototype.collisionReaction.call(this, hitCreature); // call parent collisionReaction function

		
	}

	removeOnWorker(){ // Worker side
		mapList[this.mapIndex].playerIDArray.remove(allObject.list, this.ID);
		this.remove();
	}

	remove(){
		creature.prototype.remove.call(this); // call parent remove function
		allPlayer.remove(this.playerID);
		
	}
	

	getInfo(){
		return {
			... creature.prototype.getInfo.call(this),
			playerID: this.playerID
		};
	}
}

// Default Properties For All Creature
class properties {
	constructor() {
		let data = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * propertyNumber);
		let count = 0;
		for (let [key, info] of Object.entries(defaultProperties)) {
			this[key] = new DataView(data, Int32Array.BYTES_PER_ELEMENT * count++, Int32Array.BYTES_PER_ELEMENT);
			this.set(key, info.value);
		}
	}

	getAllProperties(){
		let allProperties = {};
		for (let [key, info] of Object.entries(defaultProperties)) {
			allProperties[key] = this.get(key);
		}
		return allProperties;
	}

	set(key, value){
		switch (defaultProperties[key].type){
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
	}

	get(key){
		switch (defaultProperties[key].type){
			case "uint":
				return this[key].getUint32(0);
			case "int":
				return this[key].getInt32(0);
			case "float":
				return this[key].getFloat32(0);
		}
	}
}

// Default Camp Information
function campInfo(){
	this["defaultPlayer"] = -100
	this["defaultMonster"] = 0
	this["monsterKiller"] = 0
}


module.exports = {player, AI, properties, allPlayer, defaultProperties};