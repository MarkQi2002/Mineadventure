// Health Bar THREE Mesh
var healthBarLoader = {
    innerGeometry: new THREE.PlaneGeometry(0.1, 0.01),
    innerMaterial: new THREE.MeshBasicMaterial({color: 'red', transparent: true, opacity: 0.75}),

    outerGeometry: new THREE.PlaneGeometry(0.105, 0.015),
    outerMaterial: new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.5})
};

var creatureLoader = {
    geometry: new THREE.SphereGeometry(0.5, 3, 3)
};

// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
class creature{
    constructor(creatureInfo) {
        // Creating THREE Object
        this.object = new THREE.Object3D();
        this.object.position.set(creatureInfo.position[0], creatureInfo.position[1], creatureInfo.position[2]);
        scene.add(this.object);

        // Creature Information
        this.name = creatureInfo.name;
        this.properties = creatureInfo.properties;
        this.creatureItemArray = creatureInfo.creatureItemArray;

        // HealthBar
        this.healthBar = new THREE.Mesh(healthBarLoader.outerGeometry, healthBarLoader.outerMaterial);
        this.innerHealthBar = new THREE.Mesh(healthBarLoader.innerGeometry, healthBarLoader.innerMaterial);        
        this.healthBar.add(this.innerHealthBar);
        this.innerHealthBar.position.set(0, 0, 0.0001);
        camera.add(this.healthBar);
        this.healthBar.position.set(0, 0, -1);

        this.updateHealthBarPercent();
    }

    damage(amount){
        this.setHealth(this.properties["health"] - amount);

    }

    setHealth(amount){
        this.properties["health"] = amount;
        this.updateHealthBarPercent();
    }

    setMaxHealth(amount){
        this.properties["maxHealth"] = amount;
        this.updateHealthBarPercent();
    }

    updateHealthBarPercent(){
        let scale = this.properties["health"] / this.properties["maxHealth"];
        if (scale < 0){
            scale = 0;
        }else if(scale > 1){
            scale = 1;
        }
        this.innerHealthBar.scale.x = scale;
        this.innerHealthBar.position.x = (scale - 1) * 0.05;

    }


    update(delta){
        let localPlayerObject = player_controller.creature.object;
        // Close To Local Player Event
        if (Math.abs(localPlayerObject.position.x - this.object.position.x) < game_map.blockSize.x &&
            Math.abs(localPlayerObject.position.y - this.object.position.y) < game_map.blockSize.y){
                this.healthBar.visible = true;
                this.updateHealthBar();
        }else{
            this.healthBar.visible = false;
        }

    }
    
    updateHealthBar(){
        let normal3D = new THREE.Vector3(this.object.position.x, this.object.position.y, this.object.position.z);
        normal3D.project(player_controller.camera);
        this.healthBar.position.x = normal3D.x * 0.78 * window.innerWidth / window.innerHeight;
        this.healthBar.position.y = normal3D.y * 0.78 + 0.05;
    }


    delete() {
        // Remove All Child Object
        var obj;
        for(var i = this.object.children.length - 1; i >= 0; i--) { 
            obj = this.object.children[i];
            obj.geometry.dispose();
            obj.material.dispose();
            this.object.remove(obj); 
        }
        scene.remove(this.object);
        this.healthBar.remove(this.healthBar.children);
        player_controller.camera.remove(this.healthBar);
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