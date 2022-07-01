// The Entire Item Class
class item {
    // Item Constructor
    constructor(itemInfo, itemMesh, itemPosition) {
        // Basic Item Information
        this.itemInfo = itemInfo;

        // Creating The Item Using THREE And Render The Item
        this.object = new THREE.Object3D();
        this.object.position.set(itemPosition[0], itemPosition[1], itemPosition[2]);
        this.object.add(itemMesh);
        scene.add(this.object);
    }

    // Completely Removing An Item From The Class
    delete() {
        // Remove All Child Object
        var obj;
        for (var i = this.object.children.length - 1; i >= 0; i--) { 
            obj = this.object.children[i];
            obj.geometry.dispose();
            obj.material.dispose();
            this.object.remove(obj); 
        }

        // Removing It From The Scene
        scene.remove(this.object);
        delete this;
    }
}

// PassiveItem That Improve Player Property
class passiveItem extends item {
    constructor(itemInfo, itemMesh, itemPosition, propertyInfo) {
        super(itemInfo, itemMesh, itemPosition);

        self.propertyInfo = propertyInfo;
    }
}
