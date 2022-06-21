// Map Class
class map {
    // Constructor
    constructor(serverMapClass) {
        this.object = new THREE.Object3D();
        this.object.position.set(0, 0, 0);
        this.spawnMap(serverMapClass);
        scene.add(this.object);
    }

    // Creating Client Side Map
    spawnMap(serverMapClass){
        this.spawnQuarterMap(serverMapClass.spaceArray.pp);
        this.spawnQuarterMap(serverMapClass.spaceArray.pn);
        this.spawnQuarterMap(serverMapClass.spaceArray.np);
        this.spawnQuarterMap(serverMapClass.spaceArray.nn);
    }

    // Creating Client Side QuarterMap
    spawnQuarterMap(quarterClass){
        for (let y_Axis = 0; y_Axis < quarterClass.blockList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < quarterClass.blockList[y_Axis].length; x_Axis++) {
                this.spawnBlock(x_Axis, y_Axis, quarterClass.diriction, quarterClass.blockList[y_Axis][x_Axis]);
            }
        }
    }

    // Creating Client Side Block
    spawnBlock(x, y, diriction, blockClass){
        var block = new THREE.Object3D();

        let offX = (diriction.x == -1) ? -1 : 0;
        let offY = (diriction.y == -1) ? -1 : 0;

        block.position.set(offX + diriction.x * x * blockClass.unitList.length, offY + diriction.y * y * blockClass.unitList[0].length, 0);
        
        for (let y_Axis = 0; y_Axis < blockClass.unitList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < blockClass.unitList[y_Axis].length; x_Axis++) {
                this.spawnUnit(diriction.x * x_Axis, diriction.y * y_Axis, blockClass.unitList[y_Axis][x_Axis], block);
            }
        }

        // Adding New Block Into The Entire Map
        this.object.add(block);
    }

    // Creating Client Side Unit
    spawnUnit(x, y, unitClass, block){
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let colorHeight = unitClass.colorHeight;
        let height = colorHeight*3;
        let material = new THREE.MeshBasicMaterial({color: new THREE.Color(unitClass.color3D[0] * colorHeight, unitClass.color3D[1] * colorHeight, unitClass.color3D[2] * colorHeight)});
        let mesh = new THREE.Mesh(geometry, material);
        
        block.add(mesh);
        mesh.position.set(x, y, height);
    }
}
