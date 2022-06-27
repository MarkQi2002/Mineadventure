// SHA256
// KEY: kodiaks
// Hashed Value: 28713e0f7e8b977dcd866fcf8686d1242413e661162e68c0a02d9084b90d4a53

// Unlocked Command
// unlock: To Unlock The Locked Command
// location: Return Current Player Location On Console

// Locked Command
// tp __ __: Teleport To Certain XY Location On Map
// tpa __: Teleport To Certain Player By Player ID
// tpn __: Teleport To Certain Player By Player Name

// CommonJS Syntax
// Hyper Text Transfer Protocol (HTTP)
// Setting Socket Related Modules
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

// Map Related Setting
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
			console.log("Exceed max playArray length, double the playArray length! current length:", playerArray.length);
		}
	}
	return ID_count;sda
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
function getNewProjectileID(){
	let exceedCount = 0;
	// Stop Untill Get An Projectile ID Corresponding To An Empty Space In Projectile List
	while (projectileList[projectile_count] != null){
		projectile_count = (projectile_count + 1) % projectileList.length;
		exceedCount++;
		if (exceedCount >= projectileList.length){// If Exceed Max projectileList Length
			projectileList.length += 100;
			console.log("Exceed max projectileList length, double the projectileList length! current length:", projectileList.length);
		}
	}
	return  projectile_count;
}

// Projectile Related Variable Declaration
var projectile_count = 0;
var projectileList = [];
projectileList.length = 1000;

// Spawning New Projectiles
function spawnProjectile(projectileInfo){
	let projectileSpawnInfo = [];
	for (let i = 0; i < projectileInfo.length; i++){
		let newProjectileID = getNewProjectileID()
		projectileList[newProjectileID] = projectileInfo[i];
		projectileSpawnInfo.push([newProjectileID, projectileInfo[i]])
	}
	return projectileSpawnInfo;
}

// Initializing Player Projectile
function initPlayerProjectile(projectileInfo){
	let projectileSpawnInfo = [];
	for (let i = 0; i < projectileInfo.length; i++){
		projectileSpawnInfo.push([i, projectileInfo[i]])
	}
	return projectileSpawnInfo;
}

// Variable Declaration For Updating Projectiles
var updateProjectileList = [];
var delta = 15;
setInterval(updateProjectile, delta);

let startDate = new Date();
let endDate = new Date();

// Update All Projectiles
function updateProjectile(){
	updateProjectileList.length = projectileList.length;

	let deleteProjectileList = [];
	let deleteUnitList = [];
	let projectilePos;

	endDate = new Date();

	let diff = (endDate.getTime() - startDate.getTime()) / 1000;

	for (let i = 0; i < projectileList.length; i++){
		if (projectileList[i] != null){
			projectileList[i].position[0] += projectileList[i].initVelocity[0] * diff;
			projectileList[i].position[1] += projectileList[i].initVelocity[1] * diff;
			projectilePos = [
				projectileList[i].position[0],
				projectileList[i].position[1]
			];
			updateProjectileList[i] = projectilePos;
			
			let newPos = [Math.floor(projectileList[i].position[0] + 0.5), Math.floor(projectileList[i].position[1] + 0.5)];
			let unit = game_map.getUnit(newPos);
			
			if (unit == null){
				// for delete projectile
				projectileList[i] = null;
				updateProjectileList[i] = null;
				deleteProjectileList.push(i);

				
			}else{
				if (game_map.unitIDList[unit.ID].collision == true){
					
					// for delete unit
					let isNotIn = true;
					for (let ii = 0; ii < deleteUnitList.length; ii++){
						if (deleteUnitList[ii][0][0] == newPos[0] && deleteUnitList[ii][0][1] == newPos[1]){
							isNotIn == false;
						}
					}

					// check is the unit is already hit
					if (isNotIn){
						// for delete projectile
						projectileList[i] = null;
						updateProjectileList[i] = null;
						deleteProjectileList.push(i);

						let newID = 0;
						unit.ID = newID;
						unit.Height = 0;
						deleteUnitList.push([newPos, unit]);
					}
				}
			}
		}
		
	}
	
	if (deleteProjectileList.length > 0){
		console.log(deleteProjectileList);
		io.emit('deleteEvent', [deleteProjectileList, deleteUnitList]);
	}

	startDate = new Date();
	
	
}

// Update Client Frame
function ClientFrameUpdate(){
	return [updateProjectileList];
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
	sock.compress(true).emit('initSelf', playerID, playerArray, game_map.getInitMap(spawnPos, [1, 1]), initPlayerProjectile(projectileList));
	console.log("new player joined, ID: ", playerID);

	// Initializing Collectable Item To The Client
	sock.compress(true).emit('initItem', itemArray);
	
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	// Player Related
	sock.on('newName', (playerName) => io.compress(true).emit('newPlayer', CreateNewPlayer(playerID, playerName, spawnPos), playerArray.length));
	sock.on('newPos', (Pos) => io.compress(true).emit('clientPos', UpdatePlayerPosition(Pos, playerID)));
	sock.on('disconnect', (Info) => io.compress(true).emit('clientDisconnect', clientDisconnect(Info, playerID)));
	sock.on('requireBlock', (blockPosList) => sock.compress(true).emit('addBlocks', game_map.getUpdateBlock(blockPosList)));

	// Item Related
	sock.on('newPlayerItemArray', (additionalItem, updatePlayerID) => io.compress(true).emit('clientPlayerItemArray', UpdatePlayerItemArray(additionalItem, updatePlayerID), updatePlayerID));
	sock.on('serverNewItem', (itemName) => io.compress(true).emit('clientNewItem', CreateNewItem(itemName), newItemID));
	sock.on('deleteItem', (itemIndex) => io.compress(true).emit('removeItem', deleteItem(itemIndex)));

	// Projectile Related
	sock.on('newProjectile', (projectileInfo) => io.compress(true).emit('spawnProjectile', spawnProjectile(projectileInfo)));

	// Client Frame Update
	sock.on('clientFrame', (e) => sock.compress(true).emit('updateFrame', ClientFrameUpdate()));
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
