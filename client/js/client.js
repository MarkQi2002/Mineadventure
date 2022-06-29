// -------------------Player-------------------
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnPlayer(playerInfo){
	let new_player = new player(playerInfo);

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
		displayAllUI();

		// Animate The Player
		animate();

		// thread event
		
		intervalWorker.onmessage = updateTimeEvent;

	}
};

// Update Every Player's Position
const playerPositionUpdate = ([Pos, PlayerID]) => {
	if (PlayerID != clientPlayerID){
		playerArray[PlayerID].object.position.set(Pos[0], Pos[1], Pos[2]);
	}
};

// Send Player Property Change To Server And Change At All Other Client
function sendPlayerPropertyChange(id, propertyList){
	let isIn = false;
	for (let i; i < changingPlayerInfo.length; i++){
		if (changingPlayerInfo[i][0] == id){
			isIn = true;
			for ([key, value] of Object.entries(propertyList)) {
				changingPlayerInfo[i][1][key] = value;
			}
			break;
		}
	}

	if (!isIn) changingPlayerInfo.push([id, propertyList]);
}

// Change An Player's Property Using Input PlayerInfo
const playerInfoChange = (playerInfo) => {
	// Example playerInfo = [playerID, {"health": ["+", 10], "attackSpeed": ["=", 1], ...}]
	let updateLocalPlayerUI = false;
	for (let i = 0; i < playerInfo.length; i++){
		if (playerArray[playerInfo[i][0]] != null){
			if (playerInfo[i][0] == clientPlayerID) updateLocalPlayerUI = true;

			for ([key, value] of Object.entries(playerInfo[i][1])) {
				let setValue = value[1];
				if (value[0] == "+") setValue = playerArray[playerInfo[i][0]].properties[key] + value[1];
				else if (value[0] == "-") setValue = playerArray[playerInfo[i][0]].properties[key] - value[1];
				else if (value[0] == "*") setValue = playerArray[playerInfo[i][0]].properties[key] * value[1];
				else if (value[0] == "/") setValue = playerArray[playerInfo[i][0]].properties[key] / value[1];

				if (key == "health"){
					playerArray[playerInfo[i][0]].setHealth(setValue);
				} else if (key == "maxHealth") {
					playerArray[playerInfo[i][0]].setMaxHealth(setValue);
				} else {
					playerArray[playerInfo[i][0]].properties[key] = setValue;
				}

				
			}
		}
	}

	if (updateLocalPlayerUI){
		displayAllUI();
	}
};
// -------------------End Of Player-------------------

// -------------------Item-------------------
// Variable Declaration
var additionalItemID;
var removeItemID;
var itemInfoArray;
var itemDefaultPosition = [1, 1, 1];
var itemDefaultGeometry = new THREE.SphereGeometry(0.2, 10, 10);
var itemDefaultMaterial = new THREE.MeshBasicMaterial({color: 'red'});
var itemDefaultmesh = new THREE.Mesh(itemDefaultGeometry, itemDefaultMaterial);

// Update Player Property And Player Item Array
const playerItemArrayUpdate = (additionalItemID, updatePlayerID) => {
	// Update Player Property Based On Item
	let playerInfo = [[updatePlayerID, itemInfoArray[additionalItemID][1]]];
	playerInfoChange(playerInfo);

	// Update Server Side Player Item Array
	if (playerArray[updatePlayerID].playerItemArray[additionalItemID] != null)
		playerArray[updatePlayerID].playerItemArray[additionalItemID]++;
	else
		playerArray[updatePlayerID].playerItemArray[additionalItemID] = 1;

	// Update Item UI
	if (updatePlayerID == clientPlayerID) appendItemUIArray(itemInfoArray[additionalItemID][0].itemName);

	// Return The Additional Item's ID
	return additionalItemID;
}

// Initialization Myself And All Future Players
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnItem(itemID, itemPosition, itemIndex){
	// Creating Passive Item Object
	var new_item = new passiveItem(itemInfoArray[itemID][0], itemDefaultmesh, itemPosition, itemInfoArray[itemID][1]);

	// Storing Passive Item Object Into itemArray
	if (itemArray[itemIndex] == null) {
		itemArray[itemIndex] = new_item;
		console.log("Spawning", itemInfoArray[itemID], " At ItemIndex: ", itemIndex);
	}

	// Return The New Item Object
	return new_item;
}

// Initialization Every Item Before You Enter The Game
const initItem = (serverItemArray, serverItemInfoArray) => {
	// Copy The Sever Item Info Array To Client Item Info Array (The Two Array Are The Same)
	itemInfoArray = serverItemInfoArray;

	// Format And Copy The Item Array From Server Item Array
	itemArray.length = serverItemArray.length;
	for (let itemIndex = 0; itemIndex < serverItemArray.length; itemIndex++) {
		if (serverItemArray[itemIndex] != null){
			spawnItem(serverItemArray[itemIndex].itemID, serverItemArray[itemIndex].itemPosition, itemIndex);
		}
	}
};

// Initialization All Future Item
const newItem = (itemID, itemPosition, itemIndex) => {
	spawnItem(itemID, itemPosition, itemIndex);
};

// Removing An Item
const deleteItem = (itemIndex) => {
	if (itemArray[itemIndex] != null) {
		itemArray[itemIndex].delete();
		itemArray[itemIndex] = null;
	}
}
// -------------------End Of Item-------------------

// -------------------Connection Exception Related-------------------
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
// -------------------End Of Connection Exception Related-------------------

// -------------------Projectile-------------------
// Spawning Projectile
const spawnProjectile = (projectileInfo) => {
	for (let i = 0; i < projectileInfo.length; i++){
		if (projectileInfo[i] != null && projectileInfo[i][1] != null){
			var newProjectile = new projectile(projectileInfo[i][1]);
			if (projectileList.length < projectileInfo[i][0]){
				projectileList.length === projectileInfo[i][0];
			}
			projectileList[projectileInfo[i][0]] = newProjectile;
		}
	}
};

// Update Frame
const updateFrame = ([projectilePosList]) => {
	if (projectileList.length < projectilePosList.length){
		projectileList.length === projectilePosList.length;
	}

	onHitProjectileList = [];
	for (let i = 0; i < projectileList.length; i++){
		if (projectileList[i] != null){
			projectileList[i].positionChange(projectilePosList[i]);


			// local player collision with projectile
			let diffX = projectileList[i].object.position.x - player_controller.creature.object.position.x;
			let diffY = projectileList[i].object.position.y - player_controller.creature.object.position.y;
			if (projectileList[i].damageInfo.attacker != clientPlayerID && Math.abs(diffX) + Math.abs(diffX) < 2){
				let diffZ = projectileList[i].object.position.z - player_controller.creature.object.position.z;
				if (Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ) < 0.7){
					player_controller.damage(projectileList[i].damageInfo.amount);
					onHitProjectileList.push(i);
					projectileList[i].delete();
					projectileList[i] = null;
				}
			}
		}
	}
};

// Removing A Projectile From The Projectile List, And Remove Unit From Unit List (By Position)
const deleteEvent = ([deleteProjectileList, deleteUnitList]) => {
	if (deleteProjectileList != null){
		for (let i = 0; i < deleteProjectileList.length; i++){
			if (projectileList[deleteProjectileList[i]] != null){
				projectileList[deleteProjectileList[i]].delete();
				projectileList[deleteProjectileList[i]] = null;
			}
			
		}
	}

	for (let i = 0; i < deleteUnitList.length; i++){
		if (deleteUnitList[i] != null){
			game_map.deleteUnit(deleteUnitList[i]);
		}
	}
};
// -------------------End Of Projectile-------------------

// -------------------Map-------------------
// Update Client Side Block
const clientUpdateBlocks = (blockList) => {
	game_map.spawnBlocks(blockList[0]);
};
// -------------------End Of Map-------------------

// -------------------Sending And Receiving Information-------------------
(() => {
	// When Connected To Server, Create A Sock (MySelf)
	const sock = io();

	// Sending Information To Server Only Once
	// First Parameter Is The Tag, Second Parameter Is What We Send To The Server
	sock.compress(true).emit('newName', sessionStorage.getItem("playerInitialName"));
	sock.compress(true).emit('serverNewItem', 0, itemDefaultPosition);

	// Receiving Information From Server
	// First Parameter Is The Tag, Second Parameter Is The Event/Function To Operate On Information From Server
	sock.on('initSelf', initSelf);
	sock.on('newPlayer', newPlayer);
	sock.on('clientPos', playerPositionUpdate);
	sock.on('clientDisconnect', playerDisconnect);
	sock.on('playerInfoChange', playerInfoChange);

	sock.on('addBlocks', clientUpdateBlocks);

	sock.on('clientPlayerItemArray', playerItemArrayUpdate);
	sock.on('initItem', initItem);
	sock.on('clientNewItem', newItem);
	sock.on('removeItem', deleteItem);

	sock.on('connect_error', connectionError);
	
	// Projectile Related
	sock.on('spawnProjectile', spawnProjectile);

	// Update Frame
	sock.on('updateFrame', updateFrame);
	sock.on('deleteEvent', deleteEvent);

	// Sending My New Position To Server
	const updatePosition = () => {
		// Return The Player's Accurate Position To The Server As A Tuple
		sock.compress(true).emit('newPos', [player_controller.creature.object.position.x,
							player_controller.creature.object.position.y,
							player_controller.creature.object.position.z]);
	};
	
	// Sending New Item List To Server
	const updateItem = () => {
		sock.compress(true).emit('newPlayerItemArray', additionalItemID, clientPlayerID);
	}
	// Removing A Collectable Item
	const removeItem = () => {
		sock.compress(true).emit('deleteItem', removeItemID);
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
			sock.compress(true).emit('requireBlock', blockPosList);
		}
	};
	document.addEventListener('updateBlock', updateBlock);

	// Projectile Related
	const createProjectile = () => {
		sock.compress(true).emit('newProjectile', newProjectileList);
		newProjectileList = [];
	}
	document.addEventListener('createProjectile', createProjectile);

	// Frame Related
	const frameUpdate = () => {
		sock.compress(true).emit('clientFrame', onHitProjectileList);
	}
	document.addEventListener('frameEvent', frameUpdate);


	// Player Information Related
	const playerInfo = () => {
		sock.compress(true).emit('playerInfo', changingPlayerInfo);
		changingPlayerInfo = [];
	}
	document.addEventListener('changingPlayerInfo', playerInfo);
})();