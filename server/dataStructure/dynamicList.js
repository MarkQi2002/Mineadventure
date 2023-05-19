// Dynamic List Class
class dynamicList{
    // Dynamic List Constructor
    // this.name -> Dynamic List Name
    // this.list -> Dynamic List
    // this.list.length -> Dynamic List Length
    // this.increment -> Whenever Dynamic List Exceed Length Increment By This Amount
    // this.count
    constructor(name, length, increment) {
        this.name = name;
        this.list = [];
        this.list.length = length;
        this.increment = increment;
        this.count = 0;
    }
    
    // Method To Add An Element To Dynamic List
    add(element) {
        let exceedCount = 0;

        // Stop Untill Get An Index Corresponding To An Empty Space In DynamicList
        while (this.list[this.count] != null) {
            this.count = (this.count + 1) % this.list.length;
            ++exceedCount;
    
            // If Exceed Max DynamicList Length
            if (exceedCount >= this.list.length) {
                this.list.length += this.increment;
                console.log("Exceed Max " + this.name + " Length, Increase The " + this.name + " Length! Current Length: " + this.list.length);
            }
        }
        
        // Insert Element Into Dynamic List
        this.list[this.count] = element;

        // Return The Index
        return this.count;
    }

    // Method To Remove Element At Certain Index
    remove(index) {
        this.list[index] = null;
    }
}

// Exports dynamicList
module.exports = {dynamicList};