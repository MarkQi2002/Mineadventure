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
    console.log(md.digest().toHex());

    // Check If Hash Key Input Correctly
    if (md.digest().toHex() != "28713e0f7e8b977dcd866fcf8686d1242413e661162e68c0a02d9084b90d4a53") {
        console.log("Hash Failed! No Cheat For You!");

        // Commands That Doesn't Need Cheat
        unlockedCommand(inputArray);
    } else {
        console.log("Hash Correctly");
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
    }

    if (inputArray[0] == "location") {
        console.log(playerArray[clientPlayerID].object.position);
    }
}

function lockedCommand(inputArray) {
    if (inputArray[0] == "tp") {
        if (isNaN(parseInt(inputArray[1])) || isNaN(parseInt(inputArray[2]))) {
            console.log("The TP Location Is Invalid!");
            return;
        }

        player_controller.creature.object.position.x = inputArray[1];
        player_controller.creature.object.position.y = inputArray[2];

        player_controller.camera.position.x = inputArray[1];
        player_controller.camera.position.y = inputArray[2];

        player_controller.getSurroundingBlockPos([1, 1])
        var event = new Event('position event', {bubbles: true, cancelable: false}) 
        document.dispatchEvent(event);
    }
}