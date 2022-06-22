// Constructing An Player Object And Storing In The Client Side playerArray
function spawnPlayer(playerInfo){
	let new_player = new player(playerInfo.name,
								playerInfo.position,
								playerInfo.health);

	playerArray[playerInfo.ID] = new_player;
	return new_player;
}

// Initialization Every Player Before You Enter The Game
const initSelf = (severPlayerID, serverPlayerArray, serverMap) => {
	clientPlayerID = severPlayerID;
	playerArray.length = serverPlayerArray.length;
	for (let i = 0; i < serverPlayerArray.length; i++) {
		if (serverPlayerArray[i] != null){
			spawnPlayer(serverPlayerArray[i]);
		}
	}

	game_map = new map(serverMap);
};

// Initialization Myself And All Future Players
const newPlayer = (playerInfo, playerArrayLength) => {
	playerArray.length = playerArrayLength;
	let new_player = spawnPlayer(playerInfo);
	// Setting The Controller To The Player When First Enter
	if (playerInfo.ID == clientPlayerID){
		player_controller = new controller(new_player, camera);
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

// Initialization Myself And All Future Players
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnItem(itemInfo, itemIndex){
	console.log("Spawning Item At ItemIndex: ", itemIndex);
	let new_item = new bloodOrb(itemInfo.itemName,
								itemInfo.itemRarity,
								itemInfo.itemStackType,
								itemInfo.itemBuffType,
								itemInfo.itemPosition);

	itemArray[itemIndex] = new_item;
	return new_item;
}

// Initialization Every Item Before You Enter The Game
const initItem = (serverItemArray) => {
	itemArray.length = serverItemArray.length;
	for (let itemIndex = 0; itemIndex < serverItemArray.length; itemIndex++) {
		if (serverItemArray[itemIndex] != null){
			console.log("Spawning Item At ItemIndex: ", itemIndex);
			spawnItem(serverItemArray[itemIndex], itemIndex);
		}
	}
};

// Initialization All Future Item
const newItem = (itemInfo, itemIndex) => {
	console.log("Spawning Item At ItemIndex: ", itemIndex);
	spawnItem(itemInfo, itemIndex);
};

// Removing An Item
const deleteItem = (itemIndex) => {
	if (itemArray[itemIndex] != null) {
		itemArray[itemIndex].delete();
		itemArray[itemIndex] = null;
		console.log("H");
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
	}
};

(() => {
	// When Connected To Server, Create A Sock (MySelf)
	const sock = io();

	// Sending Information To Server Only Once
	// First Parameter Is The Tag, Second Parameter Is What We Send To The Server
	sock.emit('newName', sessionStorage.getItem("playerInitialName"));
	sock.emit('newItem');

	// Receiving Information From Server
	// First Parameter Is The Tag, Second Parameter Is The Event/Function To Operate On Information From Server
	sock.on('initSelf', initSelf);
	sock.on('newPlayer', newPlayer);
	sock.on('clientPos', playerPositionUpdate);
	sock.on('clientDisconnect', playerDisconnect);

	sock.on('initItem', initItem);
	sock.on('newItem', newItem);
	sock.on('removeItem', deleteItem);

	sock.on('connect_error', connectionError);

	// Sending My New Position To Server
	const updatePosition = () => {
		// Return The Player's Accurate Position To The Server As A Tuple
		sock.emit('newPos', [player_controller.creature.object.position.x,
							player_controller.creature.object.position.y,
							player_controller.creature.object.position.z]);
	};
	
	const updateItem = () => {
		sock.emit('deleteItem', removeItemID);
	}
	// Add An Event Called 'position event' And Run updataPosition When The Event Occur
	document.addEventListener('position event', updatePosition);
	document.addEventListener('item event', updateItem);
})();