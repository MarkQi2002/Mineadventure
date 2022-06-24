// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
class creature{
    constructor(name, position, health, armor, attackDamage, attackSpeed) {
        this.name = name;
        this.object = new THREE.Object3D();
        this.object.position.set(position[0], position[1], position[2]);
        
        // Defensive Creature Property
        this.health = health;
        this.armor = armor;

        // Attack Creature Property
        this.attackDamage = attackDamage;
        this.attackSpeed = attackSpeed;

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
    constructor(name, position, health, armor, attackDamage, attackSpeed) {
        // Calling Parent Constructor
        super(name, position, health, armor, attackDamage, attackSpeed)

        this.playerItemArray = {
            "Blood Orb" : 0,
            "Attack Orb" : 0
        }

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.5, 10, 10);
        let material = new THREE.MeshPhongMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true; //default is false
        mesh.receiveShadow = false;
        this.object.add(mesh);
    }
}