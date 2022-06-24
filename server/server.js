// SHA256
// KEY: kodiaks
// Hashed Value: 28713e0f7e8b977dcd866fcf8686d1242413e661162e68c0a02d9084b90d4a53

// CommonJS Syntax
// Hyper Text Transfer Protocol (HTTP)
// Setting Socket Related Modules
const http = require('http');
const express = require('express');
const socketio = require('socket.io');


const map = require('./mapClass.js');
//const quarterMap = require('./quarterMap.js');
//const block = require('./block.js');

// An Express Function
const app = express();
// Current Directory, Back One Level, Client Folder
app.use(express.static(`${__dirname}/../client`));

// Create An Server Instance
const server = http.createServer(app);
const io = socketio(server);

// Game Related Variable Declaration
var playerArray = [];
playerArray.length = 32;

// ID Of Player
var ID_count = 0;

// find a spawn place without collision
function createSpawnPosition() {
	let posX, posY;
	while (1){
		posX = Math.floor((Math.random() * 2 - 1) * game_map.quarterSize2D.x * game_map.blockSize2D.x);
		posY = Math.floor((Math.random() * 2 - 1) * game_map.quarterSize2D.y * game_map.blockSize2D.y);
		let unit = game_map.getUnit([posX, posY]);
		if ( unit != null && !(game_map.unitIDList[unit.ID].collision)){
			break;
		}
	}
	return [posX, posY];
}

// Function Used To Create A New Player Using Two Parameters
const CreateNewPlayer = (playerID, playerName, spawnPos) => {
	// Similar To A Struct


	let playerInfo  = {
		ID: playerID,
		name: playerName,
		position: [spawnPos[0], spawnPos[1], 1],
		// Player Properties
		// Defensive Properties
		health: 100,
		armor: 0,

		// Attack Properties
		attackDamage: 10,
		attackSpeed: 1,

		// Item Array
		playerItemArray: {
            "Blood Orb" : 0,
			"Attack Orb" : 0
        }
	};

	// Indexing Player Array To Include The New Player
	playerArray[playerID] = playerInfo;

	// Log The PlayerInfo On The Server Side
	console.log(playerInfo);
	return playerInfo;
};

// Pos Is An Array Of Size 3 (XYZ)
const UpdatePlayerPosition = (Pos, playerID) => {
	if (playerArray[playerID] != null) {
		playerArray[playerID].position = Pos;
	}
	return [Pos, playerID];
};

// Increment Player Item Array
const UpdatePlayerItemArray = (additionalItem, updatePlayerID) => {
	if (playerArray[updatePlayerID] != null) {
		playerArray[updatePlayerID].playerItemArray[additionalItem.name]++;
	}

	// Player Property Update
	// Defensive Property Update
	if (additionalItem.buffType == "Defensive") {
		playerArray[updatePlayerID].health += additionalItem.health;
		console.log(playerArray[updatePlayerID].health);
	}

	return additionalItem;
}

// Get A New Player ID From The Empty Space In PlayArray
function newPlayerID(){
	let exceedCount = 0;
	// Stop Untill Get An playerID Corresponding To An Empty Space In PlayArray
	while (playerArray[ID_count] != null){
		ID_count = (ID_count + 1) % playerArray.length;
		exceedCount++;
		if (exceedCount >= playerArray.length){// If Exceed Max playerArray Length
			playerArray.length *= 2;
			console.log("exceed max playArray length, double the playArray length!");
		}
	}
	return ID_count;
}

// When Client Is Disconnected
const clientDisconnect = (Info, playerID) => {
	if (playerArray[playerID] != null){
		console.log("Player ID:", playerID, " Name:", playerArray[playerID].name, "is disconnected!  Info:", Info);
		playerArray[playerID] = null;
	}
	return playerID
};

// Item Related Variable Declaration
var itemArray = [];
itemArray.length = 256;
var newItemID;

// Function Used To Create A New Item
const CreateNewItem = (itemName) => {
	// Similar To A Struct
	let itemInfo = {
		itemName: itemName,
		itemRarity: "Common",
		itemStackType: "Linear",
		itemBuffType: "Defensive",
		itemPosition: [1, 1, 1]
	};

	// Indexing Item Array To Include The New Item
	for (let itemIndex = 0; itemIndex < itemArray.length; itemIndex++) {
		if (itemArray[itemIndex] == null) {
			// Save The Item Into The Item Array
			itemArray[itemIndex] = itemInfo;
			newItemID = itemIndex;
			
			// Log The ItemInfo On The Server Side
			console.log(itemInfo, newItemID);
			break;
		}
	}
	
	// Return itemInfo
	return itemInfo;
};

// When Client Is Disconnected
const deleteItem = (itemIndex) => {
	if (itemArray[itemIndex] != null){
		console.log("Deleting Item ", itemIndex);
		itemArray[itemIndex] = null;
	}
	return itemIndex;
};

// Randomly Spawn An Item Every Ten Second
setInterval(randomSpawnItem, 10000);
function randomSpawnItem() {
	io.emit('clientNewItem', CreateNewItem("Blood Orb"), newItemID);
}

// Map Related Function
function getPlayerMapPos2D(playerID){
	let pos = [0, 0];
	if (playerArray[playerID] != null) {
		pos = [Math.floor(playerArray[playerID].position[0]), Math.floor(playerArray[playerID].position[1])];
	}
	return pos;
}

// Projectile Related
var projectileList = [];
function spawnProjectile(projectileInfo){
	for (let i = 0; i < projectileInfo.length; i++){
		console.log(projectileInfo[i]);
		projectileList.push(projectileInfo[i]);
	}
	return projectileInfo;
}

// -----------Map-------------
// Setting The Size Of The Map
var game_map = new map([12, 12],[20, 20]);

// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	const playerID = newPlayerID(ID_count);

	const spawnPos = createSpawnPosition();
	// Initializing The Player To The Client
	sock.emit('initSelf', playerID, playerArray, game_map.getInitMap(spawnPos, [1, 1]), projectileList);
	console.log("new player joined, ID: ", playerID);

	// Initializing Collectable Item To The Client
	sock.emit('initItem', itemArray);
	
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	// Player Related
	sock.on('newName', (playerName) => io.emit('newPlayer', CreateNewPlayer(playerID, playerName, spawnPos), playerArray.length));
	sock.on('newPos', (Pos) => io.emit('clientPos', UpdatePlayerPosition(Pos, playerID)));
	sock.on('disconnect', (Info) => io.emit('clientDisconnect', clientDisconnect(Info, playerID)));
	sock.on('requireBlock', (blockPosList) => sock.emit('addBlocks', game_map.getUpdateBlock(blockPosList)));

	// Item Related
	sock.on('newPlayerItemArray', (additionalItem, updatePlayerID) => io.emit('clientPlayerItemArray', UpdatePlayerItemArray(additionalItem, updatePlayerID), updatePlayerID));
	sock.on('serverNewItem', (itemName) => io.emit('clientNewItem', CreateNewItem(itemName), newItemID));
	sock.on('deleteItem', (itemIndex) => io.emit('removeItem', deleteItem(itemIndex)));

	// Projectile Related
	sock.on('newProjectile', (projectileInfo) => io.emit('spawnProjectile', spawnProjectile(projectileInfo)));
});

// Whenever An Error Occur, Log The Error
server.on('error', (err) => {
  	console.error(err);
});

// Cannot Use 3000 As It Creates A New HTTP Server
// Listening To Requests From The Port 8080
server.listen(8080, () => {
  	console.log('server is ready');
});
