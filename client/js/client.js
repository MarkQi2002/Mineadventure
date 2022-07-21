// -------------------Player-------------------
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnPlayer(playerInfo){
	let new_player = new player(playerInfo);

	playerArray[playerInfo.ID] = new_player;
	return new_player;
}

// Initialization Every Player Before You Enter The Game
const initSelf = (severPlayerID, serverPlayerArray, playerArrayLength, serverMap,
				  serverProjectileList, serverMonsterArray, monsterArrayLength, initMapLevel,
				  serverItemArray, serverItemInfoArray) => {
	

	gameMapLevel = initMapLevel;

	if (game_map != null){
		
		//Delete Old Player
		for (let i = 0; i < playerArray.length; ++i) {
			if (playerArray[i] != null && i != clientPlayerID){
				playerArray[i].delete();
				playerArray[i] = null;
			}
		}
	
		//Delete Old Monster
		for (let i = 0; i < monsterArray.length; ++i) {
			deleteMonster(i);
		}
	
		//Delete Old Projectile
		for (let i = 0; i < projectileList.length; ++i) {
			if (projectileList[i] != null){
				projectileList[i].delete();
				projectileList[i] = null;
			}
		}
		
		//Delete Old item
		for (let i = 0; i < itemArray.length; ++i) {
			removeItem(i);
		}




		game_map.loadNewMapLevel(serverMap); 
	}else{
		// Create New Map
		game_map = new map(serverMap);
	}


	clientPlayerID = severPlayerID;
	if (playerArray.length < playerArrayLength){
		playerArray.length = playerArrayLength;
	}
	for (let i = 0; i < serverPlayerArray.length; ++i) {
		if (serverPlayerArray[i] != null){
			spawnPlayer(serverPlayerArray[i]);
		}
	}

	spawnProjectile(serverProjectileList);

	if (monsterArray.length < monsterArrayLength){
		monsterArray.length = monsterArrayLength;
	}
	for (let i = 0; i < serverMonsterArray.length; ++i) {
		if (serverMonsterArray[i] != null){
			spawnMonster(serverMonsterArray[i]);
		}
	}

	initItem(serverItemArray, serverItemInfoArray);

	
};

// Initialization Myself And All Future Players
const newPlayer = (playerInfo, playerArrayLength) => {
	if (playerArray.length < playerArrayLength){
		playerArray.length = playerArrayLength;
	}
	let new_player = spawnPlayer(playerInfo);
	// Setting The Controller To The Player When First Enter
	if (playerInfo.ID == clientPlayerID){
		player_controller = new controller(new_player, camera);

		// Display Infomration On UI
		initUI();
		displayAllUI();

		// Animate The Player
		animate();

		// thread event
		
		intervalWorker.onmessage = updateTimeEvent;

	}
	new messageUI("System", playerInfo.name + " joined the game.", "yellow");
};

// Update Every Player's Position
const playerPositionUpdate = ([Pos, PlayerID]) => {
	if (PlayerID != clientPlayerID){
		playerArray[PlayerID].object.position.set(Pos[0], Pos[1], Pos[2]);
	}
};

// Send Creature Property Change To Server And Change At All Other Client
function sendCreaturePropertyChange([creatureType, id], propertyList){
	let isIn = false;
	for (let i; i < changingCreatureInfo.length; i++){
		if (changingCreatureInfo[i][0][0] == creatureType && changingCreatureInfo[i][0][1] == id){
			isIn = true;
			for ([key, value] of Object.entries(propertyList)) {
				changingCreatureInfo[i][1][key] = value;
			}
			break;
		}
	}

	if (!isIn) changingCreatureInfo.push([[creatureType, id], propertyList]);
}

// Change An Creature's Property Using Input creatureInfo
const creatureInfoChange = (creatureInfo) => {
	// Example creatureInfo = [[creatureType, id], {"health": ["+", 10], "attackSpeed": ["=", 1], ...}]
	let updateTopLeftUI = false;
	// Loop Through creatureInfo
	for (let i = 0; i < creatureInfo.length; i++){
		let theCreature;
		let updateLocalPlayerUI = false;
		// Check If Target Is Player Or Monster
		if (creatureInfo[i][0][0] == "player") {
			if (playerArray[creatureInfo[i][0][1]] == null) continue;
			theCreature = playerArray[creatureInfo[i][0][1]];
			if (creatureInfo[i][0][1] == clientPlayerID) updateLocalPlayerUI = true;
		} else {
			if (monsterArray[creatureInfo[i][0][1]] == null) continue;
			theCreature = monsterArray[creatureInfo[i][0][1]];
		}
		
		// Loop Through Properties Update
		for (let [key, value] of Object.entries(creatureInfo[i][1])) {
			if (key == "damage"){
				createDamageTextList(value, theCreature);
			} else {
				let setValue = value[1];
				if (value[0] == "+") setValue = theCreature.properties[key] + value[1];
				else if (value[0] == "-") setValue = theCreature.properties[key] - value[1];
				else if (value[0] == "*") setValue = theCreature.properties[key] * value[1];
				else if (value[0] == "/") setValue = theCreature.properties[key] / value[1];

				if (key == "health"){
					theCreature.setHealth(setValue);
					if (updateLocalPlayerUI) updateTopLeftUI = true;
				} else if (key == "maxHealth") {
					theCreature.setMaxHealth(setValue);
					if (updateLocalPlayerUI) updateTopLeftUI = true;
				} else if (key == "level") {
					theCreature.setLevel(setValue);
					if (updateLocalPlayerUI) updateTopLeftUI = true;
				} else {
					theCreature.properties[key] = setValue;
				}

				if (updateLocalPlayerUI) {
					displayCreatureProperty(key);
				}
			}
		}
	}

	if (updateTopLeftUI) {
		displayPlayerHealth();
	}

};

// Creating Damage Text List
function createDamageTextList(damageInfo, theCreature){
	if (player_controller == null) return;
	if (Math.abs(theCreature.object.position.x - player_controller.camera.position.x) + Math.abs(theCreature.object.position.y - player_controller.camera.position.y) < game_map.blockSize.x + game_map.blockSize.y){
		for (let [key, value] of Object.entries(damageInfo.type)) {
			new damageText(key, value, [theCreature.object.position.x , theCreature.object.position.y, theCreature.object.position.z]);
		}
	}

}
// -------------------End Of Player-------------------

// -------------------Monster-------------------
var monsterArray = [];
monsterArray.length = 100;

// Function Used To Spawn A Monster
function spawnMonster(monsterInfo){
	let new_monster = new monster(monsterInfo);
	monsterArray[monsterInfo.ID] = new_monster;
	return new_monster;
}

// Initialization Monster
const newMonster = (monsterInfo, monsterArrayLength) => {
	if (monsterArray.length < monsterArrayLength){
		monsterArray.length = monsterArrayLength;
	}
	
	spawnMonster(monsterInfo);
}

// Delete Monster
const deleteMonster = (monsterID) => {
	if (monsterArray[monsterID] != null){
		monsterArray[monsterID].delete();
		monsterArray[monsterID] = null;
	}
}
// -------------------End Of Monster-------------------

// -------------------Item-------------------
// Variable Declaration
var additionalItemID;
var removeItemID;
var itemArray = [];
var itemInfoArray;
var itemLoader;
var damageTextList = [];

// Update Player Property And Player Item Array
const creatureItemArrayUpdate = (additionalItemID, updatePlayerID, removeItemID) => {
	// Remove Item From The Item Array
	if (removeItemID >= 0 && removeItemID < itemArray.length) removeItem(removeItemID);

	// Update Server Side Player Item Array
	if (playerArray[updatePlayerID].creatureItemArray[additionalItemID] != null)
		playerArray[updatePlayerID].creatureItemArray[additionalItemID]++;
	else
		playerArray[updatePlayerID].creatureItemArray[additionalItemID] = 1;

	// Update Item UI
	if (updatePlayerID == clientPlayerID) appendItemUIArray(itemInfoArray[additionalItemID][0].itemName);

	// Return The Additional Item's ID
	return additionalItemID;
}

// Initialization Myself And All Future Players
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnItem(itemID, itemPosition, itemIndex){
	if (itemIndex >= itemArray.length){
		itemArray.length = itemIndex + 1;
	}

	// Creating Passive Item Object
	var new_item = new passiveItem(itemInfoArray[itemID][0], itemPosition, itemInfoArray[itemID][1]);
	
	// Storing Passive Item Object Into itemArray
	itemArray[itemIndex] = new_item;
	console.log("Spawning", itemInfoArray[itemID], " At ItemIndex: ", itemIndex);

	// Return The New Item Object
	return new_item;
}

// Initialization Every Item Before You Enter The Game
const initItem = (serverItemArray, serverItemInfoArray) => {
	// Copy The Sever Item Info Array To Client Item Info Array (The Two Array Are The Same)
	itemInfoArray = serverItemInfoArray;
	itemLoader = {
		geometry: new THREE.PlaneGeometry(0.6, 0.6),
		material: loadItemMaterials()
	};

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

// Deleting An Item When Server Send A Request
const deleteItem = (itemIndex) => {
	removeItem(itemIndex);
}

// Removing An Item When Server Send A Request
function removeItem(itemIndex) {
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
		new messageUI("System", playerArray[PlayerID].name + " left the game.", "yellow");
		playerArray[PlayerID].delete();
		playerArray[PlayerID] = null;
	}
};
// -------------------End Of Connection Exception Related-------------------

// -------------------Projectile-------------------
// Spawning Projectile
const spawnProjectile = (projectileInfo) => {
	for (let i = 0; i < projectileInfo.length; i++){
		if (projectileInfo[i] != null && projectileInfo[i][1] != null && projectileInfo[i][1] != "deletion"){
			var newProjectile = new projectile(projectileInfo[i][1]);
			if (projectileList.length <= projectileInfo[i][0]){
				projectileList.length = projectileInfo[i][0] + 1;
			}
			projectileList[projectileInfo[i][0]] = newProjectile;
		}
	}
};

// Update Frame
const updateFrame = ([projectilePosList, monsterPosList]) => {
	let projectileID;
	for (let i = 0; i < projectilePosList.length; i++){
		projectileID = projectilePosList[i][0];
		if (projectileList[projectileID] != null){
			projectileList[projectileID].positionChange(projectilePosList[i][1]);
		}
	}

	let theMonster;
	for (let i = 0; i < monsterPosList.length; i++){
		theMonster = monsterArray[monsterPosList[i][1]];
		if (theMonster != null){
			theMonster.object.position.set(monsterPosList[i][0][0], monsterPosList[i][0][1], monsterPosList[i][0][2]); 
			theMonster.update();
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

// -------------------Message-------------------
const newServerMessage = ([name, newMessageFromServer]) => {
	new messageUI(name, newMessageFromServer, "white");
};

// -------------------End Of Message-------------------

// -------------------Map-------------------
// Update Client Side Block
const clientUpdateBlocks = (blockList) => {
	game_map.spawnBlocks(blockList[0]);
};
// -------------------End Of Map-------------------


var sock;
// -------------------Sending And Receiving Information-------------------
(() => {
	// When Connected To Server, Create A Sock (MySelf)
	sock = io();

	// Sending Information To Server Only Once
	// First Parameter Is The Tag, Second Parameter Is What We Send To The Server
	// Receiving Information From Server
	// First Parameter Is The Tag, Second Parameter Is The Event/Function To Operate On Information From Server
	sock.on('initSelf', initSelf);
	sock.on('newPlayer', newPlayer);
	sock.on('clientPos', playerPositionUpdate);
	sock.on('clientDisconnect', playerDisconnect);

	// Monster
	sock.on('newMonster', newMonster);
	sock.on('deleteMonster', deleteMonster);

	// Creature
	sock.on('creatureInfoChange', creatureInfoChange);

	// Map
	sock.on('addBlocks', clientUpdateBlocks);

	// Item
	sock.on('clientCreatureItemArray', creatureItemArrayUpdate);
	sock.on('clientNewItem', newItem);
	sock.on('removeItem', deleteItem);

	// Connection
	sock.on('connect_error', connectionError);
	
	// Projectile Related
	sock.on('spawnProjectile', spawnProjectile);

	// Update Frame
	sock.on('updateFrame', updateFrame);
	sock.on('deleteEvent', deleteEvent);

	// New Server Message
	sock.on('serverMessage', newServerMessage);

	// Sending My New Position To Server
	const updatePosition = () => {
		// Return The Player's Accurate Position To The Server As A Tuple
		sock.compress(true).emit('newPos', [player_controller.creature.object.position.x,
							player_controller.creature.object.position.y,
							player_controller.creature.object.position.z]);
	};
	
	// Sending New Item List To Server
	const updateItem = () => {
		sock.compress(true).emit('serverCreatureItemArray', additionalItemID, clientPlayerID, removeItemID);
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
		sock.compress(true).emit('newProjectile', [newProjectileList, gameMapLevel]);
		newProjectileList = [];
	}
	document.addEventListener('createProjectile', createProjectile);

	// Frame Related
	const frameUpdate = () => {
		sock.compress(true).emit('clientFrame', null);
	}
	document.addEventListener('frameEvent', frameUpdate);


	// Creature Information Related
	const creatureInfo = () => {
		sock.compress(true).emit('creatureInfo', changingCreatureInfo);
		changingCreatureInfo = [];
	}
	document.addEventListener('changingCreatureInfo', creatureInfo);

	// Send A Message To Server
	const SendClientMessage = () => {
		sock.compress(true).emit('newMessage', sendingMessage);
	}
	document.addEventListener('sendMessage', SendClientMessage);

	// Send A Command To Server
	const sendCommand = () => {
		sock.compress(true).emit('newCommand', sendingCommand);
	}
	document.addEventListener('sendCommand', sendCommand);
})();