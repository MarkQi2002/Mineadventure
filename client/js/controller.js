// Controller Class
class controller{
    constructor(creature,camera) {
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

        // Shorthand Name
        let creatureTrans = this.creature.object;
        
        // Moving The Creature
        if (this.inputs.forward) {
            creatureTrans.translateY(speedPerFrame / magnitude);
        }

        if (this.inputs.backward) {
            creatureTrans.translateY(-speedPerFrame / magnitude);
        }

        if (this.inputs.left) {
            creatureTrans.translateX(-speedPerFrame/magnitude);
        }

        if (this.inputs.right) {
            creatureTrans.translateX(speedPerFrame/magnitude);
        }

        // Update Position On Server
        if (this.inputs.forward || this.inputs.backward || this.inputs.left || this.inputs.right || !this.onGround) {
            var event = new Event('position event', {bubbles: true, cancelable: false})
            document.dispatchEvent(event);
        }

        // Jump Update
        if(this.jumpVelocity > -this.initJumpVelocity){
            this.jumpVelocity -= gravity*delta;
        }

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