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
    }



}