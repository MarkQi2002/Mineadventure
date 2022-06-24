// Constructing An Player Object And Storing In The Client Side playerArray
function spawnPlayer(playerInfo){
	let new_player = new player(playerInfo.name,
								playerInfo.position,
								playerInfo.health,
								playerInfo.armor,
								playerInfo.attackDamage,
								playerInfo.attackSpeed);

	playerArray[playerInfo.ID] = new_player;
	return new_player;
}

// Initialization Every Player Before You Enter The Game
const initSelf = (severPlayerID, serverPlayerArray, serverMap, projectileList) => {
	clientPlayerID = severPlayerID;
	playerArray.length = serverPlayerArray.length;
	for (let i = 0; i < serverPlayerArray.length; i++) {
		if (serverPlayerArray[i] != null){
			spawnPlayer(serverPlayerArray[i]);
		}
	}

	game_map = new map(serverMap);


	spawnProjectile(projectileList);
};

// Initialization Myself And All Future Players
const newPlayer = (playerInfo, playerArrayLength) => {
	playerArray.length = playerArrayLength;
	let new_player = spawnPlayer(playerInfo);
	// Setting The Controller To The Player When First Enter
	if (playerInfo.ID == clientPlayerID){
		player_controller = new controller(new_player, camera);

		// Display Infomration On UI
		displayPlayerName();
		displayPlayerHealth();
		displayPlayerArmor();
		displayPlayerAttackDamage();

		// Animate The Player
		animate();
	}
};

// Update Every Player's Position
const playerPositionUpdate = ([Pos, PlayerID]) => {
	if (PlayerID != clientPlayerID){
		playerArray[PlayerID].object.position.set(Pos[0], Pos[1], Pos[2]);
	}
};

// ------------------Item----------------------
// Variable Declaration
var removeItemID;
var additionalItem;

// For Updating Player Item Array
const playerItemArrayUpdate = (additionalItem, updatePlayerID) => {
	playerArray[updatePlayerID].playerItemArray[additionalItem.name]++;
	console.log("Player ", updatePlayerID, " Item Array: ", playerArray[updatePlayerID].playerItemArray);

	// Player Property Update
	// Defensive Property Update
	if (additionalItem.buffType == "Defensive") {
		playerArray[updatePlayerID].health += additionalItem.health;
		playerArray[updatePlayerID].armor += additionalItem.armor;
		console.log(playerArray[updatePlayerID].health);
	}

	// Attack Property Update
	if (additionalItem.buffType == "Attack") {
		playerArray[updatePlayerID].attackDamage += additionalItem.attackDamage;
		playerArray[updatePlayerID].attackSpeed += additionalItem.attackSpeed;
		console.log(playerArray[updatePlayerID].health);
	}

	// Display Infomration On UI
	displayPlayerName();
	displayPlayerHealth();
	displayPlayerArmor();
	displayPlayerAttackDamage();
}
// Initialization Myself And All Future Players
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnItem(itemInfo, itemIndex){
	// Creating The Item Object
	var new_item;
	if (itemInfo.itemName == "Blood Orb") {
		new_item = new bloodOrb(itemInfo.itemName,
								itemInfo.itemRarity,
								itemInfo.itemStackType,
								itemInfo.itemBuffType,
								itemInfo.itemPosition);

	} else if (itemInfo.itemName == "Attack Orb") {
		new_item = new attackOrb(itemInfo.itemName,
								itemInfo.itemRarity,
								itemInfo.itemStackType,
								itemInfo.itemBuffType,
								itemInfo.itemPosition);
	}

	if (itemArray[itemIndex] == null) {
		itemArray[itemIndex] = new_item;
		console.log("Spawning", itemInfo, " At ItemIndex: ", itemIndex);
	}

	return new_item;
}

// Initialization Every Item Before You Enter The Game
const initItem = (serverItemArray) => {
	itemArray.length = serverItemArray.length;
	for (let itemIndex = 0; itemIndex < serverItemArray.length; itemIndex++) {
		if (serverItemArray[itemIndex] != null){
			spawnItem(serverItemArray[itemIndex], itemIndex);
		}
	}
};

// Initialization All Future Item
const newItem = (itemInfo, itemIndex) => {
	spawnItem(itemInfo, itemIndex);
};

// Removing An Item
const deleteItem = (itemIndex) => {
	if (itemArray[itemIndex] != null) {
		itemArray[itemIndex].delete();
		itemArray[itemIndex] = null;
	}
}

// When The Server Shutdown Or An Connection Error Occur, Log The Error And Transfer To index.html
const connectionError = (error) => {
	console.log(error);
	window.location.href = "index.html";
};

// When A Player Is Disconnected
const playerDisconnect = (PlayerID) => {
	if (playerArray[PlayerID] != null){
		playerArray[PlayerID].delete();
		playerArray[PlayerID] = null;
	}
};

// Update Client Side Block
const clientUpdateBlocks = (blockList) => {
	game_map.spawnBlocks(blockList[0]);
};


// Projectile Related
const spawnProjectile = (projectileInfo) => {
	for (let i = 0; i < projectileInfo.length; i++){
		
		if (projectileInfo[i] != null){
			var newProjectile = new projectile(projectileInfo[i]);
			projectileList.push(newProjectile);
		}
		
	}
};


(() => {
	// When Connected To Server, Create A Sock (MySelf)
	const sock = io();

	// Sending Information To Server Only Once
	// First Parameter Is The Tag, Second Parameter Is What We Send To The Server
	sock.emit('newName', sessionStorage.getItem("playerInitialName"));
	sock.emit('serverNewItem', "Blood Orb");

	// Receiving Information From Server
	// First Parameter Is The Tag, Second Parameter Is The Event/Function To Operate On Information From Server
	sock.on('initSelf', initSelf);
	sock.on('newPlayer', newPlayer);
	sock.on('clientPos', playerPositionUpdate);
	sock.on('clientDisconnect', playerDisconnect);

	sock.on('addBlocks', clientUpdateBlocks);

	sock.on('clientPlayerItemArray', playerItemArrayUpdate);
	sock.on('initItem', initItem);
	sock.on('clientNewItem', newItem);
	sock.on('removeItem', deleteItem);

	sock.on('connect_error', connectionError);
	
	// Projectile Related
	sock.on('spawnProjectile', spawnProjectile);

	// Sending My New Position To Server
	const updatePosition = () => {
		// Return The Player's Accurate Position To The Server As A Tuple
		sock.emit('newPos', [player_controller.creature.object.position.x,
							player_controller.creature.object.position.y,
							player_controller.creature.object.position.z]);
	};
	
	// Sending New Item List To Server
	const updateItem = () => {
		sock.emit('newPlayerItemArray', additionalItem, clientPlayerID);
	}
	// Removing A Collectable Item
	const removeItem = () => {
		sock.emit('deleteItem', removeItemID);
	}
	// Add An Event Called 'position event' And Run updataPosition When The Event Occur
	document.addEventListener('position event', updatePosition);

	// Add An Event Called 'remove item' To Remove An Collectable Item
	document.addEventListener('remove item', removeItem);
	document.addEventListener('player collected item', updateItem);

	// Map Related
	const updateBlock = () => {
		var blockPosList = player_controller.getSurroundingBlockPos([1, 1]);
		if (blockPosList.length > 0){
			sock.emit('requireBlock', blockPosList);
		}
	};
	document.addEventListener('updateBlock', updateBlock);

	// Projectile Related
	const createProjectile = () => {
		sock.emit('newProjectile', newProjectileList);
		newProjectileList = [];
	}
	document.addEventListener('createProjectile', createProjectile);
})();