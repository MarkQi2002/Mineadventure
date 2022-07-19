// Variable Declaration
const menuHtml = document.querySelector('#noSelect');
const creatureInfoUI = document.querySelector("#creatureInfo");
const chatBoxUI = document.querySelector("#chatBox");
const terminalInput = document.getElementById("terminalInput");
var creatureInfoUIList = {};

// Button UI Function
function displayPlayerHealth() {
    creatureInfoUIList.health.update(playerArray[clientPlayerID].properties["health"]);
    document.getElementById("playerHealthInfo").innerHTML = playerArray[clientPlayerID].properties["health"] + "/" + playerArray[clientPlayerID].properties["maxHealth"];
    let scale = playerArray[clientPlayerID].properties["health"] / playerArray[clientPlayerID].properties["maxHealth"];
    if (scale < 0){
        scale = 0;
    }else if (scale > 1){
        scale = 1;
    }
    document.getElementById("playerHealthBar").style.width = (98 * scale).toString() + '%';
}

// Displaying Creature Properties UI
function displayCreatureProperties() {
    for (let [key, value] of Object.entries(player_controller.creature.properties)) {
        creatureInfoUIList[key].update(value);
    }
}

// Initialize The UI
function initUI() {
    for (let [key, value] of Object.entries(player_controller.creature.properties)) {
        creatureInfoUIList[key] = new propertiesUI(key, value);
    }

    var coll = document.querySelector('#creaturePropertiesButton');
    coll.addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
    });

    coll = document.querySelector('#messageDisplayButton');
    coll.addEventListener("click", function() {
        this.classList.toggle("active");
        var content = chatBoxUI;
        if (content.style.maxHeight === "70%") {
          content.style.maxHeight = "10%";
          content.style.overflowY = "hidden";
          coll.innerHTML = " ^ ";
        } else {
          content.style.maxHeight= "70%";
          content.style.overflowY = "scroll";
          coll.innerHTML = " v ";
        }
        content.scrollTo(0, content.scrollHeight);
    });
}

// Function To Display The UI
function displayAllUI() {
	displayPlayerHealth();
    displayCreatureProperties();
}

// Properties UI Class
class propertiesUI {
    constructor(key, value) {
        this.key = key;
        this.text = document.createElement('div');
        this.text.style.position = 'relative';
        this.text.style.width = 100 + 'vw';
        this.text.style.height = 5 + 'vh';
        this.text.innerHTML = this.key + ": " + value;
        this.text.style.fontSize = 2 + 'vh';

        //this.text.style.opacity = 1;
        this.text.style.top = 2 + 'vh';
        this.text.style.left = 2 + 'vw';

        creatureInfoUI.appendChild(this.text);

    }

    // Setting UI Information
    update(value) {
        this.text.innerHTML = this.key + ": " + value;
    }

}

// Message UI Class
class messageUI {
    // messageUI Constructor
    constructor(name, text, color) {
        this.name = name;
        this.text = document.createElement('div');
        this.text.classList.add("messageClass");
        this.text.innerHTML = this.name + ": " + text;
        this.text.style.color = color;
        chatBoxUI.appendChild(this.text);
        chatBoxUI.scrollTo(0, chatBoxUI.scrollHeight);

    }

    // Setting UI Size
    setSize(){
        this.text.style.fontSize = window.innerHeight * 0.02 + 'px';
    }

    // Setting UI Information
    update(value){
        this.text.innerHTML = this.key + ": " + value;
    }
}

// Damage Text Class
class damageText{
    // Damage Text Class Constructor
    constructor(type, amount, position) {
        this.deleteTimer = 1;
        this.position = [position[0] + Math.random() - 0.5, position[1] + Math.random() - 0.5, position[2] + Math.random() - 0.5];

        // Dynamic Text CSS
        this.text = document.createElement('div');
        this.text.style.position = 'absolute';
        this.text.style.textAlign = "center";
        this.text.style.width = 100;
        this.text.style.height = 100;
        this.text.innerHTML = Math.abs(amount);
        this.size = (8 / Math.PI * Math.atan(Math.abs(amount) / 100) + 1);
        console.log( this.size)
        this.text.style.fontSize = this.size + 'vh';
        //this.size = this.size * window.innerHeight;
        
        // Check Damage Type
        if (type == "true") {
			this.text.style.color = "white";
		} else if(type == "normal") {
			this.text.style.color = "#AB4100";
        } else if(type == "criticalNormal") {
            this.text.style.color = "red";
            this.size *= 2;
		} else if(type == "heal") {
			this.text.style.color = "green";
		}

        // Damage Text Timer
        this.sqrtSize = Math.sqrt(this.size);
        this.rate = this.deleteTimer / (2 * this.sqrtSize);

        this.text.style.opacity = 0.75;
        
        // Damage Text Locatoin Update
        let [posX, posY] = this.toXYCoords(this.position);
        this.text.style.top = posY + 'px';
        this.text.style.left = posX + 'px';
        menuHtml.appendChild(this.text);

        // Pushing To damageTextList
        damageTextList.push(this);
    }

    // Converting To xy Coordinate
    toXYCoords(pos) {
        var vector = new THREE.Vector3(pos[0], pos[1], pos[2]).project(player_controller.camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return [vector.x, vector.y];
    }

    // Updating Damage Text Location
    update(delta, index){
        // Update Position
        let [posX, posY] = this.toXYCoords(this.position);
        let num = this.deleteTimer / this.rate - this.sqrtSize;
        this.text.style.top = posY - (this.size - num * num) + 'px';
        this.text.style.left = posX + 'px';
        
        // Decrement Timer
        this.deleteTimer -= delta;

        // Remove Text If Enough Time Passed
        if (this.deleteTimer < 0) this.delete(index);
    }

    // Removing Damage Text
    delete(index){
        damageTextList.splice(index, 1);
        menuHtml.removeChild(this.text);
        delete this;
    }
}

// Creature UI Class
class creatureUI{
    // Creature UI Constructor
    constructor(creature) {
        this.scale = 1;
        this.creature = creature;

        // DIV CSS
        this.UI = document.createElement('div');
        this.UI.style.position = 'absolute';
        this.UI.style.width = 10 + "vh";
        this.UI.style.height = 4  + "vh";
        this.UI.style.overflow = "hidden";

        // Name DIV CSS
        this.name = document.createElement('div');
        this.name.style.position = 'relative';
        this.name.style.textAlign = 'center';
        this.name.innerHTML = this.creature.name;
		this.name.style.color = 'white';
        this.name.style.opacity = 1;
        this.name.style.width = 100 + '%';
        this.name.style.height = 50 + '%';
        this.name.style.fontSize = 1.5 + 'vh';
        this.name.style.top = 0 + '%';
        this.name.style.left = 0 + '%';

        // Background CSS
        this.healthBackground = document.createElement('div');
        this.healthBackground.style.position = 'relative';
        this.healthBackground.style.backgroundColor = "rgba(255,255,255,0.5)";
        this.healthBackground.style.width = 80 + '%';
        this.healthBackground.style.height = 30 + '%';
        this.healthBackground.style.left = 20 + '%';
        
        // HealthBar CSS
        this.healthBar = document.createElement('div');
        this.healthBackground.appendChild(this.healthBar);
        this.healthBar.style.position = 'relative';
        this.healthBar.style.backgroundColor = "rgba(255,0,0,1)";
        this.healthBar.style.opacity = 1;
        this.setScale(this.scale);
        this.healthBar.style.height = 60 + '%';
        this.healthBar.style.top = 20 + '%';
        this.healthBar.style.left = 5 + '%';

        // Level CSS
        this.level = document.createElement('div');
        this.level.style.position = 'relative';
        this.level.style.width = 20 + '%';
        this.level.style.height = 50 + '%';
        this.level.style.top = -30 + '%';

        var levelImage = document.createElement("IMG");
        levelImage.style.position = 'absolute';
        levelImage.setAttribute("src", "/image/levelCircle.png");
        levelImage.style.width = 100 + '%';
        levelImage.style.height = 100 + '%';
        this.level.appendChild(levelImage);

        this.levelText = document.createElement('div');
        this.levelText.style.position = 'absolute';
        this.levelText.style.textAlign = 'center';
        this.updateLevel();
        this.levelText.style.width = 100 + '%';
        this.levelText.style.height = 100 + '%';
        //this.levelText.style.top = 50 + '%';
       // this.levelText.style.left = 50 + '%';
        this.level.appendChild(this.levelText);

        //this.level.style.left = window.innerHeight * 0 + 'px';

        this.UI.style.visibility = 'hidden';

        // Position
        let [posX, posY] = this.toXYCoords([this.creature.object.position.x, this.creature.object.position.y, this.creature.object.position.z]);
        this.UI.style.top = posY + 'px';
        this.UI.style.left = posX + 'px';
        this.UI.appendChild(this.name);
        this.UI.appendChild(this.healthBackground);
        this.UI.appendChild(this.level);
        menuHtml.appendChild(this.UI);
    }

    updateLevel(){
        this.levelText.innerHTML = this.creature.properties.level;
    }

    // Conversion To XY Coordinate
    toXYCoords(pos) {
        var vector = new THREE.Vector3(pos[0], pos[1], pos[2]).project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return [vector.x - this.UI.clientWidth / 2, vector.y - this.UI.clientHeight / 2  - window.innerWidth * 0.03];
    }

    // Setting Scale Based On Window Size
    setScale(scale) {
        this.scale = scale;
        this.healthBar.style.width = 90 * scale + '%';
    }

    // Update Function
    update(delta){
        let [posX, posY] = this.toXYCoords([this.creature.object.position.x, this.creature.object.position.y, this.creature.object.position.z]);
        this.UI.style.top = posY + 'px';
        this.UI.style.left = posX + 'px';
    }

    // Deletion Function
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
var sendingMessage = ["System", "Init Message"];
var sendingCommand = [null, null];

function terminalSubmit() {
    // Receiving User Input
    var inputCommand = terminalInput.value;
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

        if (inputArray[0][0] == "/"){
            inputArray[0] = inputArray[0].substr(1, inputArray[0].length - 1);
            lockedCommand(inputArray);
        }else if (inputCommand !=''){
            sendingMessage = [player_controller.creature.name, inputCommand];
            document.dispatchEvent(new Event('sendMessage', {bubbles: true, cancelable: false}));
            terminalInput.value = '';
        }
        
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

        player_controller.controllerUpdateBlock(game_map.mapPosToBlockPos([playerX, playerY]));


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
        player_controller.controllerUpdateBlock(game_map.mapPosToBlockPos([playerX, playerY]));


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
        player_controller.controllerUpdateBlock(game_map.mapPosToBlockPos([playerX, playerY]));

        // Moving Player To New Position
        player_controller.creature.object.position.x = xPosOffset;
        player_controller.creature.object.position.y = yPosOffset;

        // Moving The Camera With The Player
        player_controller.camera.position.x = xPosOffset;
        player_controller.camera.position.y = yPosOffset - carmeraOffsetY;

        // Update Player Position Event
        var event = new Event('position event', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event);

    } else if (inputArray[0] == "mapLevel"){
        if (inputArray[1] == null || isNaN(parseInt(inputArray[1]))) {
            console.log("The Number Is Invalid!");
            return;
        }

        sendingCommand = ["mapLevel", parseInt(inputArray[1])];

        document.dispatchEvent(new Event('sendCommand', {bubbles: true, cancelable: false}));
    }else {

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
