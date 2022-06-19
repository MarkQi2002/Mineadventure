//map
class map{
    constructor(size) {
        this.size = [size[0],size[1]];
        this.object = new THREE.Object3D();
        this.object.position.set(0,0,0);
        this.spawn();
        scene.add( this.object );
    }

    spawn(){
        for (let i = -50; i < 50; i++) {
            for (let ii = -50; ii <50; ii++) {
                let geometry = new THREE.BoxGeometry( 1, 1, 1 );
                let material = new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(), Math.random(), Math.random()) } );
                var mesh = new THREE.Mesh( geometry, material);
                mesh.position.set(i,ii,0);
                this.object.add( mesh );
            }
        }
    }



}



