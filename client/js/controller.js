// Controller Class 
class controller{ 
    constructor(creature, camera) { 
        this.creature = creature; 
        this.camera = camera;
        this.camera.position.x = this.creature.object.position.x;
        this.camera.position.y = this.creature.object.position.y;
        this.cameraOffset = 0;
        this.cameraRange = Math.sqrt((game_map.blockSize.x * game_map.blockSize.x) + (game_map.blockSize.y * game_map.blockSize.y))
        this.creature.healthBar.visible = false;
        
        this.baseMovementSpeed = 3; // Per Second 
        this.speed = this.baseMovementSpeed; // Per Second 
 
        this.initJumpVelocity = 1; // Per Second 
        this.jumpVelocity = 0; // Per Second 
        this.onGround = true; 
 
        this.forwardCollision = false;
        this.backwardCollision = false;
        this.leftCollision = false;
        this.rightCollision = false;
        
        this.lastBlockPos = { 
            position: [0, 0], 
            direction: [1, 1] 
        } 
 
        this.inputs = { 
            forward: false, 
            backward: false, 
            left: false, 
            right: false, 
            space: false, 
            shift: false, 
        }; 

        

        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        }
 
        document.addEventListener("keydown", (e) => this.KeyDown(e), false); 
        document.addEventListener("keyup", (e) => this.KeyUp(e), false); 
        document.addEventListener("mousedown", (e) => this.MouseDown(e), false); 
        document.addEventListener("mouseup", (e) => this.MouseUp(e), false); 
        document.addEventListener('mousemove', (e) => this.MouseMove(e), false);

        // Attack Speed
        this.attackCD = 0;
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
     
    // When Mouse Is Pressed Down 
    MouseDown(event){ 
        switch ( event.button ) {
            case 0: // left
                this.mouse.left = true;
                break;
            case 1: // middle
                this.mouse.middle = true;
                break;
            case 2: // right
                this.mouse.right = true;
                break;
        }
    } 
 
    // When The Mouse Is Released 
    MouseUp(event){ 
        switch ( event.button ) {
            case 0: // left 
                this.mouse.left = false;
                break;
            case 1: // middle
                this.mouse.middle = false;
                break;
            case 2: // right
                this.mouse.right = false;
                break;
        }
    }

    MouseMove(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    sendProjectile(){
        let groundX, groundY;
        groundX = this.mouse.x * window.innerWidth;
        groundY = this.mouse.y * window.innerHeight / Math.cos(cameraAngle);

        let magnitude = Math.sqrt(groundX * groundX + groundY * groundY);

        let vectorX, vectorY;
        vectorX = groundX / magnitude;
        vectorY = groundY / magnitude;


        var newDamageInfo = {
            amount: this.creature.attackDamage,
            attacker: clientPlayerID
        }

        var newProjectile = {
            position: [this.creature.object.position.x, this.creature.object.position.y, ,this.creature.object.position.z],
            initVelocity: [5 * vectorX, 5 * vectorY],
            damageInfo: newDamageInfo
        };
        newProjectileList.push(newProjectile);
        var event = new Event('createProjectile', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event); 
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

                // Removing The Item Collided With
                removeItemID = itemIndex; 
                var event = new Event('remove item', {bubbles: true, cancelable: false}) 
                document.dispatchEvent(event);

                // Increse Player Item
                additionalItem = itemArray[itemIndex]; 
                var event = new Event('player collected item', {bubbles: true, cancelable: false}) 
                document.dispatchEvent(event); 

                // Indicate Item Collision Occurred 
                return true; 
            } 
        } 
 
        // No Item Collision Has Occurred 
        return false; 
    } 
 
    // Map Collision Detection
    // Always Return Return False (Intentional)
    mapCollision(translateDistance){ 
        // For Collision Detection 
        let creatureTrans = this.creature.object; 

        this.forwardCollision = false;
        this.backwardCollision = false;
        this.leftCollision = false;
        this.rightCollision = false;

        // Initialize Position Array
        let predictedPosition = [];
        predictedPosition.length = 9;

        // Copy Array And Predict Next Location
        for (let positionIndex = 0; positionIndex < predictedPosition.length; positionIndex++) {
            // Copy Current Position
            predictedPosition[positionIndex] = new THREE.Vector3();
            predictedPosition[positionIndex].copy(creatureTrans.position);

            if (positionIndex == 0) {
                predictedPosition[positionIndex].x += 0.15;
                predictedPosition[positionIndex].y += 0.85;
                continue;
            } else if (positionIndex == 2) {
                predictedPosition[positionIndex].x += 0.85;
                predictedPosition[positionIndex].y += 0.85;
                continue;
            } else if (positionIndex == 6) {
                predictedPosition[positionIndex].x += 0.15;
                predictedPosition[positionIndex].y += 0.15;
                continue;
            } else if (positionIndex == 8) {
                predictedPosition[positionIndex].x += 0.85;
                predictedPosition[positionIndex].y += 0.15;
                continue;
            }

            // Shift Position
            if (positionIndex % 3 == 1) predictedPosition[positionIndex].x += 0.5;
            if (positionIndex % 3 == 2) predictedPosition[positionIndex].x += 0.9999;
            if (Math.floor(positionIndex / 3) == 0) predictedPosition[positionIndex].y += 0.9999;
            if (Math.floor(positionIndex / 3) == 1) predictedPosition[positionIndex].y += 0.5;
        }
        
        // Forward Collision
        for (let positionIndex = 0; positionIndex < predictedPosition.length; positionIndex++) {
            // Distance To Shift
            var shiftDistance = 0;
            if (this.inputs.forward) shiftDistance = translateDistance

            // Get Unit
            let unit = game_map.getUnit([Math.floor(predictedPosition[positionIndex].x), Math.floor(predictedPosition[positionIndex].y + shiftDistance)]);

            // Check If Hit A Border
            if (unit == null) {
                //console.log("Map Border!!!");
                this.forwardCollision = true;
                break;
            }

            // Check If Collide With A Wall
            if (game_map.unitIDList[unit.ID].collision) {
                //console.log("Collided With Wall", unit); 
                //console.log("Player Position: ", creatureTrans.position); 
                 
                // Indicate Collision Occurred 
                this.forwardCollision = true;
                break;  
            } 
        }
        
        // Backward Collision
        for (let positionIndex = 0; positionIndex < predictedPosition.length; positionIndex++) {
            // Distance To Shift
            var shiftDistance = 0;
            if (this.inputs.backward) shiftDistance = translateDistance

            // Get Unit
            let unit = game_map.getUnit([Math.floor(predictedPosition[positionIndex].x), Math.floor(predictedPosition[positionIndex].y - shiftDistance)]);

            // Check If Hit A Border
            if (unit == null) {
                //console.log("Map Border!!!");
                this.backwardCollision = true;
                break;
            }

            // Check If Collide With A Wall
            if (game_map.unitIDList[unit.ID].collision) {
                //console.log("Collided With Wall", unit); 
                //console.log("Player Position: ", creatureTrans.position); 
                 
                // Indicate Collision Occurred 
                this.backwardCollision = true;
                break;  
            } 
        }

        // Left Collision
        for (let positionIndex = 0; positionIndex < predictedPosition.length; positionIndex++) {
            // Distance To Shift
            var shiftDistance = 0;
            if (this.inputs.left) shiftDistance = translateDistance

            // Get Unit
            let unit = game_map.getUnit([Math.floor(predictedPosition[positionIndex].x - shiftDistance), Math.floor(predictedPosition[positionIndex].y)]);

            // Check If Hit A Border
            if (unit == null) {
                //console.log("Map Border!!!");
                this.leftCollision = true;
                break;
            }

            // Check If Collide With A Wall
            if (game_map.unitIDList[unit.ID].collision) {
                //console.log("Collided With Wall", unit); 
                //console.log("Player Position: ", creatureTrans.position); 
                 
                // Indicate Collision Occurred 
                this.leftCollision = true;
                break;  
            } 
        }

        // Right Collision
        for (let positionIndex = 0; positionIndex < predictedPosition.length; positionIndex++) {
            // Distance To Shift
            var shiftDistance = 0;
            if (this.inputs.right) shiftDistance = translateDistance

            // Get Unit
            let unit = game_map.getUnit([Math.floor(predictedPosition[positionIndex].x + shiftDistance), Math.floor(predictedPosition[positionIndex].y)]);

            // Check If Hit A Border
            if (unit == null) {
                //console.log("Map Border!!!");
                this.rightCollision = true;
                break;
            }

            // Check If Collide With A Wall
            if (game_map.unitIDList[unit.ID].collision) {
                //console.log("Collided With Wall", unit); 
                //console.log("Player Position: ", creatureTrans.position); 
                 
                // Indicate Collision Occurred 
                this.rightCollision = true;
                break;  
            } 
        }

        // No Map Collision Has Occurred 
        return false; 
    } 
 
    // Getting Player's Position And Direction 
    getPlayerBlockPos2D(){ 
        // Calculating Player Position 
        let mapX, mapY; 

        /*
        if (this.cameraOffset > this.cameraRange  && this.creature.object != null) { 
            [mapX, mapY] = [Math.floor(this.creature.object.position.x), Math.floor(this.creature.object.position.y)]; 
            // console.log(game_map.getUnit([mapX, mapY])); 
        } else {
            [mapX, mapY] = [Math.floor(this.camera.position.x), Math.floor(this.camera.position.y)]; 
        }*/

        [mapX, mapY] = [Math.floor(this.creature.object.position.x), Math.floor(this.creature.object.position.y)]; 
 
        // Return The Player's Position And The Player's Direction 
        return [game_map.map2DToBlock2D([mapX, mapY]), game_map.getDirection([mapX, mapY])]; 
 
    } 
 
    // Updating Client Block If Moving Between Blocks 
    controllerUpdateBlock([blockPos, direction]){ 
 
        if (blockPos[0] != this.lastBlockPos.position[0] || 
            blockPos[1] != this.lastBlockPos.position[1] || 
            direction[0] != this.lastBlockPos.direction[0] || 
            direction[1] != this.lastBlockPos.direction[1]){ 
 
            this.lastBlockPos.position = blockPos; 
            this.lastBlockPos.direction = direction; 
             
            // Sending Update Block Command As An Event 
            var event = new Event('updateBlock', {bubbles: true, cancelable: false}) 
            document.dispatchEvent(event); 
        } 
    } 
 
    // Getting All The Surrounding Nine Blocks (3 By 3) 
    getSurroundingBlockPos([blockHalfRangeX, blockHalfRangeY]){ 
        // Modifying The View Tag 
        for (let i = 0; i < game_map.blockObjectClass.length; i++){ 
            game_map.blockObjectClass[i].view = false; 
        } 
 
 
        var blockPosList = []; 
        for (let y_Axis = -blockHalfRangeY; y_Axis <= blockHalfRangeY; y_Axis++) { 
            for (let x_Axis = -blockHalfRangeX; x_Axis <= blockHalfRangeX; x_Axis++) { 
                // Variable Declaration 
                let BlockX = this.lastBlockPos.position[0] + x_Axis; 
                let BlockY = this.lastBlockPos.position[1] + y_Axis; 
                if (game_map.quarterSize2D.x > BlockX && game_map.quarterSize2D.y > BlockY){
                    let dirX = this.lastBlockPos.direction[0]; 
                    let dirY = this.lastBlockPos.direction[1]; 
                    if (BlockX < 0) { 
                        dirX *= -1; 
                        BlockX = -BlockX-1; 
                    } 
    
                    if (BlockY < 0) { 
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
                    } else { 
                        game_map.spawnBlockObject(BlockX, BlockY, [dirX, dirY]); 
                    } 
                }
            } 
        } 
 
        for (let i = 0; i < game_map.blockObjectClass.length; i++){ 
            if (!game_map.blockObjectClass[i].view){ 
                if (game_map.blockObjectClass[i].block != null){ 
                    game_map.deleteBlock(game_map.blockObjectClass[i].block); 
                    game_map.blockObjectClass[i].block = null; 
                } 
                
            } else { 
                game_map.newBlockObjectClass.push(game_map.blockObjectClass[i]); 
            } 
        } 
 
        game_map.blockObjectClass = game_map.newBlockObjectClass; 
        game_map.newBlockObjectClass = []; 
         
        return blockPosList; 
    }


 
    // Updating The Position 
    update(delta){ 
        // Set camera offset for other calculation
        let diffX = this.camera.position.x  - this.creature.object.position.x;
        let diffY = this.camera.position.y  - this.creature.object.position.y;
        this.cameraOffset = Math.sqrt((diffX * diffX) + (diffY * diffY));

        // Change Movement Speed By Shift 
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
        if (!this.playerCollision(translateDistance) && !this.mapCollision(translateDistance)) { 
            if (this.inputs.forward && !this.forwardCollision) { 
                creatureTrans.translateY(translateDistance); 
            } 
 
            if (this.inputs.backward && !this.backwardCollision) { 
                creatureTrans.translateY(-translateDistance); 
            } 
 
            if (this.inputs.left && !this.leftCollision) { 
                creatureTrans.translateX(-translateDistance); 
            } 
 
            if (this.inputs.right && !this.rightCollision) { 
                creatureTrans.translateX(translateDistance); 
            } 
        } 
        
        // Move To Nearest Integer
        if (Math.abs(Math.round(creatureTrans.position.x) - creatureTrans.position.x) <= 0.03) creatureTrans.position.x = Math.round(creatureTrans.position.x);
        if (Math.abs(Math.round(creatureTrans.position.y) - creatureTrans.position.y) <= 0.03) creatureTrans.position.y = Math.round(creatureTrans.position.y);

        // Apply Item Collision 
        this.itemCollision(translateDistance); 
 
        // Update Position On Server 
        if (this.inputs.forward || this.inputs.backward || this.inputs.left || this.inputs.right || !this.onGround) { 
            var event = new Event('position event', {bubbles: true, cancelable: false}) 
            document.dispatchEvent(event); 
            this.controllerUpdateBlock(this.getPlayerBlockPos2D()); 
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
             
        

        this.camera.position.x = this.creature.object.position.x;
        this.camera.position.y = this.creature.object.position.y - carmeraOffsetY;
        /*
        // Auto center camera 
        if (this.cameraOffset <= this.cameraRange){
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
        } else {
            this.camera.position.x = this.creature.object.position.x;
            this.camera.position.y = this.creature.object.position.y;
        }
        */

        // Attack
        if (this.mouse.left == true && this.attackCD <= 0){
            this.sendProjectile();
            this.attackCD = 1;
        }

        if (this.attackCD > 0){
            this.attackCD -= this.creature.attackSpeed * delta;
        }

    } 
} 