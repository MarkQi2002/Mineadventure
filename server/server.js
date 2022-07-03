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
const AI_controller = require('./AI_controller.js');
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



// -------------------Creature-------------------

// Default Properties For All Creature
function properties() {
	// Defensive Properties
	this["health"] = 100,
	this["maxHealth"] = 100,
	this["armor"] = 0,

	// Attack Properties
	this["attackDamage"] = 10,
	this["attackSpeed"] = 1

	// Other Properties
	this["moveSpeed"] = 3
}

// -------------------End Of Creature-------------------

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
		properties: new properties,
	
		// Server Side Creature Item Array
		creatureItemArray: {}
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

// -------------------Monster-------------------
var AI_controllerList = [];
AI_controllerList.length = 100;

var monsterArray = [];
monsterArray.length = 100;
var monster_ID_Count = 0;
var monsterInfoArray = [[{"name": "Fakedoge", "type": "burrower", "properties":{"health": 50, "maxHealth": 50, "attackDamage": 10, "attackSpeed": 0.5, "moveSpeed": 3}},{}],


						];

// Get A New Monster ID From The Empty Space In MonsterArray
function newMonsterID(){
	let exceedCount = 0;
	// Stop Untill Get An monsterID Corresponding To An Empty Space In MonsterArray
	while (monsterArray[monster_ID_Count] != null){
		monster_ID_Count = (monster_ID_Count + 1) % monsterArray.length;
		exceedCount++;
		if (exceedCount >= monsterArray.length){// If Exceed Max monsterArray Length
			monsterArray.length += 100;
			console.log("Exceed Max MonsterArray Length, Double The MonsterArray Length! Current Length:", monsterArray.length);
		}
	}
	return monster_ID_Count;
}

// Creating A New Monster
function createNewMonster(ID, spawnPos, monsterID){
	if (monsterID == null){
		monsterID = newMonsterID();
	}else if (monsterArray[monsterID] != null){
		deleteMonster(monsterID);
	}
	
	let newProperties = new properties;
	// Add Properties By ID
	for ([key, value] of Object.entries(monsterInfoArray[ID][0]["properties"])) {
		newProperties[key] = value;
	}

	// Monster Information Struct
	let monsterInfo  = {
		ID: monsterID,
		name: monsterInfoArray[ID][0]["name"],
		position: [spawnPos[0], spawnPos[1], 1],
		
		// Monster Properties
		properties: newProperties,
	
		// Server Side Creature Item Array
		creatureItemArray: {}
	};

	// Saving Monster Info To Monster Array
	monsterArray[monsterID] = monsterInfo;

	// If The AI_contollerList Is Not Long Enought Increment It
	if (monsterID >= AI_controllerList.length){
		AI_controllerList.length = monsterID + 1;
	}

	// Creating A New AI Controller Based On MonsterInfo
	AI_controllerList[monsterID] = new AI_controller(monsterInfo);

	// Log The MonsterInfo On The Server Side
	console.log(monsterInfo);

	// Send Information To Client To Generate A New Monster
	io.compress(true).emit('newMonster', monsterInfo, monsterArray.length);

	


	// Return The Monster Information
	return monsterInfo;
}

var updateMonsterPos = [];
// Updating Monster Position Frame
function updateMonster(delta){
	updateMonsterPos.length = monsterArray.length;
	for (let i = 0; i < AI_controllerList.length; ++i) {
		if(AI_controllerList[i] == null){
			createNewMonster(0, createSpawnPosition(), i);
			continue;
		};

		theMonster = AI_controllerList[i].creature;

		goal = playerArray[0] != null ? [Math.floor(playerArray[0].position[0]), Math.floor(playerArray[0].position[1])] : [0,0];

		AI_controllerList[i].update(delta, game_map, goal, spawnProjectile);
		updateMonsterPos[i] = theMonster.position;

		let [mapX, mapY] = [Math.floor(theMonster.position[0] + 0.5), Math.floor(theMonster.position[1] + 0.5)];
		let unitX = (mapX < 0) ? -mapX - 1 : mapX;
		let unitY = (mapY < 0) ? -mapY - 1 : mapY;
		let theBlock = game_map.getBlockByQuarter(game_map.unit2DToBlock2D([unitX, unitY]), game_map.getQuarterMap([mapX, mapY]));
		
		if (theBlock == null) continue;

		let blockProjectileList = theBlock.projectileList;

		for (let ii = 0; ii < blockProjectileList.length; ++ii) {

			let index = blockProjectileList[ii];

			if (projectileList[index] == null || projectileList[index] == "deletion") continue;
			// Monster Collision With Projectile
			let diffX = projectileList[index].position[0] - theMonster.position[0];
			let diffY = projectileList[index].position[1] - theMonster.position[1];
			// Calculate Manhattan Distance

			if (projectileList[index].damageInfo.attacker[0] != "monster" && Math.abs(diffX) + Math.abs(diffY) < 2){
				let diffZ = projectileList[index].position[2] - theMonster.position[2];
				// Calculate Distance To Squared
				if (diffX * diffX + diffY * diffY + diffZ * diffZ <= 0.49){
					creatureInfoChange([[["monster", i], {"health": ["-", projectileList[index].damageInfo.amount]}]]);
					projectileList[index] = "deletion";
					if (theMonster.properties["health"] <= 0){
						deleteMonster(i);
					}
				}
			}
		}
	}
}

// Deleting A Monster Based On The Input Monster ID
function deleteMonster(monsterID){
	// When The MonsterArray Corresponding To MonsterID Is Not NULL Spawn An Item
	if (monsterArray[monsterID] != null) {
		// Variable Declaration For Spawning Item After Monster Dead
		let newItemID;
		let newItemPosition = monsterArray[monsterID].position;
		
		// Randomly Generating An Item ID Based On Rarity Distribution
		let randomNumber = Math.random();
		if (randomNumber < 0.60) newItemID = itemRarityArray[0][Math.floor(Math.random() * itemRarityArray[0].length)];
		else if (randomNumber < 0.85) newItemID = itemRarityArray[1][Math.floor(Math.random() * itemRarityArray[1].length)];
		else if (randomNumber < 0.95) newItemID = itemRarityArray[2][Math.floor(Math.random() * itemRarityArray[2].length)];
		else if (randomNumber < 1.00) newItemID = itemRarityArray[3][Math.floor(Math.random() * itemRarityArray[3].length)];

		// Spawning The Actual Item
		if (newItemID != null && typeof newItemID != "undefined") io.emit('clientNewItem', newItem(newItemID, newItemPosition), newItemPosition, newItemIndex);
	}

	// Deleting Everything Relating To The Particular Monster Being Deleted
	delete monsterArray[monsterID];
	delete AI_controllerList[monsterID];
	monsterArray[monsterID] = null;
	AI_controllerList[monsterID] = null;
	io.compress(true).emit('deleteMonster', monsterID);
}
// -------------------End Of Monster-------------------

// -------------------Item-------------------
// Item Related Variable Declaration
var newItemIndex;
var currentItemIndex = 0;
var itemArray = [];
itemArray.length = 256;

// itemInfoArray Is A 2D Array
// First Layer: Item ID (Currently 20 Items)
// Second Layer: itemInfo, itemPosition, propertyInfo
// itemName - Name Of The Item
/* itemRarity - How Rare Is The Item
White (Common) (60%)
Green (Uncommon) (25%)
Orange (Suprior) (10%)
Red (Legendary) (5%)
*/
/* itemStackType - Show How Multiple Items Increase Its Property
Linear Stacking
Hyperbolic Stacking
Exponential Stacking
*/
/* itemBuffType - What Type Of Buff The Item Gives
Attack
Defensive
*/
var itemDefaultPosition = [1, 1, 1];
var itemInfoArray = [[{"itemID": 0, "itemName": "Bison Steak", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"maxHealth": ["+", 25], "health": ["+", 25]}],
					[{"itemID": 1, "itemName": "Armor Piercing Rounds", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Offensive"}, {"attackDamage": ["+", 5]}],
					[{"itemID": 2, "itemName": "Small Recovery Potion", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"health": ["+", 10]}],
					[{"itemID": 3, "itemName": "Mediuml Recovery Potion", "rarity": "Uncommon", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"health": ["+", 100]}],
					[{"itemID": 4, "itemName": "Large Recovery Potion", "rarity": "Suprior", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"health": ["+", 1000]}],
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

/* itemRarity - How Rare Is The Item
White (Common) (60%) Index: 0
Green (Uncommon) (25%) Index: 1
Orange (Suprior) (10%) Index: 2
Red (Legendary) (5%) Index: 3
*/
var itemRarityArray = [[], [], [], []];

for (let i = 0; i < itemInfoArray.length; ++i){
	if (itemInfoArray[i].length <= 0) continue;
	if (itemInfoArray[i][0].rarity == "Common")itemRarityArray[0].push(itemInfoArray[i][0].itemID);
	else if (itemInfoArray[i][0].rarity == "Uncommon")itemRarityArray[1].push(itemInfoArray[i][0].itemID);
	else if (itemInfoArray[i][0].rarity == "Suprior")itemRarityArray[2].push(itemInfoArray[i][0].itemID);
	else if (itemInfoArray[i][0].rarity == "Legendary")itemRarityArray[3].push(itemInfoArray[i][0].itemID);
}



// Update Player Property And Player Item Array
const creatureItemArrayUpdate = (additionalItemID, updatePlayerID, removeItemID) => {
	// Remove Item From The Item Array
	if (removeItemID >= 0 && removeItemID < itemArray.length) removeItem(removeItemID);

	// Update Player Property Based On Item
	let playerInfo = [[["player", updatePlayerID], itemInfoArray[additionalItemID][1]]];
	creatureInfoChange(playerInfo);

	// Update Server Side Player Item Array
	if (playerArray[updatePlayerID].creatureItemArray[additionalItemID] != null)
		playerArray[updatePlayerID].creatureItemArray[additionalItemID]++;
	else
		playerArray[updatePlayerID].creatureItemArray[additionalItemID] = 1;

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

	newItemIndex = -1;
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
	io.emit('clientNewItem', newItem(0, itemDefaultPosition), itemDefaultPosition, newItemIndex);
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
		let newProjectileID = getNewProjectileID();
		projectileList[newProjectileID] = projectileInfo[i];
		projectileSpawnInfo.push([newProjectileID, projectileInfo[i]]);
	}

	io.compress(true).emit('spawnProjectile', projectileSpawnInfo);
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
var clearBlockProjectileList = [];

// Update All Projectiles
function updateProjectile(delta){
	updateProjectileList.length = projectileList.length;

	let deleteProjectileList = [];
	let deleteUnitList = [];
	let projectilePos;

	
	for (let i = 0; i < clearBlockProjectileList.length; i++){
		let [mapX, mapY] = clearBlockProjectileList[i];
		let unitX = (mapX < 0) ? -mapX - 1 : mapX;
		let unitY = (mapY < 0) ? -mapY - 1 : mapY;
		let theBlock = game_map.getBlockByQuarter(game_map.unit2DToBlock2D([unitX, unitY]), game_map.getQuarterMap([mapX, mapY]));
		theBlock.projectileList = [];
	}

	clearBlockProjectileList = [];

	for (let i = 0; i < projectileList.length; i++){
		if (projectileList[i] == "deletion"){
			// for delete projectile
			projectileList[i] = null;
			updateProjectileList[i] = null;
			deleteProjectileList.push(i);

		}else if (projectileList[i] != null){
			projectileList[i].position[0] += projectileList[i].initVelocity[0] * delta;
			projectileList[i].position[1] += projectileList[i].initVelocity[1] * delta;
			projectilePos = [
				projectileList[i].position[0],
				projectileList[i].position[1]
			];
			updateProjectileList[i] = projectilePos;
			
			let [mapX, mapY] = [Math.floor(projectileList[i].position[0] + 0.5), Math.floor(projectileList[i].position[1] + 0.5)];

			let unitX = (mapX < 0) ? -mapX - 1 : mapX;
			let unitY = (mapY < 0) ? -mapY - 1 : mapY;

			let theBlock = game_map.getBlockByQuarter(game_map.unit2DToBlock2D([unitX, unitY]), game_map.getQuarterMap([mapX, mapY]));

			let unit = null;
			if (theBlock != null){
				unit = theBlock.unitList[Math.abs(unitY) % game_map.blockSize2D.y][Math.abs(unitX) % game_map.blockSize2D.x];
			}

			
			if (unit == null){
				// for delete projectile
				projectileList[i] = null;
				updateProjectileList[i] = null;
				deleteProjectileList.push(i);
				continue;
			} else {
				if (game_map.unitIDList[unit.ID].collision == true){
					// for delete unit
					let isNotIn = true;
					for (let ii = 0; ii < deleteUnitList.length; ii++){
						if (deleteUnitList[ii][0][0] == mapX && deleteUnitList[ii][0][1] == mapY){
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
						deleteUnitList.push([[mapX, mapY], unit]);
						continue;
					}
				}
			}


			theBlock.projectileList.push(i);
			clearBlockProjectileList.push([mapX, mapY]);

		}
		
	}
	
	if (deleteProjectileList.length > 0){
		io.emit('deleteEvent', [deleteProjectileList, deleteUnitList]);
	}

	
}
// -------------------End Of Projectile-------------------

// -------------------Server Loop-------------------
var timeInterval = 15;
setInterval(serverLoop, timeInterval);
let startDate = new Date();
let endDate = new Date();

// Looping Certain Functions Per Server Frame
function serverLoop(){
	endDate = new Date();
	let delta = (endDate.getTime() - startDate.getTime()) / 1000;
	updateProjectile(delta);
	updateMonster(delta);
	startDate = new Date();
}
// -------------------End Of Server Loop-------------------

// Update Client Frame
function ClientFrameUpdate(onHitProjectileList){
	for (let i = 0; i < onHitProjectileList.length; i++){
		if (projectileList[onHitProjectileList[i]] != null){
			projectileList[onHitProjectileList[i]] = "deletion";
		}
	}
	
	return [updateProjectileList, updateMonsterPos];
}

// Changing Server Creature Information
function creatureInfoChange(theCreatureInfo){

	let creatureInfo = theCreatureInfo.slice();
	// Example creatureInfo = [[creatureType, id], {"health": ["+", 10], "attackSpeed": ["=", 1], ...}]
	for (let i = 0; i < creatureInfo.length; i++){
		let theCreature;
		if (creatureInfo[i][0][0] == "player"){
			if (playerArray[creatureInfo[i][0][1]] == null) continue;
			theCreature = playerArray[creatureInfo[i][0][1]];
		}else{
			if (monsterArray[creatureInfo[i][0][1]] == null) continue;
			theCreature = monsterArray[creatureInfo[i][0][1]];
		}
		
		for ([key, value] of Object.entries(creatureInfo[i][1])) {
			let setValue = value[1];
			if (value[0] == "+") setValue = theCreature.properties[key] + value[1];
			else if (value[0] == "-") setValue = theCreature.properties[key] - value[1];
			else if (value[0] == "*") setValue = theCreature.properties[key] * value[1];
			else if (value[0] == "/") setValue = theCreature.properties[key] / value[1];

			if (key == "health"){
				if (setValue > theCreature.properties.maxHealth){
					theCreature.properties.health = theCreature.properties.maxHealth;
					creatureInfo[i][1].health = ["=", theCreature.properties.maxHealth];
				}else{
					theCreature.properties.health = setValue;
				}
			}else{
				theCreature.properties[key] = setValue;
			}
			
		}
	}

	io.compress(true).emit('creatureInfoChange', creatureInfo);
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
	const playerID = newPlayerID();

	const spawnPos = createSpawnPosition();
	// Initializing The Player To The Client
	sock.compress(true).emit('initSelf', playerID, playerArray, game_map.getInitMap(spawnPos, [1, 1]), initPlayerProjectile(projectileList), monsterArray);
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

	// Creature Related
	sock.on('creatureInfo', (creatureInfo) => creatureInfoChange(creatureInfo));

	// Item Related
	sock.on('serverCreatureItemArray', (additionalItemID, updatePlayerID, removeItemID) => io.compress(true).emit('clientCreatureItemArray', creatureItemArrayUpdate(additionalItemID, updatePlayerID, removeItemID), updatePlayerID, removeItemID));
	sock.on('serverNewItem', (newItemID, newItemPosition) => io.compress(true).emit('clientNewItem', newItem(newItemID, newItemPosition), newItemPosition, newItemIndex));
	sock.on('deleteItem', (removeItemID) => io.compress(true).emit('removeItem', deleteItem(removeItemID)));

	// Projectile Related
	sock.on('newProjectile', (projectileInfo) => spawnProjectile(projectileInfo));

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



// Spawning 500 Monsters Randomly Throughout The Map
for (let i = 0; i < 500; ++i){
	createNewMonster(0, createSpawnPosition());
}

//createNewMonster(0, [0, 0, 1]);

