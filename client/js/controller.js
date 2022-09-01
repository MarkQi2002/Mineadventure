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
        this.velocity = [0, 0, 0];
        
        // Jump Related
        this.initJumpVelocity = 10; // Per Second 
        this.onGround = false; 
        
        // Collision Related Boolean Variables
        this.forwardCollision = false;
        this.backwardCollision = false;
        this.leftCollision = false;
        this.rightCollision = false;
        
        this.windowUpdate();

        this.lastIntRange = {
            xMin: 0,
            xMax: 0,
            yMin: 0,
            yMax: 0
        };
        
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


        // For Ray Hide
        this.lastRayHideUnit = [];
    }

    windowUpdate(){
        this.displayHalfSize = {x: 20 * window.innerWidth / window.innerHeight, y: 20};
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
    sendProjectile(totalTranslateDistance, delta){
        // Get Unit Vector
        let groundX, groundY;
        groundX = this.mouse.x * window.innerWidth;
        groundY = this.mouse.y * window.innerHeight / Math.cos(cameraAngle);

        let magnitude = Math.sqrt(groundX * groundX + groundY * groundY);

        let vectorX = groundX / magnitude;
        let vectorY = groundY / magnitude;

        // New Projectile
        var newProjectile = {
            initVelocity: [vectorX, vectorY]
        };

        // Updating To Projectile List
        sendProjectileList.push(newProjectile);

    }

    // Creature Collision Detection 
    creatureCollision(translateDistance){ 
        // For Collision Detection 
        let creaturePos = this.creature.object.position; 
        let theCreature;
        // Checking Collision With Every Other Creature 
        for (let i = 0; i < lastDisplayCreatureList.length; ++i) { 
            theCreature = objectList[lastDisplayCreatureList[i]];
            
            // A Few Condition To Skip Collision Detection 
            if (theCreature == null) continue; 

            // For Calculating Manhattan Distance
            let otherPlayerPosition = theCreature.object.position;
            let diffX = creaturePos.x + translateDistance[0] - otherPlayerPosition.x;
			let diffY = creaturePos.y + translateDistance[1] - otherPlayerPosition.y;
            let diffZ = creaturePos.z + translateDistance[2] - otherPlayerPosition.z;
            let centerSizeDiff = this.creature.radius + theCreature.radius;
            if (Math.abs(diffX) + Math.abs(diffY) + Math.abs(diffZ) > centerSizeDiff + centerSizeDiff + centerSizeDiff) continue; 
            

            // If Collision Occur, Move In Opposite Direction And Return True
            // Calculate Direct Distance To Squared
            let amount = diffX * diffX + diffY * diffY + diffZ * diffZ;
            if (amount < centerSizeDiff * centerSizeDiff) { 
                //console.log("Collided With Creature", creatureIndex);
                
                let rate = centerSizeDiff / Math.sqrt(amount) - 1;
                if (rate === Infinity) rate = 1;
                // Indicate Collision Occurred 
                return [translateDistance[0] + diffX * rate,
                        translateDistance[1] + diffY * rate,
                        translateDistance[2] + diffZ * rate];
                
                 
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
        let [offSetX, offSetY, offSetZ] = translateDistance;

        if (translateDistance[0] != 0 || translateDistance[1] != 0 || translateDistance[2] != 0) {

            let limitRange = this.creature.radius * this.creature.radius;
            let directionX = translateDistance[0] > 0 ? 1 : -1;
            let directionY = translateDistance[1] > 0 ? 1 : -1;

            // Variable Declaration For Checking Collision
            
            let predictedMapX = Math.floor(currentPosition[0] + 0.5);
            let predictedMapY = Math.floor(currentPosition[1] + 0.5);

            let unitRange = Math.ceil(this.creature.radius);
            for (let mapShiftY = -unitRange; mapShiftY <= unitRange; ++mapShiftY) {
                for (let mapShiftX = -unitRange; mapShiftX <= unitRange; ++mapShiftX) {
                    // Center Of The Circle
                    let cx = currentPosition[0] + offSetX;
                    let cy = currentPosition[1] + offSetY;
                    let cz = currentPosition[2] + offSetZ;

                    // Bottom Left Of The Square
                    let rx = predictedMapX + mapShiftX * directionX;
                    let ry = predictedMapY + mapShiftY * directionY;
                    let rz = Infinity;

                    let unit = game_map.getUnit([rx, ry]);

                    if (unit != null){
                        rz = unit.height;
                        if (unit.childID != 0 && game_map.unitIDList[unit.childID].collision){
                            rz += 1; //childUnit Height
                        }

                    }


                    rx -= 0.5;
                    ry -= 0.5;
                    
                    // Getting Which Edge Or Corner The Circle Is Closest To
                    let testX = cx;
                    let testY = cy;
                    let testZ = cz;

                    if (testX < rx) testX = rx;
                    else if (testX > rx + 1) testX = rx + 1;

                    if (testY < ry) testY = ry;
                    else if (testY > ry + 1) testY = ry + 1;

                    if (testZ > rz) testZ = rz;

                    
                    // Getting Difference In Distance
                    let distX = cx - testX;
                    let distY = cy - testY;
                    let distZ = cz - testZ;
                    let amount = distX * distX + distY * distY + distZ * distZ;
                    
                    // Collision Has Occur 
                    if (amount < limitRange) {

                        
                        let rate = this.creature.radius / Math.sqrt(amount) - 1;
                        if (rate === Infinity) rate = 1;

                        offSetX += distX * rate;
                        offSetY += distY * rate;
                        offSetZ += distZ * rate;
                    }
                }
            }
        }
        

        return [offSetX, offSetY, offSetZ];
    }


    // Map Collision Detection
    mapCollision(translateDistance){
        let unitTranslateDistance = [translateDistance[0], translateDistance[1], translateDistance[2]]; // Copy
        let checkAmount = this.creature.radius / 2 > 0.3 ? 0.3 : this.creature.radius / 2;
        let creatureTrans = this.creature.object;
        let count = [1, 1, 1];
        let dir = [unitTranslateDistance[0] > 0 ? 1 : -1, unitTranslateDistance[1] > 0 ? 1 : -1, unitTranslateDistance[2] > 0 ? 1 : -1];
        let isCollision = [false, false, false];
        let currentPosition = [creatureTrans.position.x, creatureTrans.position.y, creatureTrans.position.z];
        let newTranslateDistance, i;
        while (unitTranslateDistance[0] * dir[0] > 0 || unitTranslateDistance[1] * dir[1] > 0|| unitTranslateDistance[2] * dir[2] > 0){

            for (i = 0; i < 3; ++i){
                if (isCollision[i]){
                    count[i] = 0;
                }else{
                    if (unitTranslateDistance[i] * dir[i] > checkAmount){
                        count[i] = dir[i] * checkAmount;
                    } else if (unitTranslateDistance[i] * dir[i] > 0){
                        count[i] = unitTranslateDistance[i];
                    } else {
                        count[i] = 0;
                    }
                }

                unitTranslateDistance[i] -= dir[i] * checkAmount;
            }
            
            newTranslateDistance = this.surroundingCollision(currentPosition, count);
            

            for (i = 0; i < 3; ++i){
                currentPosition[i] += newTranslateDistance[i];

                if (Math.abs(count[i]) > Math.abs(newTranslateDistance[i])) {
                    isCollision[i] = true;
                };
            }

            if (isCollision.includes(true)) break;
        }
        
        return [
                currentPosition[0] - creatureTrans.position.x,
                currentPosition[1] - creatureTrans.position.y,
                currentPosition[2] - creatureTrans.position.z
            ]; 
    }

    // Damge Handler
    damage(amount){
        sendCreaturePropertyChange(["player", clientPlayerID], {"health": ["-", amount]});
    }

    displayUnit(x, y, isNewDisplayUnit){
        let theUnit = game_map.getUnit([x,y]);
        if (theUnit == null) return;

        if (isNewDisplayUnit){
            if (theUnit.mesh == null) game_map.spawnUnit(theUnit);
        }else if(theUnit.mesh != null){
            game_map.object.remove(theUnit.mesh);
            theUnit.mesh = null;
            theUnit.childMesh = null;
        }
    }
    
    displayUnits(){
        let newIntRange = {
            xMin: this.creature.object.position.x - this.displayHalfSize.x + 1 >> 0,
            xMax: this.creature.object.position.x + this.displayHalfSize.x + 1 >> 0,
            yMin: this.creature.object.position.y - this.displayHalfSize.y + carmeraOffsetY + 1 >> 0,
            yMax: this.creature.object.position.y + this.displayHalfSize.y + carmeraOffsetY + 1 >> 0
        };
        if (newIntRange.xMin == this.lastIntRange.xMin && newIntRange.xMax == this.lastIntRange.xMax &&
            newIntRange.yMin == this.lastIntRange.yMin && newIntRange.yMax == this.lastIntRange.yMax) return;

        let x, y, rangeA, rangeB, isNewDisplayUnit,
            q1x, q1y, q2x, q2y, q3x, q3y, q4x, q4y;
        

        //  Quadrant 1 | Quadrant 2
        // -----Center Of RangeA-----
        //  Quadrant 4 | Quadrant 3

        for (let i = 0; i < 2; ++i){
            if (i == 0){
                rangeA = this.lastIntRange;
                rangeB = newIntRange;
                isNewDisplayUnit = true;
            }else{
                rangeA = newIntRange;
                rangeB = this.lastIntRange;
                isNewDisplayUnit = false;
            }

            q1x = rangeA.xMax < rangeB.xMax ? rangeA.xMax : rangeB.xMax;
            q1y = rangeA.yMax > rangeB.yMin ? rangeA.yMax : rangeB.yMin;

            q2x = rangeA.xMax > rangeB.xMin ? rangeA.xMax : rangeB.xMin;
            q2y = rangeA.yMin > rangeB.yMin ? rangeA.yMin : rangeB.yMin;

            q3x = rangeA.xMin > rangeB.xMin ? rangeA.xMin : rangeB.xMin;
            q3y = rangeA.yMin < rangeB.yMax ? rangeA.yMin : rangeB.yMax;

            q4x = rangeA.xMin < rangeB.xMax ? rangeA.xMin : rangeB.xMax;
            q4y = rangeA.yMax < rangeB.yMax ? rangeA.yMax : rangeB.yMax;

            // Quadrant 1
            for (y = q1y; y < rangeB.yMax; ++y){
                for (x = rangeB.xMin; x < q1x; ++x){
                    this.displayUnit(x, y, isNewDisplayUnit);
                }
            }

            // Quadrant 2
            for (y = q2y; y < rangeB.yMax; ++y){
                for (x = q2x; x < rangeB.xMax; ++x){
                    this.displayUnit(x, y, isNewDisplayUnit);
                }
            }

            // Quadrant 3
            for (y = rangeB.yMin; y < q3y; ++y){
                for (x = q3x; x < rangeB.xMax; ++x){
                    this.displayUnit(x, y, isNewDisplayUnit);
                }
            }

            // Quadrant 4
            for (y = rangeB.yMin; y < q4y; ++y){
                for (x = rangeB.xMin; x < q4x; ++x){
                    this.displayUnit(x, y, isNewDisplayUnit);
                }
            }
        }
        this.lastIntRange = newIntRange;
    }

    // Updating The Position 
    update(delta){ 

        // Change Movement Speed By Shift 
        if (!this.inputs.shift && this.onGround) { 
            // Walk 
            this.speed = this.creature.properties.moveSpeed;
        } else { 
            // Run 
            this.speed = this.creature.properties.moveSpeed * 1.5;
        } 
         
        // If The Two Keys Are Pressed At The Same Time 
        let dy = this.inputs.forward - this.inputs.backward; 
        let dx = this.inputs.right - this.inputs.left; 
        let magnitude = Math.sqrt(dx * dx + dy * dy); 
        // Magnitude Can't Be Zero 
        if (magnitude == 0) magnitude = 1; 
        
        let dirSpeed = this.speed / magnitude;

        // Variable Declaration 
        let translateSpeed = 30 * (0.9 + this.creature.radius / 5) * delta * dirSpeed; 
        let creatureTrans = this.creature.object; 

        let totalTranslateDistance = [0, 0, 0];
        let friction = [0, 0, 0]; // Friction

        this.velocity[2] -= gravity * delta; // Gravity Update 

        if (this.onGround){
            friction[0] += 0.5 * gravity + dirSpeed * 2;
            friction[1] += 0.5 * gravity + dirSpeed * 2;
            if (this.inputs.space){
                this.velocity[2] = this.initJumpVelocity;// jump 
            }
        }else{
            friction[0] += 0.1 * gravity;
            friction[1] += 0.1 * gravity;
            translateSpeed /= 10;
        }

        if (this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1] < this.speed * this.speed){
            if (Math.abs(this.velocity[1]) < dirSpeed){
                if (this.inputs.forward) this.velocity[1] += translateSpeed;
                if (this.inputs.backward) this.velocity[1] -= translateSpeed;
            }

            if (Math.abs(this.velocity[0]) < dirSpeed){
                if (this.inputs.right) this.velocity[0] += translateSpeed;
                if (this.inputs.left) this.velocity[0] -= translateSpeed;
            }
        }
        

        for (let i = 0; i < 3; ++i){
            if (this.velocity[i] > 0){
                this.velocity[i] -= friction[i] * delta;
                if (this.velocity[i] < 0) {
                    this.velocity[i] = 0;
                }
            }else if(this.velocity[i] < 0){
                this.velocity[i] += friction[i] * delta;
                if (this.velocity[i] > 0) {
                    this.velocity[i] = 0;
                }
            }
            totalTranslateDistance[i] += this.velocity[i] * delta;
        }

        let playerTranslateDistance = this.creatureCollision(totalTranslateDistance);
        totalTranslateDistance = this.mapCollision(playerTranslateDistance);

        // If Map Collision Happens, Set That Direction Velocity To Zero

        //this.velocity[0] += (totalTranslateDistance[0] - playerTranslateDistance[0]) * 2;
        //this.velocity[1] += (totalTranslateDistance[1] - playerTranslateDistance[1]) * 2;
        //if (Math.abs(playerTranslateDistance[0] - totalTranslateDistance[0]) > 0.3) this.velocity[0] = playerTranslateDistance[0] - totalTranslateDistance[0];
        //if (Math.abs(playerTranslateDistance[1] - totalTranslateDistance[1]) > 0.3) this.velocity[1] = playerTranslateDistance[1] - totalTranslateDistance[1];

        //this.velocity[2] += (totalTranslateDistance[2] - playerTranslateDistance[2]) * 10;
        if (Math.abs(playerTranslateDistance[2] - totalTranslateDistance[2]) > 0.001) {
            this.velocity[2] = 0;
            this.onGround = true;
        }else{
            this.onGround = false;
        }


        creatureTrans.position.x += totalTranslateDistance[0];
        creatureTrans.position.y += totalTranslateDistance[1];
        creatureTrans.position.z += totalTranslateDistance[2];


        // If Fall Out The World
        if (creatureTrans.position.z < -10){
            let theUnit = game_map.getUnit([creatureTrans.position.x + 0.5 >> 0, creatureTrans.position.y + 0.5 >> 0]);
            if (theUnit != null){
                creatureTrans.position.z = theUnit.height + this.creature.radius + 1;
            }
        }

        this.displayUnits();


        // Apply Item Collision 
        //this.itemCollision(translateDistance); 
        

        // Updating Camera Position
        this.camera.position.x = this.creature.object.position.x;
        this.camera.position.y = this.creature.object.position.y - carmeraOffsetY;
        this.camera.position.z = this.creature.object.position.z + carmeraHeight;

        // Attack
        if (this.mouse.left == true && this.attackCD <= 0){
            this.sendProjectile(totalTranslateDistance, delta);
            this.attackCD = 1;
        }

        // Attack CoolDown (CD)
        if (this.attackCD > 0){
            this.attackCD -= this.creature.properties.attackSpeed * delta;
        }





        // set Transparent Of All lastRayHideUnit To False;
        for ( let i = 0; i < this.lastRayHideUnit.length; ++i) {
            let theUnit = this.lastRayHideUnit[i];
            theUnit.transparent = false;
        }

        // Check If Unit Is Blocking the Ray;
        let newRayHideUnit = [];
        let rayRange = this.creature.radius - 0.3;
        if (rayRange < 0) rayRange = 0.3;
        let raySpace = rayRange / Math.ceil(rayRange);
        for (let i = -rayRange; i <= rayRange; i += raySpace) {
            let newPosition = new THREE.Vector3(i, carmeraOffsetY -  Math.sqrt(rayRange * rayRange - i * i), -carmeraHeight);
            raycaster.set(this.camera.position, newPosition.clone().normalize());
            raycaster.far = Math.sqrt(newPosition.x * newPosition.x + newPosition.y * newPosition.y + newPosition.z * newPosition.z);
            let intersects = raycaster.intersectObjects(game_map.object.children);
            for ( let j = 0; j < intersects.length; ++j) {
                let target = new THREE.Vector3();
                intersects[j].object.getWorldPosition(target)
                let theUnit = game_map.getUnit([target.x >> 0, target.y >> 0]);

                if (theUnit == null && theUnit.transparent) continue;

                intersects[j].object.material = game_map.unitIDList[theUnit.ID].transparentMaterial;
                newRayHideUnit.push(theUnit);
                theUnit.transparent = true;
                
            }
        }

        // Respawn The Unit That Is Not Blocking the Ray
        for ( let i = 0; i < this.lastRayHideUnit.length; ++i) {
            let theUnit = this.lastRayHideUnit[i];
            if (theUnit.transparent == false && theUnit.mesh != null){
                game_map.object.remove(theUnit.mesh);
                theUnit.mesh = null;
                game_map.spawnUnit(theUnit);
            }
        }

        this.lastRayHideUnit = newRayHideUnit;






    } 
} 