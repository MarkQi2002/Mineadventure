// AI Controller Class
class AI_controller {
    // Constructor
    constructor(creatureInfo) {
        this.creature = creatureInfo;
        this.targetPositionList = [];
        this.routeCount = 0;
        this.searchRange = 32;
        this.aggro = {creature: null, amount: 0, base: 2, max: 5};
        this.attackCD = 0;
    }

    setAggro(theCreature, amount){
        if (theCreature == null) return;

        if (this.aggro.creature == null || this.aggro.creature.ID != theCreature.ID){
            // Come From A Different Creature
            this.aggro.amount -= amount;
            if (this.aggro.amount <= 0){
                this.aggro.creature = theCreature;
                this.aggro.amount = this.aggro.amount * -1 + this.aggro.base;
            }
        }else{
            // Come From The Same Creature
            this.aggro.amount += amount;
            if (this.aggro.amount > this.aggro.max){
                this.aggro.amount = this.aggro.max;
            }
        }
    }

    // Sending A Projectile To Goal Location
    sendProjectile(goal) {
        // Get Unit Vector
        let [diffX, diffY] = [goal[0] - this.creature.position[0], goal[1] - this.creature.position[1]];
        let magnitude = Math.sqrt(diffX * diffX + diffY * diffY);

        // Calculate Unit Vector
        let vectorX = diffX / magnitude;
        let vectorY = diffY / magnitude;

        // Setting Projectile Information
        var newDamageInfo = {
            type: {"true": (this.creature.properties.attackDamage / 10) >> 0, "normal": this.creature.properties.attackDamage},
            attacker: ["monster", this.creature.ID, this.creature.camp],
            properties: this.creature.properties
        }

        // Generating A New Projectile Based On Input
        var newProjectile = {
            position: [this.creature.position[0], this.creature.position[1], this.creature.position[2]],
            initVelocity: [8 * vectorX, 8 * vectorY],
            damageInfo: newDamageInfo
        };

        // Updating To Projectile List
        return newProjectile;
    }

    // Mahattan Heuristic Algorithm
    heuristic([fx, fy], [cx, cy]){
        return (Math.abs(fx - cx) + Math.abs(fy - cy)) * 10;
    }

    // Using A Star As The Path Finding Algorithm
    aStarAlgorithm(theMap, goal){
        let start = [Math.floor(this.creature.position[0]), Math.floor(this.creature.position[1])];
        
        let frontier = new PriorityQueue();
        frontier.enqueue({x: start[0], y: start[1], cost: 0, last: null}, 0);
        
        let current;
        let count = 0;
        while (!frontier.isEmpty() && count < 100){
            current = frontier.dequeue().element;

            if (current.x == goal[0] && current.y == goal[1]) return current;

            let neighbors = theMap.neighbors([current.x, current.y], this.creature.mapLevel);
            for (let i = 0; i < neighbors.length; ++i){
                let next = neighbors[i];

                if (Math.abs(start[0] - next[0]) + Math.abs(start[1] - next[1]) > this.searchRange) continue;

                let new_cost = current.cost + 1;

                let existData = frontier.isIn(next);

                if ( existData == null) {
                    let priority = new_cost + this.heuristic(goal, next);
                    frontier.enqueue({x: next[0], y: next[1], cost: new_cost, last: current}, priority);
                } else if(new_cost < existData.element.cost) {
                    let priority = new_cost + this.heuristic(goal, next);
                    frontier.remove(existData[1]);
                    frontier.enqueue({x: existData[0].element.x, y: existData[0].element.y, cost: new_cost, last: current}, priority);
                }
            }
            count ++;
        }

        // Return Null
        return null;
    }

    // Function To Generate An Optimal Path From Current Location To A Goal Location
    // Return The Route To As A List Of Points
    getRoute(theMap, goal) {
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

    // Moving The Controlled Object To A New Location
    moveToPosition(delta) {
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

    // Update Function
    update(delta, theMap, spawnProjectile) {
        // Get Path Using The Path Finding Algorithm

        if (this.aggro.creature != null){
            let goal = [Math.floor(this.aggro.creature.position[0]), Math.floor(this.aggro.creature.position[1])];

            if (this.routeCount > 10 && Math.abs(goal[0] - this.creature.position[0]) + Math.abs(goal[1] - this.creature.position[1]) < this.searchRange){
                this.targetPositionList = this.getRoute(theMap, goal);
                this.routeCount = 0;
            }

            // Attack
            if ( this.targetPositionList.length > 0 && this.attackCD <= 0){
                spawnProjectile([[this.sendProjectile(goal)], this.creature.mapLevel]);
                this.attackCD = 1;
            }
        }



        this.routeCount++;
        this.moveToPosition(delta);

        // Attack CoolDown (CD)
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
    constructor() {
        this.items = [];
    }
    
    // Get Element From The Array
    get(index) {
        return this.items[index];
    }

    // Enqueue An Element To The Priority Queue
    // enqueue(item, priority)
    enqueue(element, priority) {
        // Creating Object From Queue Element
        var qElement = new QElement(element, priority);
        var contain = false;
    
        // Iterating Through The Entire
        // Item Array To Add Element At The
        // Correct Location Of The Queue
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                // Once the correct location is found it is
                // Enqueued
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }
    
        // If The Element Have The Highest Priority
        // It Is Added At The End Of The Queue
        if (!contain) {
            this.items.push(qElement);
        }
    }

    // dequeue()
    // Dequeue Method To Remove
    // Element From The Queue
    dequeue() {
        // Return The Dequeued Element
        // And Remove It.
        // If The Queue Is Empty
        // Returns Underflow
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }

    remove(index){
        this.items.splice(index, 1);
    }

    // front()
    // Front Function
    front() {
        // Returns The Highest Priority Element
        // In The Priority Queue Without Removing It.
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
    }

    // rear function
    rear(){
        // Returns The Lowest Priority
        // Element Of The Queue
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[this.items.length - 1];
    }

    // isEmpty()
    isEmpty(){
        // Return True If The Queue Is Empty.
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