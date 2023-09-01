// Import Modules
const {dynamicList} = require('./dataStructure/dynamicList.js');
const {mapList} = require('./mapClass.js');

// Dynamic List To Store Objects
var allObject = new dynamicList("Object List", 1500, 500);

// Object Class
class object {
	// Object Class Constructor
	constructor(spawnPos, objectType, mapIndex) {
		this["position"] = new Float32Array(new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * 3));
		this.changePosition(spawnPos);

		this["objectType"] = objectType;
		this["ID"] = allObject.add(this);
		this.mapIndex = mapIndex;
    }

	// Object Collision Output
	collisionReaction() {
		console.log("Object ID: " + this["ID"] + " Collided")
	}

	// Remove Current Object
	remove() {
		allObject.remove(this.ID);
	}

	// Change Object Position
	changePosition([x, y, z]) {
		this.position[0] = x;
		this.position[1] = y;
		this.position[2] = z;
	}

	// Get Object Position
	getPositionArray() {
		return [this.position[0], this.position[1], this.position[2]];
	}

	// Get Object Information
	getInfo() {
		return {
			position: this.getPositionArray(),
			ID: this.ID,
			objectType: this.objectType,
		};
	}
}

// Sphere Class Inherite Object Class
class sphere extends object{
	// Sphere Class Constructor
	constructor(spawnPos, objectType, radius, mapIndex) {
		super(spawnPos, objectType, mapIndex);
		this.collisionShape = "sphere";
		this.radius = new DataView(new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT), 0, Float32Array.BYTES_PER_ELEMENT);
		this.setRadius(radius);
    }

	// Set Sphere Radius
	setRadius(value) {
		this.radius.setFloat32(0, value);
	}

	// Get Sphere Radius
	getRadius() {
		return this.radius.getFloat32(0);
	}

	// Remove Sphere
	remove() {
		object.prototype.remove.call(this);
	}

	// Calculate Sphere Overlapping With Sphere
	isOverlapping(hitObject) {
		// Calculate XYZ Coordinate Difference
		let diffX = hitObject.position[0] - this.position[0];
		let diffY = hitObject.position[1] - this.position[1];
		let diffZ = hitObject.position[2] - this.position[2];
		let centerSizeDiff = hitObject.getRadius() + this.getRadius();

		// Calculate Manhattan Distance
		if (Math.abs(diffX) + Math.abs(diffY) + Math.abs(diffZ) < centerSizeDiff + centerSizeDiff + centerSizeDiff) {
			// Calculate Distance To Squared
			if (diffX * diffX + diffY * diffY + diffZ * diffZ <= centerSizeDiff * centerSizeDiff) {
				this.collisionReaction(hitObject);
			}
		}
	}

	// Get Sphere Information
	getInfo() {
		return {
			... object.prototype.getInfo.call(this),
			collisionShape: this.collisionShape,
			radius: this.getRadius(),
		};
	}

	// Find Closest No Collision Position For Sphere
	findNoCollisionPosition() {
		// Variable Declaration
		let theMap = mapList[this.mapIndex];
		let mapX, mapY, mapShiftX, mapShiftY, theUnit;
		let unitRange = Math.floor(this.getRadius());
		let findCount = 0;

		// Randomly Generate XY Coordinate Until Found One That Doesn't Collide With The Wall
		checkRandomPosition:
			while (findCount < 100) {
				++findCount;
				mapX = Math.random() * theMap.size.x >> 0;
				mapY = Math.random() * theMap.size.y >> 0;
				for (mapShiftY = -unitRange; mapShiftY <= unitRange; ++mapShiftY) {
					for (mapShiftX = -unitRange; mapShiftX <= unitRange; ++mapShiftX) {
						theUnit = theMap.getUnit([mapX + mapShiftX, mapY + mapShiftY]);
						if (theUnit == null || theUnit.getCollision()) continue checkRandomPosition;
					}
				}

				break;
			}

		// Return Valid Position XY Coordinate
		return [mapX, mapY, 10];
	}
}

// Export Module
module.exports = {object, sphere, allObject};