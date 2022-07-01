class AI_controller {
    constructor(creatureInfo) {
        this.creature = creatureInfo;
        this.targetPosition = [0,0];

        


    }

    moveToPosition(delta){
        let diffX = this.targetPosition[0] - this.creature.position[0];
        let diffY = this.targetPosition[1] - this.creature.position[1];

        let magnitude = Math.sqrt(diffX * diffX + diffY * diffY);

        let vectorX = diffX / magnitude;
        let vectorY = diffY / magnitude;

        this.creature.position[0] += delta * this.creature.properties["moveSpeed"] * vectorX;
        this.creature.position[1] += delta * this.creature.properties["moveSpeed"] * vectorY;
    }

    update(delta){
        this.moveToPosition(delta);
    }




}



// Required Because server.js Uses This JavaScript File
module.exports = AI_controller;