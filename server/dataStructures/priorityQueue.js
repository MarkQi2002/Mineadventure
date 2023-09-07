// Priority Queue Element Class
class QElement {
    // Priority Queue Element Class Constructor
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

    remove(index) {
        this.items.splice(index, 1);
    }


    // isEmpty()
    isEmpty() {
        // Return True If The Queue Is Empty.
        return this.items.length == 0;
    }

    // Is In
    isIn([posX, posY]) {
        for (var i = 0; i < this.items.length; i++) {
            if (posX == this.items[i].x && posY == this.items[i].y) {
                return [this.items[i], i];
            }
        }
        return null;
    }
}

// Export Module
module.exports = { QElement, PriorityQueue }