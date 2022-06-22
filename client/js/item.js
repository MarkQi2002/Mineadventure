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
    constructor(itemName, itemRarity,  itemStackType, itemBuffType, itemPosition) {
        this.name = itemName;
        this.rarity = itemRarity;
        this.stackType = itemStackType;
        this.buffType = itemBuffType;

        this.position = itemPosition;
        this.object = new THREE.Object3D();
        this.object.position.set(position[0], position[1], position[2]);
        scene.add( this.object );
    }
}

// Blood Orb
class bloodOrb extends item{
    constructor(itemName, itemRarity,  itemStackType, itemBuffType, itemPosition) {
        // Calling Parent Constructor
        super(itemName, itemRarity,  itemStackType, itemBuffType, itemPosition)

        // Spherical Body
        let geometry = new THREE.SphereGeometry(0.5, 10, 10);
        let material = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())});
        let mesh = new THREE.Mesh(geometry, material);
        this.object.add(mesh);
    }
}