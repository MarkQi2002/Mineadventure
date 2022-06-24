class damage{
    constructor(amount, damageType) {
        this.damageType = damageType;
        scene.add(this.object);
    }

    damage(amount) {
        
    }

    delete() {
        delete this;
    }
}