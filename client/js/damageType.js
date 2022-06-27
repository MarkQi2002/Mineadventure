class damage{
    constructor(damageType) {
        this.amount = damageType.amount;
        this.attacker = damageType.attacker;
        scene.add(this.object);
    }

    damage(amount) {
        
    }

    delete() {
        delete this;
    }
}