// Initialization Every Player Before You Enter The Game
const initSelf = (data) => {
	clientPlayerID = data.thePlayer.playerID;
	mapIndex = data.mapIndex;
	defaultProperties = data.defaultProperties;
	
	// Input Control
	if (game_map != null){

	} else {
		unitProperties = data.unitProperties;
		unitPropertyNumber = 0;
		for (let [key, value] of Object.entries(unitProperties)) {
			++unitPropertyNumber;
		}

		// Create New Map
		game_map = new map(data);
	}

};

function afterMapEvent (data){
	let new_player = new player(data.thePlayer);
	new messageUI("System", new_player.name + " joined the game.", "yellow");

	// Setting The Controller To The Player When First Enter
	player_controller = new controller(new_player, camera);

	// Display Infomration On UI
	initUI();
	displayAllUI();

	// Animate The Player
	animate();

	// thread event
	//intervalWorker.onmessage = updateTimeEvent;
}


 

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
	if (updatePlayerID == clientPlayerID) appendItemUIArray(itemInfoArray[additionalItemID].itemName);

	// Return The Additional Item's ID
	return additionalItemID;
}

// Initialization Myself And All Future Players
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnItem(itemID, itemPosition, itemIndex){
	if (itemIndex >= itemArray.length){
		itemArray.length = itemIndex + 1;
	}

	// Creating Item Object
	var new_item = new item(itemInfoArray[itemID], itemPosition);
	
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



var lastDisplayObjectList = [];
var lastDisplayCreatureList = [];
const updateFrame = (
	newObjectList,
	displayObjectList,
	) => {

	let theObject;

	// Spawn Creature
	for (let i = 0; i < newObjectList.length; ++i){
		switch(newObjectList[i].objectType){
			case "projectile":
				new projectile(newObjectList[i]);
				break;
			case "player":
				new player(newObjectList[i]);
				break;
		}
	}
	

	// Displayer Creature
	for (let i = 0; i < lastDisplayObjectList.length; ++i){
		if (objectList[lastDisplayObjectList[i]] != null){
			objectList[lastDisplayObjectList[i]].object.visible = false;
		}
	}

	lastDisplayObjectList = [];
	lastDisplayCreatureList = [];
	for (let i = 0; i < displayObjectList.length; ++i){
		theObject = objectList[displayObjectList[i][0]];
		if (theObject != null){
			theObject.changePosition(displayObjectList[i][1]);
			lastDisplayObjectList.push(displayObjectList[i][0]);
			if (["player", "AI"].includes(theObject.objectType)) lastDisplayCreatureList.push(displayObjectList[i][0]);
			theObject.object.visible = true;
		}else{
			requestObjectList.push(displayObjectList[i][0]);
		}
	}




	// Data Is Updated
	updateFrameSwitch = true;
};


function sendFrameData(){
	sock.compress(true).emit('clientFrame',
		player_controller.creature.getPositionArray(),
		sendProjectileList,
		requestObjectList
	);
	sendProjectileList = [];
	requestObjectList = [];
}

const updateMap = (
	unitModifiedList,
	projectileRemoveList
	) => {

	let i, j, theUnit;
	// Update Unit
	for (i = 0; i < unitModifiedList.length; ++i){
		theUnit = game_map.getUnit([unitModifiedList[i][0], unitModifiedList[i][1]]);
        if (theUnit == null) continue;
		for (j = 0; j < unitModifiedList[i][2].length; ++j){
			theUnit[unitModifiedList[i][2][j][0]] = unitModifiedList[i][2][j][1];// Change Unit Property
		}

		

		if (theUnit.mesh != null){
			game_map.object.remove(theUnit.mesh);
            theUnit.mesh = null;

			game_map.spawnUnit(theUnit);
		}

	}

	let theProjectile;
	for (i = 0; i < projectileRemoveList.length; ++i){
		theProjectile = objectList[projectileRemoveList[i]];;
        if (theProjectile == null) continue;
		theProjectile.remove();
		objectList[projectileRemoveList[i]]
	}
	
};

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
		objectList[playerArray[PlayerID].ID] = null;
		playerArray[PlayerID].remove();
	}
};
// -------------------End Of Connection Exception Related-------------------


// -------------------Message-------------------
const newServerMessage = (name, text, color) => {
	new messageUI(name, text, color);
};

// -------------------End Of Message-------------------





const commandFromServer = (theCommand) => {
	switch (theCommand[0]){
		case "changePlayerPos":
			player_controller.creature.changePosition(theCommand[1]);
			new messageUI("System", "Successfully changed player position!", "green");
			return;
		case "radius":
			player_controller.creature.setRadius(theCommand[1]);
			new messageUI("System", "Successfully changed the radius!", "green");
			return;

	}
};












var sock;
// -------------------Sending And Receiving Information-------------------
(() => {
	// When Connected To Server, Create A Sock (MySelf)
	sock = io();
	sock.compress(true).emit('newName', sessionStorage.getItem("playerInitialName"));

	// Connection
	sock.on('connect_error', connectionError);
	
	// Sending Information To Server Only Once
	// First Parameter Is The Tag, Second Parameter Is What We Send To The Server
	// Receiving Information From Server
	// First Parameter Is The Tag, Second Parameter Is The Event/Function To Operate On Information From Server
	sock.on('initSelf', initSelf);
	sock.on('clientDisconnect', playerDisconnect);

	
	// Update Frame
	sock.on('updateFrame', updateFrame);
	sock.on('updateMap', updateMap);
	//sock.on('deleteEvent', deleteEvent);

/*
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

	
	// Creature Information Related
	const creatureInfo = () => {
		sock.compress(true).emit('creatureInfo', changingCreatureInfo);
		changingCreatureInfo = [];
	}
	document.addEventListener('changingCreatureInfo', creatureInfo);

	*/


	
	// New Server Message
	sock.on('serverMessage', newServerMessage);

	// Run Command From Server
	sock.on('commandFromServer', commandFromServer);



})();