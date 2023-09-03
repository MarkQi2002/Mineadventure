// Loading Projectile THREE Geometry And Mesh
var projectileLoader = {
    geometry: new THREE.SphereGeometry(1, 10, 10),
    material: new THREE.MeshPhongMaterial({color: 'yellow'})
};

// Projectile Class
class projectile extends object{
    // Projectile Class Constructor
    constructor(projectileInfo) {
        super(projectileInfo);
        this.initVelocity = projectileInfo.initVelocity;
        this.damageInfo = projectileInfo.damageInfo;
        this.range;
        this.spawnMesh()
    }

    // Spawing The Projectile Mesh
    spawnMesh() {
        let mesh = new THREE.Mesh(projectileLoader.geometry, projectileLoader.material);
        this.object.add(mesh);
    }

    // Updating Projectile Position
    positionChange(projectilePos) {
        this.object.position.x = projectilePos[0];
        this.object.position.y = projectilePos[1];
    }

    // Removing A Projectile Object
    remove() {
        object.prototype.remove.call(this); // call parent remove function
        delete this;
    }
}