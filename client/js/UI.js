// Button UI Function
function displayPlayerName() {
    document.getElementById("playerName").innerHTML = "Player Name: " + playerArray[clientPlayerID].name;
}

function displayPlayerHealth() {
    document.getElementById("playerHealth").innerHTML = "Player Health: " + playerArray[clientPlayerID].health;
}

function displayPlayerArmor() {
    document.getElementById("playerArmor").innerHTML = "Player Armor: " + playerArray[clientPlayerID].armor;
}

function displayPlayerAttackDamage() {
    document.getElementById("playerAttackDamange").innerHTML = "Player Attack Damage: " + playerArray[clientPlayerID].attackDamage;
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
var hashKey = "";

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
        lockedCommand(inputArray);
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
    }

    // Displaying Current Player Location In Console
    if (inputArray[0] == "location") {
        console.log(playerArray[clientPlayerID].object.position);
    }
}

// Commands That Need To Be Unlocked
function lockedCommand(inputArray) {
    // Teleport The Player
    if (inputArray[0] == "tp") {
        // Input Control
        if (isNaN(parseInt(inputArray[1])) || isNaN(parseInt(inputArray[2]))) {
            console.log("The TP Location Is Invalid!");
            return;
        }

        // Updating Redenerer Information
        player_controller.controllerUpdateBlock([game_map.map2DToBlock2D([inputArray[1], inputArray[2]]), game_map.getDirection([inputArray[1], inputArray[2]])]);

        // Moving Player To New Position
        player_controller.creature.object.position.x = inputArray[1];
        player_controller.creature.object.position.y = inputArray[2];

        // Moving The Camera With The Player
        player_controller.camera.position.x = inputArray[1];
        player_controller.camera.position.y = inputArray[2] - carmeraOffsetY;

        // Update Player Position Event
        var event = new Event('position event', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event);
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
        
        let xPos = playerArray[parseInt(inputArray[1])].object.position.x;
        let yPos = playerArray[parseInt(inputArray[1])].object.position.y;
        // Updating Redenerer Information
        player_controller.controllerUpdateBlock([xPos, yPos]), game_map.getDirection([xPos, yPos]);

        // Moving Player To New Position
        player_controller.creature.object.position.x = xPos;
        player_controller.creature.object.position.y = yPos;

        // Moving The Camera With The Player
        player_controller.camera.position.x = xPos;
        player_controller.camera.position.y = yPos - carmeraOffsetY;

        // Update Player Position Event
        var event = new Event('position event', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event);
    }
}

// Preventing User From Zooming The WebPage
/* window.addEventListener('resize', () => {
    alert("This Game Work Best With 100% Scale");
}) */