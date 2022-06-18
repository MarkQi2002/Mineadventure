class controller extends EventDispatcher{
    constructor(creature,camera) {
        super();
        this.creature = creature;
        this.camera = camera;
        this.speed = 0.2;

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

    update(){
        let dy = this.inputs.forward - this.inputs.backward;
        let dx = this.inputs.right - this.inputs.left;

        let magnitude = Math.sqrt(dx*dx + dy*dy);
        if (magnitude == 0){//magnitude can't be zero
            magnitude = 1;
        }


        let creatureTrans = this.creature.object;
        
        //movement
        if (this.inputs.forward) {
            creatureTrans.translateY(this.speed/magnitude);

           // let screenPos = new THREE.Vector3();
            //creatureTrans.position;
            //console.log(screenPos.project( this.camera ));


            this.camera.translateY(this.speed/magnitude);
        }

        if (this.inputs.backward) {
            creatureTrans.translateY(-this.speed/magnitude);
            this.camera.translateY(-this.speed/magnitude);
        }

        if (this.inputs.left) {
            creatureTrans.translateX(-this.speed/magnitude);
            this.camera.translateX(-this.speed/magnitude);
        }

        if (this.inputs.right) {
            creatureTrans.translateX(this.speed/magnitude);
            this.camera.translateX(this.speed/magnitude);
        }
        

    }
}