class dynamicList{
    // Projectile Constructor
    constructor(name, length, increment) {
        this.name = name;
        this.list = [];
        this.list.length = length;
        this.increment = increment;
        this.count = 0;
    }
    
    add(element){
        let exceedCount = 0;
        // Stop Untill Get An Index Corresponding To An Empty Space In DynamicList
        while (this.list[this.count] != null) {
            this.count = (this.count + 1) % this.list.length;
            exceedCount++;
    
            // If Exceed Max DynamicList Length
            if (exceedCount >= this.list.length) {
                this.list.length += this.increment;
                console.log("Exceed Max " + this.name + " Length, Increase The " + this.name + " Length! Current Length: " + this.list.length);
            }
        }
        
        this.list[this.count] = element;

        // Return The Index
        return this.count;
    }

    remove(index){
        this.list[index] = null;
    }
}

module.exports = {dynamicList};