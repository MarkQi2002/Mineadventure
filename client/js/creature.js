// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
class creature{
    constructor(name, position, health) {
        this.name = name;
        this.object = new THREE.Object3D();
        this.object.position.set(position[0], position[1], position[2]);
        this.health = health;
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
    constructor(name, position, health) {
        // Calling Parent Constructor
        super(name, position, health)

        this.playerItemArray = {
            "Blood Orb" : 0
        }

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.5, 10, 10);
        let material = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);
    }
}