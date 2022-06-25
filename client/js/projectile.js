class projectile{
    constructor(projectileInfo) {
        this.object = new THREE.Object3D();
        this.object.position.set(projectileInfo.position[0], projectileInfo.position[1], projectileInfo.position[3]);
        
        this.initVelocity = projectileInfo.initVelocity;
        
        this.damageInfo = projectileInfo.damageInfo;


        this.range;
        


        this.spawnMesh()
        scene.add(this.object);
    }
    
    spawnMesh(){
        let geometry = new THREE.SphereGeometry(0.2, 10, 10);
        let material = new THREE.MeshPhongMaterial({color: 'yellow'});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);
    }

    update(delta){
        //this.object.translateX(this.initVelocity[0] * delta);
        //this.object.translateY(this.initVelocity[1] * delta);
    }

    positionChange(projectilePos){
        if (projectilePos != null){
            this.object.position.x = projectilePos[0];
            this.object.position.y = projectilePos[1];
        }

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
