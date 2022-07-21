// Loading Creature THREE Geometry
var creatureLoader = {
    geometry: new THREE.SphereGeometry(0.5, 3, 3)
};

// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
class creature{
    // Creature Constructor
    constructor(creatureInfo) {
        // Creating THREE Object
        this.ID = creatureInfo.ID;
        this.camp = creatureInfo.camp;
        this.campInfo = creatureInfo.campInfo;
        this.object = new THREE.Object3D();
        this.object.position.set(creatureInfo.position[0], creatureInfo.position[1], creatureInfo.position[2]);
        scene.add(this.object);

        // Creature Information
        this.name = creatureInfo.name;
        this.properties = creatureInfo.properties;
        this.creatureItemArray = creatureInfo.creatureItemArray;

        // On Head UI
        this.onHeadUI = new creatureUI(this);
        this.updateHealthBarPercent();
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
        let localPlayerObject = player_controller.creature.object;
        // Close To Local Player Event
        if (Math.abs(localPlayerObject.position.x - this.object.position.x) < game_map.blockSize.x &&
            Math.abs(localPlayerObject.position.y - this.object.position.y) < game_map.blockSize.y){
                if (this.object.visible == false){
                    this.object.visible = true;
                }
                if (this.onHeadUI.UI.style.visibility == 'hidden'){
                    this.onHeadUI.UI.style.visibility = 'visible';
                }
                this.onHeadUI.update(delta);
        } else {
            if (this.object.visible == true){
                this.object.visible = false;
            }
            if (this.onHeadUI.UI.style.visibility == 'visible'){
                this.onHeadUI.UI.style.visibility = 'hidden';
            }
        }
    }
    
    // Destructor
    delete() {
        this.onHeadUI.delete();

        // Remove All Child Object
        var obj;
        for (var i = this.object.children.length - 1; i >= 0; i--) { 
            obj = this.object.children[i];
            obj.geometry.dispose();
            obj.material.dispose();
            this.object.remove(obj); 
        }
        scene.remove(this.object);
        delete this;
    }
}

// Player Class
class player extends creature {
    constructor(playerInfo) {
        // Calling Parent Constructor
        super(playerInfo);

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.5, 10, 10);
        let material = new THREE.MeshPhongMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random(), 0.4)});
        let mesh = new THREE.Mesh(geometry, material);

        this.object.add(mesh);
    }
}

// Monster Class
class monster extends creature {
    constructor(monsterInfo) {
        // Calling Parent Constructor
        super(monsterInfo);

        // Spherical Body
        let material = new THREE.MeshPhongMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())});
        let mesh = new THREE.Mesh(creatureLoader.geometry, material);
        this.object.add(mesh);
    }
}