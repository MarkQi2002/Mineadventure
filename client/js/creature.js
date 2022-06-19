class creature{
    constructor(name, position, health) {
        this.name = name;
        this.object = new THREE.Object3D();
        this.object.position.set(position[0],position[1],position[2]);
        this.health = health;
        scene.add( this.object );
    }

    damage(amount){
        this.health -= amount;
    }

}


class player extends creature{
    constructor(name, position, health) {
        super(name,position, health)

        //cube body
        let geometry = new THREE.SphereGeometry( 0.5, 10, 10 );
        let material = new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(), Math.random(), Math.random()) } );
        let mesh = new THREE.Mesh( geometry, material );
        this.object.add( mesh );


    }



}