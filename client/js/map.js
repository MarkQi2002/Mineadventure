// Map Class
class map{
    // Constructor
    constructor(serverMapClass) {
        this.object = new THREE.Object3D();
        this.object.position.set(0, 0, 0);
        this.spawnMap(serverMapClass);
        scene.add(this.object);
    }
    /*
    spawn() {
        var initX = Math.floor(Math.random()*255),
            initY = Math.floor(Math.random()*255);
        for (let x_Axis = -25; x_Axis < 25; x_Axis++) {
            for (let y_Axis = -25; y_Axis < 25; y_Axis++) {
                let geometry = new THREE.BoxGeometry(1, 1, 1);

                
                var colorHeight = 2-PerlinNoise.noise(initX + x_Axis / 10, initY + y_Axis / 10, 0.1)*4;
                if(colorHeight < 0){
                    colorHeight = 0;
                }
                var height = colorHeight*3;


                let material = new THREE.MeshBasicMaterial({color: new THREE.Color(colorHeight, colorHeight, colorHeight)});
                var mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x_Axis, y_Axis, height);
                this.object.add(mesh);
            }
        }
    }*/

    spawnMap(serverMapClass){
        this.spawnQuarterMap(serverMapClass.spaceArray.pp);
        this.spawnQuarterMap(serverMapClass.spaceArray.pn);
        this.spawnQuarterMap(serverMapClass.spaceArray.np);
        this.spawnQuarterMap(serverMapClass.spaceArray.nn);
    }

    spawnQuarterMap(quarterClass){
        for (let y_Axis = 0; y_Axis < quarterClass.blockList.length; y_Axis++) {
            for (let x_Axis = 0; x_Axis < quarterClass.blockList[y_Axis].length; x_Axis++) {
                this.spawnBlock(x_Axis, y_Axis, quarterClass.diriction, quarterClass.blockList[y_Axis][x_Axis]);
            }
        }
    }

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


        this.object.add(block);


    }

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
