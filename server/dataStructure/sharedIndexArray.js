class sharedIndexArray{
    // Projectile Constructor
    constructor(maxLength, tag) {
        this.list = new Uint32Array(new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT * maxLength));
        this.length = new Uint32Array(new SharedArrayBuffer(Uint32Array.BYTES_PER_ELEMENT));
        this.length[0] = 0;
        this.tag = tag;
    }
    
    add(mainList, index){
        mainList[index][this.tag] = this.length[0]; // Use For Faster Search
        this.list[this.length[0]] = index;
        ++this.length[0];
    }

    remove(mainList, index){
        let switchSharedIndex = mainList[index][this.tag];
        let lastMainListIndex = this.list[--this.length[0]];
        mainList[lastMainListIndex][this.tag] = switchSharedIndex;
        this.list[switchSharedIndex] = lastMainListIndex;
        delete mainList[index][this.tag];
    }
}

module.exports = {sharedIndexArray};