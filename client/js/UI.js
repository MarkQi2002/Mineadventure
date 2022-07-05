const menuHtml = document.querySelector('#noSelect');

// Button UI Function
function displayPlayerName() {
    document.getElementById("playerName").innerHTML = "Player Name: " + playerArray[clientPlayerID].name;
}

function displayPlayerHealth() {
    document.getElementById("playerHealth").innerHTML = "Player Health: " + playerArray[clientPlayerID].properties["health"] + "/" + playerArray[clientPlayerID].properties["maxHealth"];
    document.getElementById("playerHealthInfo").innerHTML = playerArray[clientPlayerID].properties["health"] + "/" + playerArray[clientPlayerID].properties["maxHealth"];
    let scale = playerArray[clientPlayerID].properties["health"] / playerArray[clientPlayerID].properties["maxHealth"];
    if (scale < 0){
        scale = 0;
    }else if (scale > 1){
        scale = 1;
    }
    document.getElementById("playerHealthBar").style.width = (98 * scale).toString() + '%';
}

function displayPlayerArmor() {
    document.getElementById("playerArmor").innerHTML = "Player Armor: " + playerArray[clientPlayerID].properties["armor"];
}

function displayPlayerAttackDamage() {
    document.getElementById("playerAttackDamange").innerHTML = "Player Attack Damage: " + playerArray[clientPlayerID].properties["attackDamage"];
}


function displayAllUI() {
    displayPlayerName();
	displayPlayerHealth();
	displayPlayerArmor();
	displayPlayerAttackDamage();
}


class damageText{
    constructor(type, amount, position) {
        this.deleteTimer = 1;
        this.position = [position[0] + Math.random() - 0.5, position[1] + Math.random() - 0.5, position[2] + Math.random() - 0.5];

        this.text = document.createElement('div');
        this.text.style.position = 'absolute';
        this.text.style.textAlign = "center";
        this.text.style.width = 100;
        this.text.style.height = 100;
        this.text.innerHTML = Math.abs(amount);

        this.size = (8 / Math.PI * Math.atan(Math.abs(amount) / 100) + 1) * 0.01 *  window.innerHeight;
        

        if (type == "true"){
			this.text.style.color = "white";
		}else if(type == "normal"){
			this.text.style.color = "#AB4100";
        }else if(type == "criticalNormal"){
            this.text.style.color = "red";
            this.size *= 2;
		}else if(type == "heal"){
			this.text.style.color = "green";
		}

        this.sqrtSize = Math.sqrt(this.size);
        this.rate = this.deleteTimer / (2 * this.sqrtSize);
        this.text.style.fontSize = this.size + 'px';

        this.text.style.opacity = 0.75;

        let [posX, posY] = this.toXYCoords(this.position);
        this.text.style.top = posY + 'px';
        this.text.style.left = posX + 'px';
        menuHtml.appendChild(this.text);

        



        damageTextList.push(this);

    }

    toXYCoords(pos) {
        var vector = new THREE.Vector3(pos[0], pos[1], pos[2]).project(player_controller.camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return [vector.x, vector.y];
    }

    update(delta, index){
        let [posX, posY] = this.toXYCoords(this.position);
        let num = this.deleteTimer / this.rate - this.sqrtSize;
        this.text.style.top = posY - (this.size - num * num) + 'px';
        this.text.style.left = posX + 'px';


        if (this.deleteTimer < 0){
            this.delete(index);
        }
        this.deleteTimer -= delta;

    }


    delete(index){
        damageTextList.splice(index, 1);
        menuHtml.removeChild(this.text);
        delete this;
    }

}




class creatureUI{
    constructor(creature) {
        this.scale = 1;
        this.creature = creature;

        this.UI = document.createElement('div');
        this.UI.style.position = 'absolute';

        this.name = document.createElement('div');

        /*
        document.querySelector('#content').insertAdjacentHTML(
            'afterbegin',
            `<div class="row">
              <input type="text" name="name" value="" />
              <input type="text" name="value" value="" />
              <label><input type="checkbox" name="check" value="1" />Checked?</label>
              <input type="button" value="-" onclick="removeRow(this)">
            </div>`      
        )*/

        this.name.style.position = 'relative';
        this.name.style.textAlign = 'center';
        this.name.innerHTML = this.creature.name;
		this.name.style.color = 'white';
        this.name.style.opacity = 1;

        this.healthBackground = document.createElement('div');
        this.healthBackground.style.position = 'relative';
        this.healthBackground.style.backgroundColor = "rgba(255,255,255,0.5)";

        this.healthBar = document.createElement('div');
        this.healthBackground.appendChild(this.healthBar);
        this.healthBar.style.position = 'relative';
        this.healthBar.style.backgroundColor = "rgba(255,0,0,1)";
        this.healthBar.style.opacity = 1;

        this.updateSize();

        this.UI.style.visibility = 'hidden';

        let [posX, posY] = this.toXYCoords([this.creature.object.position.x, this.creature.object.position.y, this.creature.object.position.z]);
        this.UI.style.top = posY + 'px';
        this.UI.style.left = posX + 'px';
        this.UI.appendChild(this.name);
        this.UI.appendChild(this.healthBackground);
        menuHtml.appendChild(this.UI);
    }

    toXYCoords(pos) {
        var vector = new THREE.Vector3(pos[0], pos[1], pos[2]).project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return [vector.x - this.UI.clientWidth / 2, vector.y - this.UI.clientHeight / 2  - window.innerWidth * 0.03];
    }

    setScale(scale){
        this.scale = scale;
        this.healthBar.style.width = window.innerHeight * 0.1 * scale + 'px';
    }

    updateSize(){
        this.UI.style.width = window.innerHeight * 0.2 + "px";
        this.UI.style.height = window.innerHeight * 0.05  + "px";

        this.name.style.width = window.innerHeight * 0.2 + 'px';
        this.name.style.height = window.innerHeight * 0.025 + 'px';
        this.name.style.fontSize = window.innerHeight * 0.02 + 'px';
        this.name.style.top = 0 + 'px';
        this.name.style.left = 0 + 'px';

        this.healthBackground.style.width = window.innerHeight * 0.105 + 'px';
        this.healthBackground.style.height = window.innerHeight * 0.015 + 'px';
        this.healthBackground.style.top = window.innerHeight * 0.005 + 'px';
        this.healthBackground.style.left = window.innerHeight * 0.05 + 'px';

        this.setScale(this.scale);
        this.healthBar.style.height = window.innerHeight * 0.01 + 'px';
        this.healthBar.style.top = window.innerHeight * 0.0025 + 'px';
        this.healthBar.style.left = window.innerHeight * 0.0025 + 'px';
    }

    update(delta){
        let [posX, posY] = this.toXYCoords([this.creature.object.position.x, this.creature.object.position.y, this.creature.object.position.z]);
        this.UI.style.top = posY + 'px';
        this.UI.style.left = posX + 'px';
    }


    delete(){
        menuHtml.removeChild(this.UI);
        delete this;
    }

}







// Terminal Function
var command = document.getElementById("terminalInput");
command.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("terminalSubmit").click();
    }
  });

// SHA256 Unlock
var hashKey = "kodiaks";

function terminalSubmit() {
    // Receiving User Input
    var inputCommand = document.getElementById("terminalInput").value;
    var inputArray = inputCommand.split(' ');

    // Forge Instance Initialized SHA-256
    var md = forge.md.sha256.create();
    md.start();
    md.update(hashKey, "utf8");

    // Check If Hash Key Input Correctly
    if (md.digest().toHex() != "28713e0f7e8b977dcd866fcf8686d1242413e661162e68c0a02d9084b90d4a53") {
        // Commands That Doesn't Need Cheat
        unlockedCommand(inputArray);
    } else {
        // Commands That Doesn't Need Cheat
        unlockedCommand(inputArray);

        // Commands That Need Cheat
        lockedCommand(inputArray);
    }
}

// Commands That Doesn't Need Unlock
function unlockedCommand(inputArray) {
    // For Unlocking Cheat Menu
    if (inputArray[0] == "unlock") {
        hashKey = inputArray[1];
        console.log(hashKey);

        // Forge Instance Initialized SHA-256
        var md = forge.md.sha256.create();
        md.start();
        md.update(hashKey, "utf8");

        // For Unlocking Cheat Menu
        if (md.digest().toHex() != "28713e0f7e8b977dcd866fcf8686d1242413e661162e68c0a02d9084b90d4a53") console.log("Hash Failed! No Cheat For You!");
        else console.log("Hash Correctly");
    // Displaying Current Player Location In Console
    } else if (inputArray[0] == "location") {
        console.log(playerArray[clientPlayerID].object.position);
    }
}

// Commands That Need To Be Unlocked
function lockedCommand(inputArray) {
    // Teleport The Player
    if (inputArray[0] == "tp") {
        // Input Control
        let [playerX, playerY] = [parseInt(inputArray[1]), parseInt(inputArray[2])];

        player_controller.controllerUpdateBlock([game_map.map2DToBlock2D([playerX, playerY]), game_map.getDirection([playerX, playerY])]);


        if (isNaN(parseInt(playerX)) || isNaN(parseInt(playerY))) {
            console.log("The TP Location Is Invalid!");
            return;
        }

        // Updating Redenerer Information

        // Moving Player To New Position
        player_controller.creature.object.position.x = playerX;
        player_controller.creature.object.position.y = playerY;

        // Moving The Camera With The Player
        player_controller.camera.position.x = playerX;
        player_controller.camera.position.y = playerY - carmeraOffsetY;

        // Update Player Position Event
        var event = new Event('position event', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event);
    // Teleport To Playe By Player ID
    } else if (inputArray[0] == "tpa") {
        // Input Control
        if (isNaN(parseInt(inputArray[1]))) {
            console.log("The Player Number Input Is Invalid!");
            return;
        }

        if (playerArray[parseInt(inputArray[1])] == null) {
            console.log("Player Number ", parseInt(inputArray[1]), " Not Found");
            return;
        }
        
        let playerX = Math.floor(playerArray[parseInt(inputArray[1])].object.position.x);
        let playerY = Math.floor(playerArray[parseInt(inputArray[1])].object.position.y);

        // Updating Redenerer Information
        player_controller.controllerUpdateBlock([game_map.map2DToBlock2D([playerX, playerY]), game_map.getDirection([playerX, playerY])]);


        let xPosOffset, yPosOffset;
        let count = 0
        while (count < 10) {
            xPosOffset = Math.floor((Math.random() < 0.5) ? 1 : -1) + playerX;
            yPosOffset = Math.floor((Math.random() < 0.5) ? 1 : -1) + playerY;
            let unit = game_map.getUnit([xPosOffset, yPosOffset]);
            if ( unit != null && !(game_map.unitIDList[unit.ID].collision)){
                break;
            }
            count ++;
        }
        if (count >= 10){
            xPosOffset = playerX;
            yPosOffset = playerY;
        }


        // Moving Player To New Position
        player_controller.creature.object.position.x = xPosOffset;
        player_controller.creature.object.position.y = yPosOffset;

        // Moving The Camera With The Player
        player_controller.camera.position.x = xPosOffset;
        player_controller.camera.position.y = yPosOffset - carmeraOffsetY;

        // Update Player Position Event
        var event = new Event('position event', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event);
    // Teleport To Player By Name
    } else if (inputArray[0] == "tpn") {
        let trueIndex = -1;
        // Input Control
        for (let playerIndex = 0; playerIndex < playerArray.length; playerIndex++) {
            if (playerArray[playerIndex] != null && playerArray[playerIndex].name == inputArray[1]) {
                trueIndex = playerIndex;
                break;
            }
        }

        // Didn't Find The Player
        if (trueIndex == -1) {
            console.log("Couldn't Find Player Named: ", inputArray[1]);
            return;
        }
        
        let xPosOffset = playerArray[trueIndex].object.position.x + 1;
        let yPosOffset = playerArray[trueIndex].object.position.y + 1;

        // Updating Redenerer Information
        player_controller.controllerUpdateBlock([game_map.map2DToBlock2D([xPosOffset, yPosOffset]), game_map.getDirection([xPosOffset, yPosOffset])]);

        // Moving Player To New Position
        player_controller.creature.object.position.x = xPosOffset;
        player_controller.creature.object.position.y = yPosOffset;

        // Moving The Camera With The Player
        player_controller.camera.position.x = xPosOffset;
        player_controller.camera.position.y = yPosOffset - carmeraOffsetY;

        // Update Player Position Event
        var event = new Event('position event', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event);

    } else {

        if (isNaN(parseInt(inputArray[2])) || (inputArray.length >= 4 && isNaN(parseInt(inputArray[3])))) {
            console.log("The Number Is Invalid!");
            return;
        }

        let id = inputArray.length < 4 ? clientPlayerID : parseInt(inputArray[3]);
        if (playerArray[id].properties[inputArray[0]] == null) {
            console.log("The Property Is Invalid!");
            return;
        }

        if (!(["+", "-", "*", "/", "="].includes(inputArray[1]))) {
            console.log("The Math Symbol Invalid!");
            return;
        }

        let creatureType = (inputArray.length >= 5 && inputArray[4] == "monster") ? "monster" : "player";
        
        let propertyList = {};
        propertyList[inputArray[0]] = [inputArray[1], parseInt(inputArray[2])];
        sendCreaturePropertyChange([creatureType, id], propertyList);
        
    }

}

// Preventing User From Zooming The WebPage
/* window.addEventListener('resize', () => {
    alert("This Game Work Best With 100% Scale");
}) */

// Item UI
function itemUIInfo() {
    this.itemName = "NULL";
    this.itemAmount = 0;
}

// UI Array For Item
var itemUIArray = { item0: new itemUIInfo,
                    item1: new itemUIInfo,
                    item2: new itemUIInfo,
                    item3: new itemUIInfo,
                    item4: new itemUIInfo,
                    item5: new itemUIInfo,
                    item6: new itemUIInfo,
                    item7: new itemUIInfo,
                    item8: new itemUIInfo,
                    item9: new itemUIInfo,
                    item10: new itemUIInfo,
                    item11: new itemUIInfo,
                    item12: new itemUIInfo,
                    item13: new itemUIInfo,
                    item14: new itemUIInfo,
                    item15: new itemUIInfo,
                    item16: new itemUIInfo,
                    item17: new itemUIInfo,
                    item18: new itemUIInfo,
                    item19: new itemUIInfo};

// Append Item When Pick Up An Item
function appendItemUIArray(itemName) {
    for (let [key, value] of Object.entries(itemUIArray)) {
        if (value.itemName == itemName) {
            value.itemAmount++;
            updateItemUI(key);
            return;
        }
    }

    for (let [key, value] of Object.entries(itemUIArray)) {
        if (value.itemName == "NULL") {
            value.itemName = itemName;
            value.itemAmount++;
            updateItemUI(key);
            return;
        }
    }
}

// For Updating Item UI Image
function updateItemUI(key) {
    document.getElementById(key).children[0].src="image/UI_Image/" + itemUIArray[key].itemName + ".png";
    document.getElementById(key).children[1].textContent = itemUIArray[key].itemAmount;
}
