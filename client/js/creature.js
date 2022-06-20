// The Most Basic Class, All Other Class (Player, Monster) Will Built Upon This By Inheritance
class creature{
    constructor(name, position, health) {
        this.name = name;
        this.object = new THREE.Object3D();
        this.object.position.set(position[0], position[1], position[2]);
        this.health = health;
        scene.add( this.object );
    }

    damage(amount) {
        this.health -= amount;
    }
}

// Player Class
class player extends creature{
    constructor(name, position, health) {
        // Calling Parent Constructor
        super(name,position, health)

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.5, 10, 10);
        let material = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);
    }
}