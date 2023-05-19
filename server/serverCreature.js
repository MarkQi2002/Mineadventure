const { Vector2 } = require('../client/js/module/three.js');
const {dynamicList} = require('./dataStructure/dynamicList.js');
const {sharedIndexArray} = require('./dataStructure/sharedIndexArray.js');
const {mapList} = require('./mapClass.js')
const {object, sphere, allObject} = require('./object.js');

const gravity = 20;

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

class creature extends sphere {
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
		for (let i = 0; i < candidates.length; ++i) {
			theObject = allObject.list[candidates[i].ID];

			if (theObject == null || this.ID == theObject.ID || this.ID == theObject.senderID) continue;
			
			theObject.isOverlapping(this);
		}
	}

	update() {
		this.collision();
	}

	collisionReaction(hitCreature){
		if (hitCreature.objectType == "AI"){
			hitCreature.collisionCreatureList.push(this);
		}
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

class player extends creature {
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

	collisionReaction(hitCreature) {
		creature.prototype.collisionReaction.call(this, hitCreature); // call parent collisionReaction function
	}

	update() {
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

	removeOnWorker() { // Worker side
		mapList[this.mapIndex].playerIDArray.remove(allObject.list, this.ID);
		this.remove();
	}

	remove() {
		creature.prototype.remove.call(this); // call parent remove function
		allPlayer.remove(this.playerID);
	}

	getInfo() {
		return {
			... creature.prototype.getInfo.call(this),
			playerID: this.playerID
		};
	}
}

class AI extends creature {
	constructor(name, mapIndex, spawnPos) {
        super(name, "AI", spawnPos == null ? [0, 0, 0] : spawnPos, mapIndex, "defaultMonster", 1);  // explicitly call parent constructor.
		if (spawnPos == null) this.changePosition(this.findNoCollisionPosition());

		this.velocity = [0,0,0];
		this.onGround = false;
		this.collisionCreatureList = [];
    }

	initWorker(){
		creature.prototype.initWorker.call(this); // call parent initWorker function

		mapList[this.mapIndex].AIIDArray.add(allObject.list, this.ID);
	}

	collisionReaction(hitCreature){
		creature.prototype.collisionReaction.call(this, hitCreature); // call parent collisionReaction function
	}

	update(delta){
		this.collisionCreatureList = [];
		creature.prototype.update.call(this); // call parent update function

        //this.position[0] += 2 * delta;
        //this.position[1] += 2 * delta;
		let moveVector = [1,0];
		let speed = this.properties.get("moveSpeed");

        // Variable Declaration 
        let translateSpeed = 30 * (0.9 + this.getRadius() / 5) * delta * speed; 
        let totalTranslateDistance = [0, 0, 0];
        let friction = [0, 0, 0]; // Friction

        this.velocity[2] -= gravity * delta; // Gravity Update 

        if (this.onGround){
            friction[0] += 0.5 * gravity + speed * moveVector[0] * 2;
            friction[1] += 0.5 * gravity + speed * moveVector[1] * 2;
        }else{
            friction[0] += 0.1 * gravity;
            friction[1] += 0.1 * gravity;
            translateSpeed /= 10;
        }

        if (this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1] < speed * speed){
            if (Math.abs(this.velocity[1]) < speed * moveVector[1]){
                if (moveVector[1] > 0) this.velocity[1] += translateSpeed * moveVector[1];
                else if (moveVector[1] < 0) this.velocity[1] -= translateSpeed * moveVector[1];
            }

            if (Math.abs(this.velocity[0]) < speed * moveVector[0]){
                if (moveVector[0] > 0) this.velocity[0] += translateSpeed * moveVector[0];
                else if (moveVector[0] < 0) this.velocity[0] -= translateSpeed * moveVector[0];
            }
        }
        
        for (let i = 0; i < 3; ++i){
            if (this.velocity[i] > 0) {
                this.velocity[i] -= friction[i] * delta;
                if (this.velocity[i] < 0) {
                    this.velocity[i] = 0;
                }
            } else if(this.velocity[i] < 0) {
                this.velocity[i] += friction[i] * delta;
                if (this.velocity[i] > 0) {
                    this.velocity[i] = 0;
                }
            }
            totalTranslateDistance[i] += this.velocity[i] * delta;
        }

        let playerTranslateDistance = this.creatureCollision(totalTranslateDistance);
        totalTranslateDistance = this.mapCollision(playerTranslateDistance);

        if (Math.abs(playerTranslateDistance[2] - totalTranslateDistance[2]) > 0.001) {
            this.velocity[2] = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        for (let i = 0; i < 3; ++i) this.position[i] += totalTranslateDistance[i];
	}

	removeOnWorker() { // Worker side
		mapList[this.mapIndex].AIIDArray.remove(allObject.list, this.ID);
		this.remove();
	}

	remove() {
		creature.prototype.remove.call(this); // call parent remove function
	}

	getInfo() {
		return {
			... creature.prototype.getInfo.call(this)
		};
	}

	// Creature Collision Detection 
    creatureCollision(translateDistance) { 
        // For Collision Detection 
        let theCreature;
        // Checking Collision With Every Other Creature 
        for (let i = 0; i < this.collisionCreatureList.length; ++i) { 
            theCreature = this.collisionCreatureList[i];

            // For Calculating Manhattan Distance
            let diffX = this.position[0] + translateDistance[0] - theCreature.position[0];
			let diffY = this.position[1] + translateDistance[1] - theCreature.position[1];
            let diffZ = this.position[2] + translateDistance[2] - theCreature.position[2];
            let centerSizeDiff = this.getRadius() + theCreature.getRadius();
            if (Math.abs(diffX) + Math.abs(diffY) + Math.abs(diffZ) > centerSizeDiff + centerSizeDiff + centerSizeDiff) continue; 
            

            // If Collision Occur, Move In Opposite Direction And Return True
            // Calculate Direct Distance To Squared
            let amount = diffX * diffX + diffY * diffY + diffZ * diffZ;
            if (amount < centerSizeDiff * centerSizeDiff) { 
                //console.log("Collided With Creature", creatureIndex);
                
                let rate = centerSizeDiff / Math.sqrt(amount) - 1;
                if (rate === Infinity) rate = 1;
                // Indicate Collision Occurred 
                return [translateDistance[0] + diffX * rate,
                        translateDistance[1] + diffY * rate,
                        translateDistance[2] + diffZ * rate];
            } 
        } 
 
        // No Collision Has Occurred 
        return translateDistance; 
    } 

	// Surrounding Unit Collision Detection
    surroundingCollision(currentPosition, translateDistance){ 
        let [offSetX, offSetY, offSetZ] = translateDistance;
		let radius = this.getRadius();
		let theMap = mapList[this.mapIndex];
        if (translateDistance[0] != 0 || translateDistance[1] != 0 || translateDistance[2] != 0) {

            let limitRange = radius * radius;
            let directionX = translateDistance[0] > 0 ? 1 : -1;
            let directionY = translateDistance[1] > 0 ? 1 : -1;

            // Variable Declaration For Checking Collision
            
            let predictedMapX = Math.floor(currentPosition[0] + 0.5);
            let predictedMapY = Math.floor(currentPosition[1] + 0.5);

            let unitRange = Math.ceil(radius);
            for (let mapShiftY = -unitRange; mapShiftY <= unitRange; ++mapShiftY) {
                for (let mapShiftX = -unitRange; mapShiftX <= unitRange; ++mapShiftX) {
                    // Center Of The Circle
                    let cx = currentPosition[0] + offSetX;
                    let cy = currentPosition[1] + offSetY;
                    let cz = currentPosition[2] + offSetZ;

                    // Bottom Left Of The Square
                    let rx = predictedMapX + mapShiftX * directionX;
                    let ry = predictedMapY + mapShiftY * directionY;
                    let rz = Infinity;

                    let theUnit = theMap.getUnit([rx, ry]);

                    if (theUnit != null){
                        rz = theUnit.get("height");
                        if (theUnit.getChildIDProperty("collision")){
                            rz += 1; //childUnit Height
                        }
                    }

                    rx -= 0.5;
                    ry -= 0.5;
                    
                    // Getting Which Edge Or Corner The Circle Is Closest To
                    let testX = cx;
                    let testY = cy;
                    let testZ = cz;

                    if (testX < rx) testX = rx;
                    else if (testX > rx + 1) testX = rx + 1;

                    if (testY < ry) testY = ry;
                    else if (testY > ry + 1) testY = ry + 1;

                    if (testZ > rz) testZ = rz;

                    // Getting Difference In Distance
                    let distX = cx - testX;
                    let distY = cy - testY;
                    let distZ = cz - testZ;
                    let amount = distX * distX + distY * distY + distZ * distZ;
                    
                    // Collision Has Occur 
                    if (amount < limitRange) {
                        let rate = radius / Math.sqrt(amount) - 1;
                        if (rate === Infinity) rate = 1;

                        offSetX += distX * rate;
                        offSetY += distY * rate;
                        offSetZ += distZ * rate;
                    }
                }
            }
        }

        return [offSetX, offSetY, offSetZ];
    }

    // Map Collision Detection
    mapCollision(translateDistance){
        let unitTranslateDistance = [translateDistance[0], translateDistance[1], translateDistance[2]]; // Copy
		let radius = this.getRadius();
        let checkAmount = radius / 2 > 0.3 ? 0.3 : radius / 2;
        let count = [1, 1, 1];
        let dir = [unitTranslateDistance[0] > 0 ? 1 : -1, unitTranslateDistance[1] > 0 ? 1 : -1, unitTranslateDistance[2] > 0 ? 1 : -1];
        let isCollision = [false, false, false];
        let currentPosition = this.getPositionArray();
        let newTranslateDistance, i;
        while (unitTranslateDistance[0] * dir[0] > 0 || unitTranslateDistance[1] * dir[1] > 0|| unitTranslateDistance[2] * dir[2] > 0){

            for (i = 0; i < 3; ++i){
                if (isCollision[i]){
                    count[i] = 0;
                } else {
                    if (unitTranslateDistance[i] * dir[i] > checkAmount){
                        count[i] = dir[i] * checkAmount;
                    } else if (unitTranslateDistance[i] * dir[i] > 0){
                        count[i] = unitTranslateDistance[i];
                    } else {
                        count[i] = 0;
                    }
                }

                unitTranslateDistance[i] -= dir[i] * checkAmount;
            }
            
            newTranslateDistance = this.surroundingCollision(currentPosition, count);
            
            for (i = 0; i < 3; ++i){
                currentPosition[i] += newTranslateDistance[i];

                if (Math.abs(count[i]) > Math.abs(newTranslateDistance[i])) {
                    isCollision[i] = true;
                };
            }

            if (isCollision.includes(true)) break;
        }
        
        return [currentPosition[0] - this.position[0],
                currentPosition[1] - this.position[1],
                currentPosition[2] - this.position[2]]; 
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

// Export Module
module.exports = {player, AI, properties, allPlayer, defaultProperties};