// Controller Class 
class controller{ 
    // Controller Constructor
    constructor(creature, camera) { 
        // Position Related
        this.creature = creature; 
        this.camera = camera;
        this.camera.position.x = this.creature.object.position.x;
        this.camera.position.y = this.creature.object.position.y;
        this.cameraOffset = 0;
        this.stateUI = {};
        
        this.speed = this.creature.properties["moveSpeed"]; // Per Second 
        this.velocity = [0,0];
        
        // Jump Related
        this.initJumpVelocity = 1; // Per Second 
        this.jumpVelocity = 0; // Per Second 
        this.onGround = true; 
        
        // Collision Related Boolean Variables
        this.forwardCollision = false;
        this.backwardCollision = false;
        this.leftCollision = false;
        this.rightCollision = false;
        
        this.lastBlockPos = [0, 0];
        
        // Input Boolean
        this.inputs = { 
            forward: false, 
            backward: false, 
            left: false, 
            right: false, 
            space: false, 
            shift: false, 
        }; 

        // Mouse Position
        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        }
        
        // Adding Event Listener
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
                    this.jumpVelocity = this.initJumpVelocity;// jump 
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

    // When Mouse Move
    MouseMove(event) {
        event.preventDefault();
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Sending A Projectile
    sendProjectile(){
        // Get Unit Vector
        let groundX, groundY;
        groundX = this.mouse.x * window.innerWidth;
        groundY = this.mouse.y * window.innerHeight / Math.cos(cameraAngle);

        let magnitude = Math.sqrt(groundX * groundX + groundY * groundY);

        let vectorX = groundX / magnitude;
        let vectorY = groundY / magnitude;

        // Setting Projectile Information
        var newDamageInfo = {
            type: {"true": (this.creature.properties.attackDamage / 10) >> 0, "normal": this.creature.properties.attackDamage},
            attacker: [this.creature.creatureType, this.creature.ID, this.creature.campInfo],
            properties: this.creature.properties
        }

        // New Projectile
        var newProjectile = {
            position: [this.creature.object.position.x, this.creature.object.position.y, this.creature.object.position.z],
            initVelocity: [8 * vectorX, 8 * vectorY],
            damageInfo: newDamageInfo
        };

        // Updating To Projectile List
        newProjectileList.push(newProjectile);
        var event = new Event('createProjectile', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event); 
    }

    // Player Collision Detection 
    playerCollision(translateDistance){ 
        // For Collision Detection 
        let creaturePos = this.creature.object.position; 
 
        // Checking Collision With Every Other Player 
        for (let playerIndex = 0; playerIndex < playerArray.length; playerIndex++) { 
            // A Few Condition To Skip Collision Detection 
            if (playerArray[playerIndex] == null) continue; 
            if (clientPlayerID == playerIndex) continue;

            // For Calculating Manhattan Distance
            let otherPlayerPosition = playerArray[playerIndex].object.position;
            let diffX = creaturePos.x + translateDistance[0] - otherPlayerPosition.x;
			let diffY = creaturePos.y + translateDistance[1] - otherPlayerPosition.y;
            if (Math.abs(diffX) + Math.abs(diffY) > 2) continue; 
            

            // If Collision Occur, Move In Opposite Direction And Return True
            // Calculate Direct Distance To Squared
            let amount = diffX * diffX + diffY * diffY;
            if (amount <= 1) { 
                //console.log("Collided With Player", playerIndex);

                let rate = 1 - Math.sqrt(amount);

                // Indicate Collision Occurred 
                return [translateDistance[0] + diffX * rate,
                        translateDistance[1] + diffY * rate];
                
                 
            } 
        } 
 
        // No Collision Has Occurred 
        return translateDistance; 
    } 
 
    // Item Collision Detection 
    itemCollision(translateDistance){ 
        // For Collision Detection
        let collision = false;
        let creatureTrans = this.creature.object; 
        let predictedPosition = new THREE.Vector3(); 
        predictedPosition.copy(creatureTrans.position); 
 
        // Predicting Future Position 
        if (this.inputs.forward) predictedPosition.y += translateDistance;
        if (this.inputs.backward) predictedPosition.y -= translateDistance;
        if (this.inputs.left) predictedPosition.x -= translateDistance;
        if (this.inputs.right) predictedPosition.x += translateDistance;
 
        // Checking Collision With Every Collectable Item 
        for (let itemIndex = 0; itemIndex < itemArray.length; itemIndex++) { 
            // A Few Condition To Skip Collision Detection 
            if (itemArray[itemIndex] == null) continue; 
            if (itemArray[itemIndex].collected) continue;
            // For Calculating Manhattan Distance
            let itemPosition = itemArray[itemIndex].object.position;
            let diffX = predictedPosition.x - itemPosition.x;
			let diffY = predictedPosition.y - itemPosition.y;
            if (Math.abs(diffX) + Math.abs(diffY) > 2) continue; 
            

            // If Collision Occur, Increment Item Count Using Event 
            // Calculate Direct Distance To Squared
            let diffZ = predictedPosition.z - itemPosition.z;
            if (diffX * diffX + diffY * diffY + diffZ * diffZ <= 0.64) { 
                //console.log("Collided With Item", itemArray[itemIndex]);

                itemArray[itemIndex].collected = true;

                // Removing The Item Collided With And Increse Player Item
                removeItemID = itemIndex;
                additionalItemID = itemArray[itemIndex].itemInfo.itemID; 
                var event = new Event('player collected item', {bubbles: true, cancelable: false}) 
                document.dispatchEvent(event); 

                // Indicate Item Collision Occurred 
                collision = true;
                break;
            } 
        } 
 
        // Indicate If Item Collision Has Occurred Or Not
        return collision; 
    } 

 
    // Surrounding Unit Collision Detection
    surroundingCollision(currentPosition, translateDistance){ 
        // Player Use 0.21 For Collision Instead Of 0.25 (The Radius 0.5^2) To Avoid Unable Passing Through One-Unit Wide Wall

        // Next Position
        let predictedMapX;
        let predictedMapY;

        let [offSetX, offSetY] = translateDistance;
        
        let directionX = translateDistance[0] >= 0 ? 1 : -1;
        let directionY = translateDistance[1] >= 0 ? 1 : -1;

        // Y Collision
        if (translateDistance[1] != 0) {
            // Variable Declaration For Checking Collision
            // Center Of The Circle
            let cx = currentPosition[0] + 0.5;
            let cy = currentPosition[1] + offSetY + 0.5;
            predictedMapX = Math.floor(cx);
            predictedMapY = Math.floor(cy + directionY);

            for (let mapShift = -1; mapShift <= 1; ++mapShift) {
                // Bottom Left Of The Square
                let rx = predictedMapX + mapShift;
                let ry = predictedMapY;

                let unit = game_map.getUnit([rx, ry]);

                // Getting Which Edge Or Corner The Circle Is Closest To
                let testX = cx;
                let testY = cy;

                if (testX < rx) testX = rx;
                else if (testX > rx + 1) testX = rx + 1;
                if (testY < ry) testY = ry;
                else if (testY > ry + 1) testY = ry + 1;
                
                // Getting Difference In Distance
                let distX = cx - testX;
                let distY = cy - testY;

                // Collision Has Occur 
                if (distX * distX + distY * distY < 0.21 && (unit == null || game_map.getAllChildUnitCollision(unit))) {
                    if (distX == 0){
                        offSetY = translateDistance[1] - distY - 0.5 * directionY;
                        break;
                    }else{ 
                        let newOffset = translateDistance[1] - distY - Math.sqrt(0.21 - distX * distX) * directionY;
                        if (Math.abs(offSetY) > Math.abs(newOffset)) offSetY = newOffset;
                    }
                }
            }
        }

    
        // X Collision
        if (translateDistance[0] != 0) {
            // Variable Declaration For Checking Collision
            // Center Of The Circle
            let cx = currentPosition[0] + offSetX + 0.5;
            let cy = currentPosition[1] + offSetY + 0.5;
            predictedMapX = Math.floor(cx + directionX);
            predictedMapY = Math.floor(cy);

            for (let mapShift = -1; mapShift <= 1; ++mapShift) {
                // Bottom Left Of The Square
                let rx = predictedMapX;
                let ry = predictedMapY + mapShift;

                let unit = game_map.getUnit([rx, ry]);

                // Getting Which Edge Or Corner The Circle Is Closest To
                let testX = cx;
                let testY = cy;

                if (testX < rx) testX = rx;
                else if (testX > rx + 1) testX = rx + 1;
                if (testY < ry) testY = ry;
                else if (testY > ry + 1) testY = ry + 1;
                
                // Getting Difference In Distance
                let distX = cx - testX;
                let distY = cy - testY;

                // Collision Has Occur
                if (distX * distX + distY * distY < 0.21 && (unit == null || game_map.getAllChildUnitCollision(unit))) {
                    if (distY == 0){
                        offSetX = translateDistance[0] - distX - 0.5 * directionX
                        break;
                    }else{
                        let newOffset = translateDistance[0] - distX - Math.sqrt(0.21 - distY * distY) * directionX;
                        if (Math.abs(offSetX) > Math.abs(newOffset)) offSetX = newOffset;
                    }
                }
            }
        }
        
        return [offSetX, offSetY];
    } 

    // Map Collision Detection
    mapCollision(translateDistance){
        let unitTranslateDistance = [translateDistance[0], translateDistance[1]]; // Copy
        let checkAmount = 0.3;
        let creatureTrans = this.creature.object;
        let [xCount, yCount] = [1, 1];
        let [xDir, yDir] = [unitTranslateDistance[0] > 0 ? 1 : -1, unitTranslateDistance[1] > 0 ? 1 : -1];
        let [xCollision, yCollision] = [false, false];
        let currentPosition = [creatureTrans.position.x, creatureTrans.position.y];
        let newTranslateDistance;
        while (unitTranslateDistance[0] * xDir > 0 || unitTranslateDistance[1] * yDir > 0){
            if (xCollision){
                xCount = 0;
            }else{
                if (unitTranslateDistance[0] * xDir > checkAmount){
                    xCount = xDir * checkAmount;
                } else if (unitTranslateDistance[0] * xDir > 0){
                    xCount = unitTranslateDistance[0];
                } else {
                    xCount = 0;
                }
            }

            if (yCollision){
                yCount = 0;
            }else{
                if (unitTranslateDistance[1] * yDir > checkAmount){
                    yCount = yDir * checkAmount;
                } else if (unitTranslateDistance[1] * yDir > 0){
                    yCount = unitTranslateDistance[1];
                } else {
                    yCount = 0;
                }
            }

            unitTranslateDistance[0] -= xDir * checkAmount;
            unitTranslateDistance[1] -= yDir * checkAmount;

            
            newTranslateDistance = this.surroundingCollision(currentPosition,[xCount, yCount]);
            
            currentPosition[0] += newTranslateDistance[0];
            currentPosition[1] += newTranslateDistance[1];

            if (Math.abs(xCount) > Math.abs(newTranslateDistance[0])) {
                xCollision = true;
                if (yCollision) break;
 
            };

            if (Math.abs(yCount) > Math.abs(newTranslateDistance[1])) {
                yCollision = true;
                if (xCollision) break;
            };
        }
        
        return [currentPosition[0] - creatureTrans.position.x,
                currentPosition[1] - creatureTrans.position.y]; 
    }


    // Getting The Creature's Block Position
    getPlayerBlockPos2D(){ 
        return [(this.creature.object.position.x / game_map.blockSize.x) >> 0,
                (this.creature.object.position.y / game_map.blockSize.y) >> 0]; 
 
    } 
 
    // Updating Client Block If Moving Between Blocks 
    controllerUpdateBlock([blockX,blockY]){ 
        if (blockX != this.lastBlockPos[0] || 
            blockY != this.lastBlockPos[1]){ 
 
            this.lastBlockPos = [blockX,blockY]; 
             
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
        // Get All Surrounding Blocks
        for (let y_Axis = -blockHalfRangeY; y_Axis <= blockHalfRangeY; y_Axis++) { 
            for (let x_Axis = -blockHalfRangeX; x_Axis <= blockHalfRangeX; x_Axis++) { 
                // Variable Declaration 
                let BlockX = this.lastBlockPos[0] + x_Axis; 
                let BlockY = this.lastBlockPos[1] + y_Axis; 
                if (game_map.blockNumber.x > BlockX && 0 <= BlockX && game_map.blockNumber.y > BlockY && 0 <= BlockY){

                    var blockPos = { 
                        position: [BlockX,BlockY]
                    }; 
    
    
                    if (game_map.blockList[BlockY][BlockX] == null){ 
                        blockPosList.push(blockPos); 
                    } else { 
                        game_map.spawnBlockObject(BlockX, BlockY); 
                    } 
                }
            } 
        } 
 
        for (let i = 0; i < game_map.blockObjectClass.length; ++i){ 
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

    // Damge Handler
    damage(amount){
        sendCreaturePropertyChange(["player", clientPlayerID], {"health": ["-", amount]});
    }

    // Updating The Position 
    update(delta){ 

        // Change Movement Speed By Shift 
        if (!this.inputs.shift) { 
            // Walk 
            this.speed = this.creature.properties.moveSpeed;
        } else { 
            // Run 
            this.speed = this.creature.properties.moveSpeed * 1.5;
        } 
 
        // Correct Speed With Frame 
        let speedPerFrame = this.speed * delta; 
         
        // If The Two Keys Are Pressed At The Same Time 
        let dy = this.inputs.forward - this.inputs.backward; 
        let dx = this.inputs.right - this.inputs.left; 
        let magnitude = Math.sqrt(dx * dx + dy * dy); 
        // Magnitude Can't Be Zero 
        if (magnitude == 0) magnitude = 1; 
 
        // Variable Declaration 
        let translateDistance = speedPerFrame / magnitude; 
        let creatureTrans = this.creature.object; 

        let totalTranslateDistance = [0,0];
        if (this.inputs.forward) totalTranslateDistance[1] += translateDistance;
        if (this.inputs.backward) totalTranslateDistance[1] -= translateDistance;
        if (this.inputs.left) totalTranslateDistance[0] -= translateDistance;
        if (this.inputs.right) totalTranslateDistance[0] += translateDistance;
        
        let resistance = 0.1;    

        for (let i = 0; i < 2; ++i){
            if (this.velocity[i] > 0){
                this.velocity[i] -= resistance * delta;
                if (this.velocity[i] < 0) {
                    this.velocity[i] = 0;
                }
            }else if(this.velocity[i] < 0){
                this.velocity[i] += resistance * delta;
                if (this.velocity[i] > 0) {
                    this.velocity[i] = 0;
                }
            }
            totalTranslateDistance[i] += this.velocity[i];
        }

        let playerTranslateDistance = this.playerCollision(totalTranslateDistance);
        totalTranslateDistance = this.mapCollision(playerTranslateDistance);
        if (Math.abs(playerTranslateDistance[0] - totalTranslateDistance[0]) > 0.0001) this.velocity[0] = 0;
        if (Math.abs(playerTranslateDistance[1] - totalTranslateDistance[1]) > 0.0001) this.velocity[1] = 0;
        
        // Apply Item Collision 
        this.itemCollision(translateDistance); 
 
        // Update Position On Server 
        if (totalTranslateDistance[0] != 0 || totalTranslateDistance[1] != 0 || !this.onGround) {
            creatureTrans.translateX(totalTranslateDistance[0]);
            creatureTrans.translateY(totalTranslateDistance[1]);
            
            var event = new Event('position event', {bubbles: true, cancelable: false}) 
            document.dispatchEvent(event); 
            this.controllerUpdateBlock(this.getPlayerBlockPos2D()); 
        } 
 
        // Jump Update 
        if (this.jumpVelocity > -this.initJumpVelocity){ 
            this.jumpVelocity -= gravity*delta; 
        } 
 
        // Jumping Related Detection 
        if (creatureTrans.position.z + this.jumpVelocity > groundLevel) { 
            creatureTrans.translateZ(this.jumpVelocity); 
        } else { 
            creatureTrans.position.z = groundLevel; 
            this.onGround = true; 
        }
             
        // Updating Camera Position
        this.camera.position.x = this.creature.object.position.x;
        this.camera.position.y = this.creature.object.position.y - carmeraOffsetY;

        // Attack
        if (this.mouse.left == true && this.attackCD <= 0){
            this.sendProjectile();
            this.attackCD = 1;
        }

        // Attack CoolDown (CD)
        if (this.attackCD > 0){
            this.attackCD -= this.creature.properties["attackSpeed"] * delta;
        }
    } 
} 