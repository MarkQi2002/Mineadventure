// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
class creature{
    constructor(playerInfo) {
        this.name = playerInfo.name;
        this.object = new THREE.Object3D();
        this.object.position.set(playerInfo.position[0], playerInfo.position[1], playerInfo.position[2]);
        
        // Defensive Creature Property
        this.health = playerInfo.health;
        this.armor = playerInfo.armor;

        // Attack Creature Property
        this.attackDamage = playerInfo.attackDamage;
        this.attackSpeed = playerInfo.attackSpeed;

        scene.add(this.object);
    }

    damage(amount) {
        this.health -= amount;
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