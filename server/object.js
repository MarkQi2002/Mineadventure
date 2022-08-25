const {dynamicList} = require('./dataStructure/dynamicList.js');
const {mapList} = require('./mapClass.js');

var allObject = new dynamicList("Object List", 1500, 500);

class object{
	constructor(spawnPos, objectType, mapIndex) {
		this["position"] = new Float32Array(new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * 3));
		this.changePosition(spawnPos);
		this["objectType"] = objectType;
		this["ID"] = allObject.add(this);
		this.mapIndex = mapIndex;

    }

	collisionReaction(){
		console.log("object coll")
	}

	remove(){
		allObject.remove(this.ID);
	}

	changePosition([x, y, z]){
		this.position[0] = x;
		this.position[1] = y;
		this.position[2] = z;
	}

	getPositionArray(){
		return [this.position[0], this.position[1], this.position[2]];
	}

	getInfo(){
		return {
			position: this.getPositionArray(),
			ID: this.ID,
			objectType: this.objectType,
		};
	}

}


class sphere extends object{
	constructor(spawnPos, objectType, radius, mapIndex) {
		super(spawnPos, objectType, mapIndex);
		this.collisionShape = "sphere";
		this.radius = new DataView(new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT), 0, Float32Array.BYTES_PER_ELEMENT);
		this.setRadius(radius);
    }

	setRadius(value){
		this.radius.setFloat32(0, value);
	}

	getRadius(){
		return this.radius.getFloat32(0);
	}

	remove(){
		object.prototype.remove.call(this);
	}

	isOverlapping(hitObject){
		// Calculate XY Coordinate Difference
		let diffX = hitObject.position[0] - this.position[0];
		let diffY = hitObject.position[1] - this.position[1];
		let centerSizeDiff = hitObject.getRadius() + this.getRadius();
		
		// Calculate Manhattan Distance
		if (Math.abs(diffX) + Math.abs(diffY) < centerSizeDiff + centerSizeDiff){
			// Calculate Z Coordinate Difference
			let diffZ = hitObject.position[2] - this.position[2];                                                                                                                                                                                                                                               
			
			// Calculate Distance To Squared
			if (diffX * diffX + diffY * diffY + diffZ * diffZ <= centerSizeDiff * centerSizeDiff){

				this.collisionReaction(hitObject);

			}
		}
	}

	getInfo(){
		return {
			... object.prototype.getInfo.call(this),
			collisionShape: this.collisionShape,
			radius: this.getRadius(),
		};
	}


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

module.exports = {object, sphere, allObject};