class AI_controller {
    constructor(creatureInfo) {
        this.creature = creatureInfo;
        this.targetPositionList = [];
        this.routeCount = 0;
        this.searchRange = 32;

        // Attack Speed
        this.attackCD = 0;
    }


    sendProjectile(goal){
        // Get Unit Vector
        let [diffX, diffY] = [goal[0] - this.creature.position[0], goal[1] - this.creature.position[1]];
        let magnitude = Math.sqrt(diffX * diffX + diffY * diffY);

        let vectorX = diffX / magnitude;
        let vectorY = diffY / magnitude;

        // Setting Projectile Information
        var newDamageInfo = {
            amount: this.creature.properties["attackDamage"],
            attacker: ["monster", this.creature.ID]
        }

        var newProjectile = {
            position: [this.creature.position[0], this.creature.position[1], this.creature.position[2]],
            initVelocity: [8 * vectorX, 8 * vectorY],
            damageInfo: newDamageInfo
        };

        // Updating To Projectile List
        return newProjectile;
    }



    heuristic([fx, fy], [cx, cy]){
        return (Math.abs(fx - cx) + Math.abs(fy - cy)) * 10;
        //let [dx, dy] = [fx - cx, fy - cy]
        //return (dx * dx + dy * dy) * 10;
    }



    aStarAlgorithm(theMap, goal){
        let start = [Math.floor(this.creature.position[0]), Math.floor(this.creature.position[1])];
        
        let frontier = new PriorityQueue();
        frontier.enqueue({x: start[0], y: start[1], cost: 0, last: null}, 0);
        
        let current;
        let count = 0;
        while (!frontier.isEmpty() && count < 100){
            current = frontier.dequeue().element;

            if (current.x == goal[0] && current.y == goal[1]) return current;

            let neighbors = theMap.neighbors([current.x, current.y]);
            for (let i = 0; i < neighbors.length; ++i){
                let next = neighbors[i];

                if (Math.abs(start[0] - next[0]) + Math.abs(start[1] - next[1]) > this.searchRange) continue;

                let new_cost = current.cost + 1;

                let existData = frontier.isIn(next);

                if ( existData == null){
                    let priority = new_cost + this.heuristic(goal, next);
                    frontier.enqueue({x: next[0], y: next[1], cost: new_cost, last: current}, priority);
                } else if(new_cost < existData.element.cost){
                    let priority = new_cost + this.heuristic(goal, next);
                    frontier.remove(existData[1]);
                    frontier.enqueue({x: existData[0].element.x, y: existData[0].element.y, cost: new_cost, last: current}, priority);
                }
            }
            count ++;
        }



        return null;
    }


    getRoute(theMap, goal){
        let routePoints = [];

        let current = this.aStarAlgorithm(theMap, goal);
        while (current != null){
            routePoints.push([current.x, current.y]);
            current = current.last;

        }
        routePoints.reverse();
        routePoints.shift();

        return routePoints;

    }





    moveToPosition(delta){
        if (this.targetPositionList.length <= 0) return;

        let targetPosition = this.targetPositionList[0];

        let diffX = targetPosition[0] - this.creature.position[0];
        let diffY = targetPosition[1] - this.creature.position[1];

        let magnitude = Math.sqrt(diffX * diffX + diffY * diffY);

        let vectorX = diffX / magnitude;
        let vectorY = diffY / magnitude;

        this.creature.position[0] += delta * this.creature.properties["moveSpeed"] * vectorX;
        this.creature.position[1] += delta * this.creature.properties["moveSpeed"] * vectorY;

        // After movement if the difference of two position is oppsite compare to before
        if (((diffX < 0) != (targetPosition[0] - this.creature.position[0] < 0)) ||
            ((diffY < 0) != (targetPosition[1] - this.creature.position[1] < 0))){
            // Shift the targetPositionList
            this.targetPositionList.shift();
        }
    }

    update(delta, theMap, goal, spawnProjectile){



        
        if (this.routeCount > 10 && Math.abs(goal[0] - this.creature.position[0]) + Math.abs(goal[1] - this.creature.position[1]) < this.searchRange){
            let newRoute = this.getRoute(theMap, goal);
		    this.targetPositionList = newRoute;
            this.routeCount = 0;
        }
        this.routeCount++;
        this.moveToPosition(delta);


        // Attack
        if ( this.targetPositionList.length > 0 && this.attackCD <= 0){
            spawnProjectile([this.sendProjectile(goal)]);
            this.attackCD = 1;
        }

        if (this.attackCD > 0){
            this.attackCD -= this.creature.properties["attackSpeed"] * delta;
        }

        



    }




}






// User defined class
// to store element and its priority
class QElement {
    constructor(element, priority)
    {
        this.element = element;
        this.priority = priority;
    }
}
 
// PriorityQueue class
class PriorityQueue {
 
    // An array is used to implement priority
    constructor()
    {
        this.items = [];
    }
    
    get(index){
        return this.items[index];
    }

    // functions to be implemented
    // enqueue(item, priority)
    enqueue(element, priority){
        // creating object from queue element
        var qElement = new QElement(element, priority);
        var contain = false;
    
        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                // Once the correct location is found it is
                // enqueued
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }
    
        // if the element have the highest priority
        // it is added at the end of the queue
        if (!contain) {
            this.items.push(qElement);
        }
    }

    // dequeue()
    // dequeue method to remove
    // element from the queue
    dequeue()
    {
        // return the dequeued element
        // and remove it.
        // if the queue is empty
        // returns Underflow
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }

    remove(index){
        this.items.splice(index, 1);
    }

    // front()
    // front function
    front()
    {
        // returns the highest priority element
        // in the Priority queue without removing it.
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
    }

    // rear function
    rear(){
        // returns the lowest priority
        // element of the queue
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[this.items.length - 1];
    }

    // isEmpty()
    isEmpty(){
        // return true if the queue is empty.
        return this.items.length == 0;
    }

    // Is In
    isIn([posX, posY]){
        for (var i = 0; i < this.items.length; i++) {
            if (posX == this.items[i].x && posY == this.items[i].y){
                return [this.items[i], i];
            }
        }
        return null;
    }

    // printPQueue()
    printPQueue(){
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i].element + " ";
        return str;
    }
}










// Required Because server.js Uses This JavaScript File
module.exports = AI_controller;