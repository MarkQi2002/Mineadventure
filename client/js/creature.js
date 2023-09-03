// Loading Creature THREE Geometry
var creatureLoader = {
    creatureGeometry: new THREE.SphereGeometry(1, 3, 3),
    playerGeometry: new THREE.SphereGeometry(1, 10, 10)
};

// Object Class
class object {
    // Object Class Constructor
	constructor(info) {
		this.ID = info.ID;
        this.objectType = info.objectType;
        this.object = new THREE.Object3D();
        this.object.position.set(info.position[0], info.position[1], info.position[2]);
        this.setRadius(info.radius)
        scene.add(this.object);

        if (objectList.length <= this.ID) objectList.length = this.ID + 100;
        objectList[this.ID] = this;
    }

    // Set Object Radius
    setRadius(value) {
        this.radius = value;
        this.object.scale.set(this.radius, this.radius, this.radius);
    }

    // Change Object Position
	changePosition([x, y, z]) {
		this.object.position.x = x;
		this.object.position.y = y;
		this.object.position.z = z;
	}

    // Get Object Position
	getPositionArray() {
		return [
            this.object.position.x,
            this.object.position.y,
            this.object.position.z
        ];
	}

    // Remove Object
    remove() {
        // Remove All Child Object
        var obj;
        for (var i = this.object.children.length - 1; i >= 0; i--) {
            obj = this.object.children[i];
            this.object.remove(obj);
        }
        scene.remove(this.object);
        objectList[this.ID] = null;
    };
}

// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
// Creature Class Inherite Object Class
class creature extends object{
    // Creature Class Constructor
    constructor(creatureInfo) {
        super(creatureInfo);

        // Creating THREE Object
        this.camp = creatureInfo.camp;
        this.state = creatureInfo.state;
        this.campInfo = creatureInfo.campInfo;

        // Creature Information
        this.name = creatureInfo.name;
        this.properties = creatureInfo.properties;

        this.creatureItemArray = creatureInfo.creatureItemArray;

        // On Head UI
        this.onHeadUI = new creatureUI(this);
        this.updateHealthBarPercent();

        // creature Body
        let geometry = this.objectType == "player" ? creatureLoader.playerGeometry : creatureLoader.creatureGeometry;
        let material = new THREE.MeshPhongMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random(), 0.4)});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);
    }

    // Damage Handler
    damage(amount) {
        this.setHealth(this.properties.health - amount);
    }

    // Health Handler
    setHealth(amount) {
        this.properties.health = amount;
        this.updateHealthBarPercent();
    }

    // Max Health Handler
    setMaxHealth(amount) {
        this.properties.maxHealth = amount;
        this.updateHealthBarPercent();
    }

    // Setting Game Level
    setLevel(newLevel){
        this.properties.level = newLevel;
        this.onHeadUI.updateLevel();
    }

    // Updating Health Bar UI
    updateHealthBarPercent() {
        let scale = this.properties.health / this.properties.maxHealth;
        if (scale < 0) scale = 0;
        else if(scale > 1) scale = 1;

        this.onHeadUI.setScale(scale);
    }

    // Update For Creature
    update(delta) {
        if (this.onHeadUI.UI.style.visibility == 'hidden'){
            this.onHeadUI.UI.style.visibility = 'visible';
        }
        this.onHeadUI.update();
    }

    // Creature Class Destructor
    remove() {
        // Call Parent Remove Function
        object.prototype.remove.call(this);
        this.onHeadUI.remove();
    }
}

// Player Class Inherite Creature Class
class player extends creature {
    constructor(playerInfo) {
        // Calling Parent Constructor
        super(playerInfo);

        this.playerID = playerInfo.playerID;

        if (playerArray.length <=  this.playerID) playerArray.length =  this.playerID + 1;
        playerArray[this.playerID] = this;
    }

    // Player Class Destructor
    remove() {
        // Call Parent Remove Function
        creature.prototype.remove.call(this);
        playerArray[this.playerID] = null;
        delete this;
    }
}