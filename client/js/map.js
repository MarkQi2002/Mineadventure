// Map Class
class map{
    // Constructor
    constructor(size) {
        this.size = size;
        this.object = new THREE.Object3D();
        this.object.position.set(0, 0, 0);
        this.spawn();
        scene.add(this.object);
    }

    spawn() {
        for (let x_Axis = -50; x_Axis < 50; x_Axis++) {
            for (let y_Axis = -50; y_Axis < 50; y_Axis++) {
                let geometry = new THREE.BoxGeometry(1, 1, 1);
                let material = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())} );
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x_Axis, y_Axis, 0);
                this.object.add(mesh);
            }
        }
    }
}