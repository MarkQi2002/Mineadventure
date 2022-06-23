// The Entire Item Class
class item {
    // itemName - Name Of The Item
    /* itemRarity - How Rare Is The Item
    White (Common) (60%)
    Green (Uncommon) (25%)
    Orange (Suprior) (10%)
    Red (Legendary) (5%)
    */
    /* itemStackType - Show How Multiple Items Increase Its Property
    Linear Stacking
    Hyperbolic Stacking
    Exponential Stacking
    */
    /* itemBuffType - What Type Of Buff The Item Gives
    Attack
    Defensive
    */
    constructor(itemName, itemRarity, itemStackType, itemBuffType, itemPosition) {
        this.name = itemName;
        this.rarity = itemRarity;
        this.stackType = itemStackType;
        this.buffType = itemBuffType;

        this.position = itemPosition;
        this.object = new THREE.Object3D();
        this.object.position.set(itemPosition[0], itemPosition[1], itemPosition[2]);
        scene.add( this.object );

        // Item Properties
        // Defensive Properties
        this.health = 0;
        this.armor = 0;

        // Attack Properties
        this.attackDamage = 0;
        this.attackSpeed = 0;
    }

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

// Blood Orb
// itemName: "Blood Orb"
class bloodOrb extends item {
    constructor(itemName, itemRarity, itemStackType, itemBuffType, itemPosition) {
        // Calling Parent Constructor
        super(itemName, itemRarity, itemStackType, itemBuffType, itemPosition)

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.2, 10, 10);
        let material = new THREE.MeshBasicMaterial({color: 'red'});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);

        // Item Properties
        // Defensive Properties
        this.health = 20;
        this.armor = 0;
    }
}

// Attack Orb
// itemName: "Attack Orb"
class attackOrb extends item {
    constructor(itemName, itemRarity, itemStackType, itemBuffType, itemPosition) {
        // Calling Parent Constructor
        super(itemName, itemRarity, itemStackType, itemBuffType, itemPosition)

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.2, 10, 10);
        let material = new THREE.MeshBasicMaterial({color: 'yellow'});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);

        // Item Properties
        // Attack Properties
        this.attackDamage = 10;
        this.attackSpeed = 0;
    }
}