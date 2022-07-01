// Button UI Function
function displayPlayerName() {
    document.getElementById("playerName").innerHTML = "Player Name: " + playerArray[clientPlayerID].name;
}

function displayPlayerHealth() {
    document.getElementById("playerHealth").innerHTML = "Player Health: " + playerArray[clientPlayerID].properties["health"] + "/" + playerArray[clientPlayerID].properties["maxHealth"];
    document.getElementById("playerHealthInfo").innerHTML = playerArray[clientPlayerID].properties["health"] + "/" + playerArray[clientPlayerID].properties["maxHealth"];
    document.getElementById("playerHealthBar").style.width = (70 * playerArray[clientPlayerID].properties["health"] / playerArray[clientPlayerID].properties["maxHealth"]).toString() + '%';
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
    for ([key, value] of Object.entries(itemUIArray)) {
        if (value.itemName == itemName) {
            value.itemAmount++;
            updateItemUI(key);
            return;
        }
    }

    for ([key, value] of Object.entries(itemUIArray)) {
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
