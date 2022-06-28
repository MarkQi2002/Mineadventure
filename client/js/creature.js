var healthBarLoader = {
    innerGeometry: new THREE.PlaneGeometry(0.1, 0.01),
    innerMaterial: new THREE.MeshBasicMaterial({color: 'red', transparent: true, opacity: 0.75}),

    outerGeometry: new THREE.PlaneGeometry(0.105, 0.015),
    outerMaterial: new THREE.MeshBasicMaterial({color: 'white', transparent: true, opacity: 0.5})
};

// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
class creature{
    constructor(playerInfo) {
        this.name = playerInfo.name;
        this.object = new THREE.Object3D();
        this.object.position.set(playerInfo.position[0], playerInfo.position[1], playerInfo.position[2]);
        
        // Defensive Creature Property
        this.health = playerInfo.health;
        this.maxHealth = playerInfo.maxHealth;
        this.armor = playerInfo.armor;

        // Attack Creature Property
        this.attackDamage = playerInfo.attackDamage;
        this.attackSpeed = playerInfo.attackSpeed;

        scene.add(this.object);


        // HealthBar
        this.healthBar = new THREE.Mesh(healthBarLoader.outerGeometry, healthBarLoader.outerMaterial);
        this.innerHealthBar = new THREE.Mesh(healthBarLoader.innerGeometry, healthBarLoader.innerMaterial);        
        this.healthBar.add(this.innerHealthBar);
        this.innerHealthBar.position.set(0, 0, 0.0001);
        camera.add(this.healthBar);
        this.healthBar.position.set(0, 0, -1);

        
        
    }

    damage(amount){
        this.setHealth(this.health - amount);

    }

    setHealth(amount){
        this.health = amount;
        let scale = this.health / this.maxHealth;
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
        super(playerInfo)

        this.playerItemArray = {
            "Blood Orb" : 0,
            "Attack Orb" : 0
        }

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.5, 10, 10);
        let material = new THREE.MeshPhongMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);
    }
}