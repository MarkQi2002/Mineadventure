
function loadItemMaterials(){
    let itemMaterialsArray = [];
    itemMaterialsArray.length = itemInfoArray.length;
    for (let i = 0; i < itemMaterialsArray.length; i++) {
        if (itemInfoArray[i].length > 0){
            let texture = game_map.loader.load("image/UI_Image/" + itemInfoArray[i][0].itemName + ".png");
            itemMaterialsArray[i] =  new THREE.MeshPhongMaterial({map: texture});
        }
    }
    return itemMaterialsArray;
}

// The Entire Item Class
class item {
    // Item Constructor
    constructor(itemInfo, itemPosition) {
        // Basic Item Information
        this.itemInfo = itemInfo;

        // Creating The Item Using THREE And Render The Item
        this.object = new THREE.Object3D();
        this.object.position.set(itemPosition[0], itemPosition[1], itemPosition[2]);

        let itemMesh = new THREE.Mesh(itemLoader.geometry, itemLoader.material[ this.itemInfo.itemID]);
        this.object.add(itemMesh);
        scene.add(this.object);
    }

    // Completely Removing An Item From The Class
    delete() {
        // Remove All Child Object
        var obj;
        for (var i = this.object.children.length - 1; i >= 0; i--) { 
            obj = this.object.children[i];
            this.object.remove(obj); 
        }

        // Removing It From The Scene
        scene.remove(this.object);
        delete this;
    }
}

// PassiveItem That Improve Player Property
class passiveItem extends item {
    constructor(itemInfo, itemPosition, propertyInfo) {
        super(itemInfo, itemPosition);

        self.propertyInfo = propertyInfo;
    }
}
