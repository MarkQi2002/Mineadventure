// Import Modules
const {object, sphere, allObject} = require('./object.js');
const {mapList} = require('./mapClass.js');

// Variable Declaration
var projectileRemoveList = [];

// Projectile Class Inherite Sphere Class
class projectile extends sphere {
    // Projectile Constructor
    constructor(projectileInfo, sender) {
        super(sender.position, "projectile", sender.getRadius() / 3, sender.mapIndex);

        let speed = sender.properties.get("projectileSpeed") * (0.9 + sender.getRadius() / 5);

        this.initVelocity = [
            speed * projectileInfo.initVelocity[0],
            speed * projectileInfo.initVelocity[1]
        ];

        this.senderID = sender.ID;
        this.damageInfo = null;
    }

    // Projectile Initialization Worker
    initWorker() {
		mapList[this.mapIndex].projectileIDArray.add(allObject.list, this.ID);
	}

    // Projectile Collision Reaction
    collisionReaction(hitCreature) {
        hitCreature.collisionReaction(this);
	}

    // Worker Side Remove Projectile
    removeOnWorker() {
        mapList[this.mapIndex].projectileIDArray.remove(allObject.list, this.ID);
		this.remove();
	}

    // Remove Projectile
    remove() {
        // Call Parent Remove Function
		sphere.prototype.remove.call(this);
	}

    // Get Projectile Information
    getInfo() {
        return {
            ... sphere.prototype.getInfo.call(this),
            initVelocity: this.initVelocity,
            senderID: this.senderID,
            damageInfo: this.damageInfo
        };
    }

    // Projectile Update Function
    update(delta) {
        let theMap = mapList[this.mapIndex];
        this.position[0] += this.initVelocity[0] * delta;
        this.position[1] += this.initVelocity[1] * delta;

        let removing = false;

        // Map Collision
        let unitRange = Math.ceil(this.getRadius());
        let predictedMapX = Math.floor(this.position[0] + 0.5);
        let predictedMapY = Math.floor(this.position[1] + 0.5);
        let limitRange = this.getRadius() * this.getRadius();

        // Iterate Through Projectile Range By UnitRange
        for (let mapShiftY = -unitRange; mapShiftY <= unitRange; ++mapShiftY) {
            for (let mapShiftX = -unitRange; mapShiftX <= unitRange; ++mapShiftX) {
                // Bottom Left Of The Square
                let rx = predictedMapX + mapShiftX;
                let ry = predictedMapY + mapShiftY;
                let rz = Infinity;
                let theUnit = theMap.getUnit([Math.floor(rx + 0.5), Math.floor(ry + 0.5)]);

                rx -= 0.5;
                ry -= 0.5;

                let isChildDestroyable = false;

                if (theUnit != null) {
                    rz = theUnit.get("height");
                    isChildDestroyable = theUnit.getChildIDProperty("destroyable")
                    if (isChildDestroyable){
                        rz += 1; //childUnit Height
                    }
                }

                // Getting Which Edge Or Corner The Circle Is Closest To
                let testX = this.position[0];
                let testY = this.position[1];
                let testZ = this.position[2];

                if (testX < rx) testX = rx;
                else if (testX > rx + 1) testX = rx + 1;
                if (testY < ry) testY = ry;
                else if (testY > ry + 1) testY = ry + 1;

                if (testZ > rz) testZ = rz;

                // Getting Difference In Distance
                let distX = this.position[0] - testX;
                let distY = this.position[1] - testY;
                let distZ = this.position[2] - testZ;

                // Collision Has Occur
                if (distX * distX + distY * distY + distZ * distZ < limitRange) {
                    // Hit Empty Space
                    if (theUnit == null) {
                        removing = true;
                    // Hit Child Unit
                    } else if (isChildDestroyable) {
                        removing = true;
                        theUnit.set("childID", 0);
                        theUnit.updateToClient();
                    // Hit Unit
                    } else if (theUnit.getIDProperty("destroyable")) {
                        removing = true;
                        let replacingUnit = theUnit.getIDProperty("replacingUnit");
                        if (replacingUnit == null) {
                            let newHeight = theUnit.get("height") - 0.1
                            if (newHeight <= 0){
                                newHeight = 0;
                                replacingUnit = theMap.mapMethod.inputs.defaultReplacingUnit;
                            }
                            theUnit.set("height", newHeight);
                        }
                        if (replacingUnit != null) theUnit.set("ID", replacingUnit);
                        theUnit.updateToClient();
                    }
                    // TODO Add Projectile Collision With Creature
                }
            }
        }

        // Remove Projectile
        if (removing) {
            projectileRemoveList.push(this.ID);
            this.removeOnWorker();
        }

        return removing;
    }
}

// Export Module
module.exports = {projectile, projectileRemoveList};