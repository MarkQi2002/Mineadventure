// Loading Projectile THREE Geometry And Mesh
var projectileLoader = {
    geometry: new THREE.SphereGeometry(0.2, 10, 10),
    material: new THREE.MeshPhongMaterial({color: 'yellow'})
};

// Projectile Class
class projectile{
    // Projectile Constructor
    constructor(projectileInfo) {
        this.object = new THREE.Object3D();
        this.object.position.set(projectileInfo.position[0], projectileInfo.position[1], projectileInfo.position[2]);
        
        this.initVelocity = projectileInfo.initVelocity;
        
        this.damageInfo = projectileInfo.damageInfo;

        this.range;
        
        this.spawnMesh()
        scene.add(this.object);
    }
    
    // Spawing The Projectile Mesh
    spawnMesh(){
        let mesh = new THREE.Mesh(projectileLoader.geometry, projectileLoader.material);
        this.object.add(mesh);
    }

    // Updating Projectile Position
    positionChange(projectilePos){
        if (projectilePos != null){
            this.object.position.x = projectilePos[0];
            this.object.position.y = projectilePos[1];
        }

    }

    // Removing A Projectile Object
    delete() {
        // Remove All Child Object
        var obj;
        for (var i = this.object.children.length - 1; i >= 0; i--) { 
            obj = this.object.children[i];
            this.object.remove(obj); 
        }
        scene.remove(this.object);
        delete this;
    }
}
