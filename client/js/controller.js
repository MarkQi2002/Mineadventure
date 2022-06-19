class controller extends EventDispatcher{
    constructor(creature,camera) {
        super();
        this.creature = creature;
        this.camera = camera;
        this.baseMovementSpeed = 5;//per second
        this.speed = this.baseMovementSpeed;//per second

        this.initJumpVelocity = 1;//per second
        this.jumpVelocity = 0;//per second
        this.onGround = true;

        this.inputs = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false,
        };



        //this.dispatchEvent( { type: 'start', message: 'movement update' } );
        //this.addEventListener( 'start', this.movement);
        document.addEventListener("keydown", (e) => this.KeyDown(e), false);
        document.addEventListener("keyup", (e) => this.KeyUp(e), false);

    }

    KeyDown(event){
        switch (event.keyCode){
            case 87: //w
                this.inputs.forward = true;
                break;
            case 65: //a
                this.inputs.left = true;
                break;
            case 83: //s
                this.inputs.backward= true;
                break;
            case 68: //d
                this.inputs.right = true;
                break;
            case 32: //space
                if (this.onGround){
                    this.jumpVelocity = this.initJumpVelocity;//jump
                    this.onGround = false;
                }
                this.inputs.space = true;
                break;
            case 16: //shift
                this.inputs.shift = true;
                break;
        }
    }


    KeyUp(event){
        switch (event.keyCode){
            case 87: //w
                this.inputs.forward = false;
                break;
            case 65: //a
                this.inputs.left = false;
                break;
            case 83: //s
                this.inputs.backward= false;
                break;
            case 68: //d
                this.inputs.right = false;
                break;
            case 32: //space
                this.inputs.space = false;
                break;
            case 16: //shift
                this.inputs.shift = false;
                break;
        }
    }

    update(delta){


        //change movement speed
        if (!this.inputs.shift){
            //walk
            this.speed = this.baseMovementSpeed
        }else{
            //run
            this.speed = this.baseMovementSpeed*1.5
        }

        let speedPerFrame = this.speed*delta;//correct speed with frame
        


        let dy = this.inputs.forward - this.inputs.backward;
        let dx = this.inputs.right - this.inputs.left;
        let magnitude = Math.sqrt(dx*dx + dy*dy);
        if (magnitude == 0){//magnitude can't be zero
            magnitude = 1;
        }


        let creatureTrans = this.creature.object;
        
        //movement
        if (this.inputs.forward) {
            creatureTrans.translateY(speedPerFrame/magnitude);
        }

        if (this.inputs.backward) {
            creatureTrans.translateY(-speedPerFrame/magnitude);
        }

        if (this.inputs.left) {
            creatureTrans.translateX(-speedPerFrame/magnitude);
        }

        if (this.inputs.right) {
            creatureTrans.translateX(speedPerFrame/magnitude);
        }


            
        //jump
        if(this.jumpVelocity > -this.initJumpVelocity){
            this.jumpVelocity -= gravity*delta;
        }

        if (creatureTrans.position.z + this.jumpVelocity > groundLevel){
            creatureTrans.translateZ(this.jumpVelocity);
        }else{
            creatureTrans.position.z = groundLevel;
            this.onGround = true;
        }


        



        //get controlled creature's 2D position from screen
        let screenPos = new THREE.Vector3(
            creatureTrans.position.x,
            creatureTrans.position.y,
            creatureTrans.position.z).project( this.camera );


            
        //Auto center camera
        magnitude = Math.sqrt(screenPos.x*screenPos.x + screenPos.y*screenPos.y);
        let autoX,autoY;
        if (magnitude == 0){//magnitude can't be zero
            autoY = 0;
            autoX = 0;
        }else{
            autoY = 2-Math.abs(screenPos.y/magnitude);
            autoX = 2-Math.abs(screenPos.x/magnitude);
        }
        this.camera.translateY(screenPos.y*speedPerFrame*autoY*2);
        this.camera.translateX(screenPos.x*speedPerFrame*autoX*2);

        

    }
}