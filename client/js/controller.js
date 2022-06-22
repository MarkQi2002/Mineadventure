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

        // Checking Collision With Every Other Player
        for (let itemIndex = 0; itemIndex < itemArray.length; itemIndex++) {
            // A Few Condition To Skip Collision Detection
            if (itemArray[itemIndex] == null) continue;
            if (predictedPosition.manhattanDistanceTo(itemArray[itemIndex].object.position) > 2) continue;

            // Getting Other Player's Bounding Box
            // console.log(itemArray[itemIndex].object.position);
            let otherPlayerBB = new THREE.Sphere(itemArray[itemIndex].object.position, 0.2);

            // If Collision Occur, Move In Opposite Direction And Return True
            if (playerBB.intersectsSphere(otherPlayerBB)) {
                console.log("Collided With Item", itemIndex);
                
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