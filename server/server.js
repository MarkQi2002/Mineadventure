// SHA256
// KEY: kodiaks
// Hashed Value: 28713e0f7e8b977dcd866fcf8686d1242413e661162e68c0a02d9084b90d4a53

// CommonJS Syntax
// Hyper Text Transfer Protocol (HTTP)
// Setting Socket Related Modules
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

// Map Related Setting
const map = require('./mapClass.js');
const e = require('express');
//const quarterMap = require('./quarterMap.js');
//const block = require('./block.js');

// An Express Function
const app = express();

// Current Directory, Back One Level, Client Folder
app.use(express.static(`${__dirname}/../client`));

// Create An Server Instance
const server = http.createServer(app);
const io = socketio(server);


// -------------------Player-------------------
// Game Related Variable Declaration
var playerArray = [];
playerArray.length = 32;

// ID Of Player
var ID_count = 0;

// find a spawn place without collision
function createSpawnPosition() {
	let posX, posY;
	while (1) {
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
		properties: {
			// Defensive Properties
			"health": 100,
			"maxHealth": 100,
			"armor": 0,

			// Attack Properties
			"attackDamage": 10,
			"attackSpeed": 1,
		},

		// Server Side Player Item Array
		playerItemArray: {}
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

// Get A New Player ID From The Empty Space In PlayArray
function newPlayerID(){
	let exceedCount = 0;
	// Stop Untill Get An playerID Corresponding To An Empty Space In PlayArray
	while (playerArray[ID_count] != null){
		ID_count = (ID_count + 1) % playerArray.length;
		exceedCount++;
		if (exceedCount >= playerArray.length){// If Exceed Max playerArray Length
			playerArray.length += 32;
			console.log("Exceed Max PlayArray Length, Double The PlayArray Length! Current Length:", playerArray.length);
		}
	}
	return ID_count;
}
// -------------------End Of Player-------------------

// -------------------Item-------------------
// Item Related Variable Declaration
var newItemIndex;
var currentItemIndex = 0;
var itemArray = [];
itemArray.length = 256;

// itemInfoArray Is A 2D Array
// First Layer: Item ID (Currently 20 Items)
// Second Layer: itemInfo, itemPosition, propertyInfo
var itemDefaultPosition = [1, 1, 1];
var itemInfoArray = [[{"itemID": 0, "itemName": "Blood Orb", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"maxHealth": ["+", 20]}],
					[{"itemID": 1, "itemName": "Attack Orb", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Offensive"}, {"attackDamage": ["+", 10]}],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[],
					[]];

// Update Player Property And Player Item Array
const playerItemArrayUpdate = (additionalItemID, updatePlayerID, removeItemID) => {
	// Remove Item From The Item Array
	if (removeItemID >= 0 && removeItemID < itemArray.length) removeItem(removeItemID)

	// Update Player Property Based On Item
	let playerInfo = [[updatePlayerID, itemInfoArray[additionalItemID][1]]];
	playerInfoChange(playerInfo);

	// Update Server Side Player Item Array
	if (playerArray[updatePlayerID].playerItemArray[additionalItemID] != null)
		playerArray[updatePlayerID].playerItemArray[additionalItemID]++;
	else
		playerArray[updatePlayerID].playerItemArray[additionalItemID] = 1;

	// Return The Additional Item's ID
	return additionalItemID;
}

// Creating An Item When Client Send A Request
const newItem = (newItemID, newItemPosition) => {
	// Indexing Item Array To Include The New Item
	for (let itemIndex = currentItemIndex; itemIndex < itemArray.length; itemIndex++) {
		if (itemArray[itemIndex] == null) {
			// Set New Current Item Index
			currentItemIndex = itemIndex;

			// Save The ItemID Into The Server Item Array
			newItemIndex = itemIndex;
			itemArray[itemIndex] = {"itemID": newItemID, "itemPosition": newItemPosition};
			
			// Log The ItemInfo On The Server Side
			console.log(itemInfoArray[newItemID], newItemIndex);
			
			// Return newItemID
			return newItemID;
		}
	}
	
	// Indexing Item Array To Include The New Item
	for (let itemIndex = 0; itemIndex < currentItemIndex; itemIndex++) {
		if (itemArray[itemIndex] == null) {
			// Set New Current Item Index
			currentItemIndex = itemIndex;

			// Save The ItemID Into The Server Item Array
			newItemIndex = itemIndex;
			itemArray[itemIndex] = {"itemID": newItemID, "itemPosition": newItemPosition};
			
			// Log The ItemInfo On The Server Side
			console.log(itemInfoArray[newItemID], newItemIndex);
			
			// Return newItemID
			return newItemID;
		}
	}
};

// Removing An Item When Client Send A Request
const deleteItem = (removeItemID) => {
	if (itemArray[removeItemID] != null){
		console.log("Deleting Item ", removeItemID);
		delete itemArray[removeItemID];
		itemArray[removeItemID] = null;
	}
	return removeItemID;
};

// Removing An Item As A Function
function removeItem(removeItemID) {
	if (itemArray[removeItemID] != null){
		console.log("Deleting Item ", removeItemID);
		delete itemArray[removeItemID];
		itemArray[removeItemID] = null;
	}
	return removeItemID;
}

// Randomly Spawn An Item Every Half A Minute
setInterval(randomSpawnItem, 30000);
function randomSpawnItem() {
	io.emit('clientNewItem', newItem(0, itemDefaultPosition), newItemIndex);
}
// -------------------End Of Item-------------------

// -------------------Projectile-------------------
function getNewProjectileID(){
	let exceedCount = 0;
	// Stop Untill Get An Projectile ID Corresponding To An Empty Space In Projectile List
	while (projectileList[projectile_count] != null) {
		projectile_count = (projectile_count + 1) % projectileList.length;
		exceedCount++;
		
		// If Exceed Max projectileList Length
		if (exceedCount >= projectileList.length){
			projectileList.length += 100;
			console.log("Exceed Max ProjectileList Length, Double The ProjectileList Length! Current Length:", projectileList.length);
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


		if (projectileList[i] == "deletion"){
			// for delete projectile
			projectileList[i] = null;
			updateProjectileList[i] = null;
			deleteProjectileList.push(i);

		}else if (projectileList[i] != null){
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
			} else {
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
		io.emit('deleteEvent', [deleteProjectileList, deleteUnitList]);
	}

	startDate = new Date();
	
	
}
// -------------------End Of Projectile-------------------

// Update Client Frame
function ClientFrameUpdate(onHitProjectileList){
	for (let i = 0; i < onHitProjectileList.length; i++){
		if (projectileList[onHitProjectileList[i]] != null){
			projectileList[onHitProjectileList[i]] = "deletion";
		}
	}

	return [updateProjectileList];
}

// Changing Server Player Information
function playerInfoChange(playerInfo){
	// Example playerInfo = [playerID, {"health": ["+", 10], "attackSpeed": ["=", 1], ...}]
	for (let i = 0; i < playerInfo.length; i++){
		if (playerArray[playerInfo[i][0]] != null){
			for ([key, value] of Object.entries(playerInfo[i][1])) {
				let setValue = value[1];
				if (value[0] == "+") setValue = playerArray[playerInfo[i][0]].properties[key] + value[1];
				else if (value[0] == "-") setValue = playerArray[playerInfo[i][0]].properties[key] - value[1];
				else if (value[0] == "*") setValue = playerArray[playerInfo[i][0]].properties[key] * value[1];
				else if (value[0] == "/") setValue = playerArray[playerInfo[i][0]].properties[key] / value[1];

				playerArray[playerInfo[i][0]].properties[key] = setValue;
			}
		}
	}

	return playerInfo;
}

// Client Is Disconnected
const clientDisconnect = (Info, playerID) => {
	// Clear The PlayerID From Player Array
	if (playerArray[playerID] != null){
		console.log("Player ID:", playerID, " Name:", playerArray[playerID].name, "is disconnected!  Info:", Info);
		delete playerArray[playerID];
		playerArray[playerID] = null;
	}
	
	// Return The ID Of The Player Removed
	return playerID;
};

// -------------------Map-------------------
// Setting The Size Of The Map
var game_map = new map([12, 12],[20, 20]);
// -------------------End Of Map-------------------

// -------------------Sending And Receiving Information-------------------
// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	const playerID = newPlayerID(ID_count);

	const spawnPos = createSpawnPosition();
	// Initializing The Player To The Client
	sock.compress(true).emit('initSelf', playerID, playerArray, game_map.getInitMap(spawnPos, [1, 1]), initPlayerProjectile(projectileList));
	console.log("new player joined, ID: ", playerID);

	// Initializing Collectable Item To The Client
	sock.compress(true).emit('initItem', itemArray, itemInfoArray);
	
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	// Player Related
	sock.on('newName', (playerName) => io.compress(true).emit('newPlayer', CreateNewPlayer(playerID, playerName, spawnPos), playerArray.length));
	sock.on('newPos', (Pos) => io.compress(true).emit('clientPos', UpdatePlayerPosition(Pos, playerID)));
	sock.on('disconnect', (Info) => io.compress(true).emit('clientDisconnect', clientDisconnect(Info, playerID)));
	sock.on('requireBlock', (blockPosList) => sock.compress(true).emit('addBlocks', game_map.getUpdateBlock(blockPosList)));
	sock.on('playerInfo', (playerInfo) => io.compress(true).emit('playerInfoChange', playerInfoChange(playerInfo)));

	// Item Related
	sock.on('serverPlayerItemArray', (additionalItemID, updatePlayerID, removeItemID) => io.compress(true).emit('clientPlayerItemArray', playerItemArrayUpdate(additionalItemID, updatePlayerID, removeItemID), updatePlayerID, removeItemID));
	sock.on('serverNewItem', (newItemID, newItemPosition) => io.compress(true).emit('clientNewItem', newItem(newItemID, newItemPosition), newItemPosition, newItemIndex));
	sock.on('deleteItem', (removeItemID) => io.compress(true).emit('removeItem', deleteItem(removeItemID)));

	// Projectile Related
	sock.on('newProjectile', (projectileInfo) => io.compress(true).emit('spawnProjectile', spawnProjectile(projectileInfo)));

	// Client Frame Update
	sock.on('clientFrame', (onHitProjectileList) => sock.compress(true).emit('updateFrame', ClientFrameUpdate(onHitProjectileList)));
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
