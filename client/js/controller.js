// Controller Class
class controller{
    constructor(creature, camera) {
        this.creature = creature;
        this.camera = camera;
        this.baseMovementSpeed = 3; // Per Second
        this.speed = this.baseMovementSpeed; // Per Second

        this.initJumpVelocity = 1; // Per Second
        this.jumpVelocity = 0; // Per Second
        this.onGround = true;


        this.lastBlockPos = {
            position: [0,0],
            direction: [1,1]
        }

        this.inputs = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        };

        document.addEventListener("keydown", (e) => this.KeyDown(e), false);
        document.addEventListener("keyup", (e) => this.KeyUp(e), false);
    }

    // When KeyBoard Is Pressed Down
    KeyDown(event){
        switch (event.keyCode){
            case 87: // w
                this.inputs.forward = true;
                break;
            case 65: // a
                this.inputs.left = true;
                break;
            case 83: // s
                this.inputs.backward= true;
                break;
            case 68: // d
                this.inputs.right = true;
                break;
            case 32: // space
                if (this.onGround){
                    this.jumpVelocity = this.initJumpVelocity;//jump
                    this.onGround = false;
                }
                this.inputs.space = true;
                break;
            case 16: // shift
                this.inputs.shift = true;
                break;
        }
    }

    // When The KeyBoard Key Is Released
    KeyUp(event){
        switch (event.keyCode){
            case 87: // w
                this.inputs.forward = false;
                break;
            case 65: // a
                this.inputs.left = false;
                break;
            case 83: // s
                this.inputs.backward= false;
                break;
            case 68: // d
                this.inputs.right = false;
                break;
            case 32: // space
                this.inputs.space = false;
                break;
            case 16: // shift
                this.inputs.shift = false;
                break;
        }
    }
    
    // Player Collision Detection
    playerCollision(translateDistance){
        // For Collision Detection
        let creatureTrans = this.creature.object;
        let predictedPosition = new THREE.Vector3();
        predictedPosition.copy(creatureTrans.position);

        // Predicting Future Position
        if (this.inputs.forward) predictedPosition.y += translateDistance;
        if (this.inputs.backward) predictedPosition.y -= translateDistance;
        if (this.inputs.left) predictedPosition.x -= translateDistance;
        if (this.inputs.right) predictedPosition.x += translateDistance;

        // Getting Player Bounding Box
        let playerBB = new THREE.Sphere(predictedPosition, 0.5);

        // Checking Collision With Every Other Player
        for (let playerIndex = 0; playerIndex < playerArray.length; playerIndex++) {
            // A Few Condition To Skip Collision Detection
            if (playerArray[playerIndex] == null) continue;
            if (clientPlayerID == playerIndex) continue;
            if (predictedPosition.manhattanDistanceTo(playerArray[playerIndex].object.position) > 2) continue;

            // Getting Other Player's Bounding Box
            // console.log(playerArray[playerIndex].object.position);
            let otherPlayerBB = new THREE.Sphere(playerArray[playerIndex].object.position, 0.5);

            // If Collision Occur, Move In Opposite Direction And Return True
            if (playerBB.intersectsSphere(otherPlayerBB)) {
                console.log("Collided With Player", playerIndex);
                // Sliding The Block
                if (this.inputs.forward) creatureTrans.translateY(-translateDistance);
                else if (this.inputs.backward) creatureTrans.translateY(translateDistance);
                else if (this.inputs.left) creatureTrans.translateX(translateDistance);
                else if (this.inputs.right) creatureTrans.translateX(-translateDistance);

                // Update Position On Server
                if (this.inputs.forward || this.inputs.backward || this.inputs.left || this.inputs.right || !this.onGround) {
                    var event = new Event('position event', {bubbles: true, cancelable: false})
                    document.dispatchEvent(event);
                }
                
                // Indicate Collision Occurred
                return true;
            }
        }

        // No Collision Has Occurred
        return false;
    }

    // Item Collision Detection
    itemCollision(translateDistance){
        // For Collision Detection
        let creatureTrans = this.creature.object;
        let predictedPosition = new THREE.Vector3();
        predictedPosition.copy(creatureTrans.position);

        // Predicting Future Position
        if (this.inputs.forward) predictedPosition.y += translateDistance;
        if (this.inputs.backward) predictedPosition.y -= translateDistance;
        if (this.inputs.left) predictedPosition.x -= translateDistance;
        if (this.inputs.right) predictedPosition.x += translateDistance;

        // Getting Player Bounding Box
        let playerBB = new THREE.Sphere(predictedPosition, 0.5);

        // Checking Collision With Every Collectable Item
        for (let itemIndex = 0; itemIndex < itemArray.length; itemIndex++) {
            // A Few Condition To Skip Collision Detection
            if (itemArray[itemIndex] == null) continue;
            if (predictedPosition.manhattanDistanceTo(itemArray[itemIndex].object.position) > 2) continue;

            // Getting Item Bounding Box
            // console.log(itemArray[itemIndex].object.position);
            let itemBB = new THREE.Sphere(itemArray[itemIndex].object.position, 0.2);

            // If Collision Occur, Increment Item Count Using Event
            if (playerBB.intersectsSphere(itemBB)) {
                console.log("Collided With Item", itemArray[itemIndex]);

                additionalItem = itemArray[itemIndex];
                var event = new Event('player collected item', {bubbles: true, cancelable: false})
                document.dispatchEvent(event);

                removeItemID = itemIndex;
                var event = new Event('remove item', {bubbles: true, cancelable: false})
                document.dispatchEvent(event);
                
                // Indicate Collision Occurred
                return true;
            }
        }

        // No Collision Has Occurred
        return false;
    }

    getPlayerBlockPos2D(){
        let mapX, mapY;
        if (this.creature.object != null) {
            [mapX, mapY] = [Math.floor(this.creature.object.position.x), Math.floor(this.creature.object.position.y)];
        }

        let unitX = (mapX < 0) ? mapX + 1 : mapX;
        let unitY = (mapY < 0) ? mapY + 1 : mapY;

        var direction;
    
            
        if (unitX >= 0 && unitY >= 0) {
            direction = [1, 1];
        } else if (unitX >= 0 && unitY < 0) {
            direction = [1, -1];
        } else if (unitX < 0 && unitY >= 0) {
            direction = [-1, 1];
        } else if (unitX < 0 && unitY < 0) {
            direction = [-1, -1];
        }

        return [[Math.floor(Math.abs(unitX) / game_map.blockSize.x), Math.floor(Math.abs(unitY) / game_map.blockSize.y)], direction];

    }


    controllerUpdateBlock(){
        let [blockPos, direction] = this.getPlayerBlockPos2D();

        if  (blockPos[0] != this.lastBlockPos.position[0] ||
             blockPos[1] != this.lastBlockPos.position[1] ||
             direction[0] != this.lastBlockPos.direction[0] ||
             direction[1] != this.lastBlockPos.direction[1]){

            
            this.lastBlockPos.position = blockPos;
            this.lastBlockPos.direction = direction;

            var event = new Event('updateBlock', {bubbles: true, cancelable: false})
            document.dispatchEvent(event);


        }
    }

    getSurroundingBlockPos([blockHalfRangeX, blockHalfRangeY]){

        for(let i = 0; i < game_map.blockObjectClass.length; i++){
            game_map.blockObjectClass[i].view = false;
        }


        var blockPosList = [];
        for (let y_Axis = -blockHalfRangeY; y_Axis <= blockHalfRangeY; y_Axis++) {
            for (let x_Axis = -blockHalfRangeX; x_Axis <= blockHalfRangeX; x_Axis++) {

                let BlockX = this.lastBlockPos.position[0] + x_Axis;
                let BlockY = this.lastBlockPos.position[1] + y_Axis;
                let dirX = this.lastBlockPos.direction[0];
                let dirY = this.lastBlockPos.direction[1];
                if (BlockX < 0){
                    dirX *= -1;
                    BlockX = -BlockX-1;
                }

                if (BlockY < 0){
                    dirY *= -1;
                    BlockY = -BlockY-1;
                }

                var blockPos = {
                    position: [BlockX,BlockY],
                    direction: [dirX,dirY]
                };


                let theQuarterMap = game_map.getQuarterMap([dirX,dirY]);
                if (theQuarterMap.blockList[BlockY][BlockX] == null){
                    blockPosList.push(blockPos);
                }else{
                    
                    game_map.spawnBlockObject(BlockX, BlockY, [dirX, dirY]);
                }

                

            }
        }

        for(let i = 0; i < game_map.blockObjectClass.length; i++){
            if (!game_map.blockObjectClass[i].view){
                if (game_map.blockObjectClass[i].block != null){
                    game_map.deleteBlock(game_map.blockObjectClass[i].block);
                    game_map.blockObjectClass[i].block = null;
                }
               
            }else{
                game_map.newBlockObjectClass.push(game_map.blockObjectClass[i]);
            }
        }

        game_map.blockObjectClass = game_map.newBlockObjectClass;
        game_map.newBlockObjectClass = [];
        
        return blockPosList;

    }

    // Updating The Position
    update(delta){
        //change movement speed
        if (!this.inputs.shift) {
            // Walk
            this.speed = this.baseMovementSpeed
        } else {
            // Run
            this.speed = this.baseMovementSpeed * 1.5
        }

        // Correct Speed With Frame
        let speedPerFrame = this.speed * delta;
        
        // If The Two Keys Are Pressed At The Same Time
        let dy = this.inputs.forward - this.inputs.backward;
        let dx = this.inputs.right - this.inputs.left;
        let magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude == 0){//magnitude can't be zero
            magnitude = 1;
        }

        // Variable Declaration
        let translateDistance = speedPerFrame / magnitude;
        let creatureTrans = this.creature.object;

        // If No Collision Occur, Move The Creature
        if (!this.playerCollision(translateDistance)) {
            if (this.inputs.forward) {
                creatureTrans.translateY(translateDistance);
            }

            if (this.inputs.backward) {
                creatureTrans.translateY(-translateDistance);
            }

            if (this.inputs.left) {
                creatureTrans.translateX(-translateDistance);
            }

            if (this.inputs.right) {
                creatureTrans.translateX(translateDistance);
            }
        }

        this.itemCollision();

        // Update Position On Server
        if (this.inputs.forward || this.inputs.backward || this.inputs.left || this.inputs.right || !this.onGround) {
            var event = new Event('position event', {bubbles: true, cancelable: false})
            document.dispatchEvent(event);
            this.controllerUpdateBlock();
        }

        // Jump Update
        if(this.jumpVelocity > -this.initJumpVelocity){
            this.jumpVelocity -= gravity*delta;
        }

        // Jumping Related Detection
        if (creatureTrans.position.z + this.jumpVelocity > groundLevel) {
            creatureTrans.translateZ(this.jumpVelocity);
        } else {
            creatureTrans.position.z = groundLevel;
            this.onGround = true;
        }

        // Get Controlled Creature's 2D Position From Screen
        let screenPos = new THREE.Vector3(
            creatureTrans.position.x,
            creatureTrans.position.y,
            creatureTrans.position.z).project(this.camera);
            
        // Auto center camera
        magnitude = Math.sqrt(screenPos.x * screenPos.x + screenPos.y * screenPos.y);
        let autoX, autoY;
        if (magnitude == 0){//magnitude can't be zero
            autoY = 0;
            autoX = 0;
        } else {
            autoY = 2 - Math.abs(screenPos.y / magnitude);
            autoX = 2 - Math.abs(screenPos.x / magnitude);
        }
        this.camera.translateY(screenPos.y * speedPerFrame * autoY * 2);
        this.camera.translateX(screenPos.x * speedPerFrame * autoX * 2);
    }

} 