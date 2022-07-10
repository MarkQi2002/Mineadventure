// SHA256
// KEY: kodiaks
// Hashed Value: 28713e0f7e8b977dcd866fcf8686d1242413e661162e68c0a02d9084b90d4a53
// Used For Client Side Unlock Command

// Certain Acronym Used
// EXP -> Experience

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
const { count } = require('console');

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
	// Level Related Properties
	// Exp Required To Level Up Is Increased Exponentially
	// Exp Function: level * 100 * e ^ ((level - 1) / 15)
	// Need 93745637 Exp To Get To Level 100
	this["level"] = 1;
	this["experience"] = 0;
	
	// Level Up Growth Amount
	// Growth Is Linearly Scaled
	this["maxHealthGrowth"] = 50;
	this["armorGrowth"] = 5;

	this["attackDamageGrowth"] = 5;
	this["attackSpeedGrowth"] = 0.05;
	this["criticalRateGrowth"] = 0.005;

	// Defensive Properties
	this["health"] = 100;
	this["maxHealth"] = 100;
	this["armor"] = 10;

	// Attack Properties
	this["attackDamage"] = 10;
	this["attackSpeed"] = 1;
	this["criticalRate"] = 0.01;

	// Movement Properties
	this["moveSpeed"] = 3;
}

// Default Creature Information Class
function creatureInfoClass(ID, creatureType, name, initPos, mapLevel) {
	// Creature Identification Information
	this["ID"] = ID;
	this["creatureType"] = creatureType;
	this["name"] = name;
	this["position"] =  initPos;
	this["mapLevel"] =  mapLevel;
		
	// Creature Properties Information
	this["properties"] = new properties();
	
	// Creature Item Array
	this["creatureItemArray"] = {};
}

// Generate Spawn Position Without Collision With Wall
function createSpawnPosition(mapLevelIndex) {
	// Variable Declaration
	let mapX, mapY;

	// Randomly Generate XY Coordinate Until Found One That Doesn't Collide With The Wall
	while (true) {
		mapX = (Math.random() * game_map.blockNumber.x * game_map.blockSize.x) >> 0;
		mapY = (Math.random() * game_map.blockNumber.y * game_map.blockSize.y) >> 0;
		let unit = game_map.mapLevel[mapLevelIndex].getUnit([mapX, mapY]);
		if (unit != null && !(game_map.unitIDList[unit.ID].collision)) break;
	}

	// Return Valid Position XY Coordinate
	return [mapX, mapY];
}

// Exponential Level Up Function
function experienceRequire(level) {
	// Calculate EXP Required To Level Up
	return Math.floor(level * 100 * Math.exp((level - 1) / 15));
}

// This Function Is Called When Creature Gain EXP
function levelUp(creatureInfo, experience) {
	// Add EXP Gained And Calculate Required EXP To Level Up
	creatureInfo.properties.experience += experience;
	let nextLevelEXP = experienceRequire(creatureInfo.properties.level);

	// Continuously Level Up Creature Until Not Enough EXP To Level Up Further More
	while (creatureInfo.properties.experience >= nextLevelEXP){
		// Level Up And Remove EXP
		creatureInfo.properties.level += 1;
		creatureInfo.properties.experience -= nextLevelEXP;
		nextLevelEXP = experienceRequire(creatureInfo.properties.level);

		// Increase Creature Properties Based On Level Up Growth Rate
		creatureInfo.properties.health += creatureInfo.properties.maxHealthGrowth;
		creatureInfo.properties.maxHealth += creatureInfo.properties.maxHealthGrowth;
		creatureInfo.properties.attackDamage += creatureInfo.properties.attackDamageGrowth;
		creatureInfo.properties.attackSpeed += creatureInfo.properties.attackSpeedGrowth;
		creatureInfo.properties.criticalRate += creatureInfo.properties.criticalRateGrowth;
	}

	// Package Level Up Information
	let levelUpInfo = { "level": ["=", creatureInfo.properties.level],
						"experience": ["=", creatureInfo.properties.experience],
						"health": ["=", creatureInfo.properties.health],
						"maxHealth": ["=", creatureInfo.properties.maxHealth],
						"attackDamage": ["=", creatureInfo.properties.attackDamage],
						"attackSpeed": ["=", creatureInfo.properties.attackSpeed],
						"criticalRate": ["=", creatureInfo.properties.criticalRate]
					};
	
	// Sending Package To All Clients
	io.compress(true).emit('creatureInfoChange', [[[creatureInfo.creatureType, creatureInfo.ID], levelUpInfo]]);
}

// -------------------End Of Creature-------------------

// -------------------Player-------------------
// Player Related Variable Declaration
var playerArray = [];
var sockArray = [];
playerArray.length = 32;
sockArray.length = playerArray.length;

// ID Of Player
var ID_Count = 0;

// Function Used To Create A New Player Using Two Parameters
const CreateNewPlayer = (playerID, playerName, spawnPos, mapLevel, sock) => {
	// Creating PlayerInfo Object
	let playerInfo  = new creatureInfoClass(playerID,
											"player",
											playerName != '' ? playerName : "player_" + playerID,
											[spawnPos[0], spawnPos[1], 1],
											mapLevel);
	// Store PlayerInfo Object Into playerArray
	playerArray[playerID] = playerInfo;

	// Add Sock In sockArray
	if (sockArray.length < playerArray.length){
		sockArray.length = playerArray.length;
	}
	sockArray[playerID] = sock;

	// Print PlayerInfo
	console.log(playerInfo);

	// Add Player To mapLevel
	game_map.mapLevel[mapLevel].levelPlayerArray.push(playerInfo);

	// Send To All Clients in Same Level
	// io.to -> To Individual SocketID
	io.to("level " + mapLevel).compress(true).emit('newPlayer', playerInfo, playerArray.length);
};

// Update Player Based On delta And theMapLevel
function updatePlayer(delta, theMapLevel) {
	let thePlayer;
	// Loop Through All Player Within theMapLevel
	for (let i = 0; i < theMapLevel.levelPlayerArray.length; ++i) {
		thePlayer = theMapLevel.levelPlayerArray[i];
		// Check Player Collision With Projectile
		if (thePlayer != null) creatureOnHit(thePlayer, theMapLevel);
	}
}

// Pos Is An Array Of Size 3 (XYZ)
const UpdatePlayerPosition = (Pos, playerID) => {
	// Updating Player Position
	if (playerArray[playerID] != null) {
		playerArray[playerID].position = Pos;

		// Send To All Player On Same Level
		io.to("level " + playerArray[playerID].mapLevel).compress(true).emit('clientPos', [Pos, playerID]);
	}
};

// Get A New Player ID From The Empty Space In PlayArray
function newPlayerID() {
	let exceedCount = 0;
	// Stop Untill Get An playerID Corresponding To An Empty Space In PlayArray
	while (playerArray[ID_Count] != null) {
		ID_Count = (ID_Count + 1) % playerArray.length;
		exceedCount++;

		// If Exceed Max playerArray Length
		if (exceedCount >= playerArray.length) {
			playerArray.length += 32;
			console.log("Exceed Max PlayArray Length, Double The PlayArray Length! Current Length: ", playerArray.length);
		}
	}

	// Return ID_Count
	return ID_Count;
}

// Client Is Disconnected
const clientDisconnect = (Info, playerID) => {
	// Clear The PlayerID From Player Array
	if (playerArray[playerID] != null){
		let mapLevelIndex = playerArray[playerID].mapLevel;

		// Send To All Player In Same Level
		io.to("level " + mapLevelIndex).compress(true).emit('clientDisconnect', playerID);

		// Remove The Player From mapLevel
		let index = game_map.mapLevel[mapLevelIndex].levelPlayerArray.indexOf(playerArray[playerID]);
		if (index > -1) { // only splice array when item is found
			game_map.mapLevel[mapLevelIndex].levelPlayerArray.splice(index, 1); // 2nd parameter means remove one item only
		}

		// Delete This Player's Info
		console.log("Player ID:", playerID, " Name:", playerArray[playerID].name, "is disconnected!  Info:", Info);
		delete playerArray[playerID];
		playerArray[playerID] = null;
		sockArray[playerID] = null;
	}
};

// Command
const serverCommand = (playerID, theCommand) => {
	if (theCommand[0] == "mapLevel"){
		if (theCommand[1] >= game_map.mapLevel.length) return;
		SwitchMapLevel([playerArray[playerID].position[0], playerArray[playerID].position[1]], playerArray[playerID], theCommand[1]);
	}
};

function SwitchMapLevel(spawnPos, playerInfo, newMapLevelIndex){
	// Remove The Player From mapLevel
	let mapLevelIndex = playerInfo.mapLevel;
	let sock = sockArray[playerInfo.ID];
	sock.leave("level " + mapLevelIndex);
	let index = game_map.mapLevel[mapLevelIndex].levelPlayerArray.indexOf(playerInfo);
	if (index > -1) { // only splice array when item is found
		game_map.mapLevel[mapLevelIndex].levelPlayerArray.splice(index, 1); // 2nd parameter means remove one item only
	}
	io.to("level " + mapLevelIndex).compress(true).emit('clientDisconnect', playerInfo.ID);


	// Add Player To The New mapLevel
	playerInfo.mapLevel = newMapLevelIndex;
	io.to("level " + newMapLevelIndex).compress(true).emit('newPlayer', playerInfo, playerArray.length);
	setMapLevel(sock, [(spawnPos[0] + 0.5) >> 0, (spawnPos[1] + 0.5) >> 0], playerInfo.ID, newMapLevelIndex);
	game_map.mapLevel[newMapLevelIndex].levelPlayerArray.push(playerInfo);
}


function setMapLevel(sock, spawnPos, playerID, newMapLevelIndex){
	// Add Player To The New mapLevel
	sock.join("level " + newMapLevelIndex);
	sock.compress(true).emit('initSelf', playerID, game_map.mapLevel[newMapLevelIndex].levelPlayerArray, playerArray.length,
							 game_map.getInitMap(spawnPos, newMapLevelIndex, [1, 1]), initPlayerProjectile(newMapLevelIndex),
							 game_map.mapLevel[newMapLevelIndex].levelMonsterArray, monsterArray.length, newMapLevelIndex);
}

// -------------------End Of Player-------------------

// -------------------Monster-------------------
var AI_controllerList = [];
AI_controllerList.length = 100;
var monsterArray = [];
monsterArray.length = 100;
var monster_ID_Count = 0;
var monsterInfoArray = [[{"name": "Fakedoge", "type": "burrower", "properties":{"health": 50000000, "maxHealth": 50, "attackDamage": 10, "attackSpeed": 30, "moveSpeed": 3}},{}],
						[{"name": "Fakecat", "type": "burrower", "properties":{"health": 100, "maxHealth": 100, "attackDamage": 20, "attackSpeed": 0.5, "moveSpeed": 3}},{}],
						];

// Get A New Monster ID From The Empty Space In MonsterArray
function newMonsterID() {
	let exceedCount = 0;

	// Stop Untill Get An monsterID Corresponding To An Empty Space In MonsterArray
	while (monsterArray[monster_ID_Count] != null){
		monster_ID_Count = (monster_ID_Count + 1) % monsterArray.length;
		exceedCount++;

		// If Exceed Max monsterArray Length
		if (exceedCount >= monsterArray.length) {
			monsterArray.length += 100;
			console.log("Exceed Max MonsterArray Length, Double The MonsterArray Length! Current Length: ", monsterArray.length);
		}
	}

	// Return monster_ID_Count
	return monster_ID_Count;
}

// Creating A New Monster
function createNewMonster(ID, spawnPos, mapLevel, monsterID) {
	// Input Control
	if (monsterID == null) monsterID = newMonsterID();
	else if (monsterArray[monsterID] != null) deleteMonster(monsterID);

	// Monster Information
	let monsterInfo  = new creatureInfoClass(monsterID,
											"monster",
											monsterInfoArray[ID][0]["name"],
											[spawnPos[0], spawnPos[1], 1],
											mapLevel);
											
	// Add Properties By ID
	for ([key, value] of Object.entries(monsterInfoArray[ID][0]["properties"])) {
		monsterInfo.properties[key] = value;
	}

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

	// Add Monster Into mapLevel
	game_map.mapLevel[mapLevel].levelMonsterArray.push(monsterInfo);

	// Send Information To Client To Generate A New Monster
	io.to("level " + mapLevel).compress(true).emit('newMonster', monsterInfo, monsterArray.length);

	// Return The Monster Information
	return monsterInfo;
}

// Updating Monster
function updateMonster(delta, theMapLevel) {
	// Variable Declaration
	let monsterID;
	theMapLevel.updateMonsterPos = [];

	// Loop Through All Monster Within theMapLevel
	for (let monsterIndex = 0; monsterIndex < theMapLevel.levelMonsterArray.length; ++monsterIndex) {
		monsterID = theMapLevel.levelMonsterArray[monsterIndex].ID;
		
		// If Monster Is Empty Continue
		if (AI_controllerList[monsterID] == null) continue;

		// Extract The Creature
		theMonster = AI_controllerList[monsterID].creature;

		// Monster Path Finding To Goal
		goal = playerArray[0] != null ? [Math.floor(playerArray[0].position[0]), Math.floor(playerArray[0].position[1])] : [0,0];
		AI_controllerList[monsterID].update(delta, game_map, goal, spawnProjectile);
		theMapLevel.updateMonsterPos.push([theMonster.position, monsterID]);

		// Check Monster Collision With Projectile
		creatureOnHit(theMonster, theMapLevel);
	}
}

// Deleting A Monster Based On The Input Monster ID
function deleteMonster(monsterID) {
	// When The MonsterArray Corresponding To MonsterID Is Not NULL Spawn An Item
	if (monsterArray[monsterID] != null) {
		// Variable Declaration For Spawning Item After Monster Dead
		let newItemID;
		let newItemPosition = monsterArray[monsterID].position;
		
		// Randomly Generating An Item ID Based On Rarity Distribution
		let monsterDropRate = 1.00;
		let randomNumber = Math.random();
		if (randomNumber < 0.60 * monsterDropRate) newItemID = itemRarityArray[0][Math.floor(Math.random() * itemRarityArray[0].length)];
		else if (randomNumber < 0.85 * monsterDropRate) newItemID = itemRarityArray[1][Math.floor(Math.random() * itemRarityArray[1].length)];
		else if (randomNumber < 0.95 * monsterDropRate) newItemID = itemRarityArray[2][Math.floor(Math.random() * itemRarityArray[2].length)];
		else if (randomNumber < 1.00 * monsterDropRate) newItemID = itemRarityArray[3][Math.floor(Math.random() * itemRarityArray[3].length)];

		// Spawning The Actual Item
		if (newItemID != null && typeof newItemID != "undefined") io.emit('clientNewItem', newItem(newItemID, newItemPosition), newItemPosition, newItemIndex);
		
		// Get Which Map Level The Monster Is In
		let mapLevelIndex = monsterArray[monsterID].mapLevel;

		// Remove The Monster From mapLevel
		let index = game_map.mapLevel[mapLevelIndex].levelMonsterArray.indexOf(monsterArray[monsterID]);
		if (index > -1) { // Only Splice Array When Item Is Found
			game_map.mapLevel[mapLevelIndex].levelMonsterArray.splice(index, 1); // 2nd Parameter Means Remove One Item Only
		}

		// Send Deletion Info To All Client In Same Level
		io.to("level " + monsterArray[monsterID].mapLevel).compress(true).emit('deleteMonster', monsterID);
	}

	// Deleting Everything Relating To The Particular Monster Being Deleted
	delete monsterArray[monsterID];
	delete AI_controllerList[monsterID];
	monsterArray[monsterID] = null;
	AI_controllerList[monsterID] = null;
}

// Check Whether Creature Has Been Hit Or Not
function creatureOnHit(creatureInfo, theMapLevel) {
	// Get The Block The Creature Located Within
	let theBlock = theMapLevel.getBlock([(creatureInfo.position[0] + 0.5) >> 0,
										 (creatureInfo.position[1] + 0.5) >> 0]);
	
	// If Outside Border Return
	if (theBlock == null) return;

	// Extract All Projectiles Within The Block
	let blockProjectileList = theBlock.projectileList;

	// Variable Declaration
	let theProjectile;

	// Loop Through All Projectiles Within blockProjectileList
	for (let projectileIndex = 0; projectileIndex < blockProjectileList.length; ++projectileIndex) {
		// Get The Projectile
		theProjectile = theMapLevel.levelProjectileArray[blockProjectileList[projectileIndex]];

		// If The Index Is Empty Or The Projectile Is In The Process Of Deletion, Continue
		if (theProjectile == null || theProjectile == "deletion") continue;

		// Calculate XY Coordinate Difference
		let diffX = theProjectile.position[0] - creatureInfo.position[0];
		let diffY = theProjectile.position[1] - creatureInfo.position[1];

		// Check Attacker Information
		let attackerInfo = theProjectile.damageInfo.attacker;

		if (creatureInfo.creatureType == "player"){
			if (attackerInfo[1] == creatureInfo.ID) continue; // Attacker Is Creature Itself
		} else {
			if (attackerInfo[0] == creatureInfo.creatureType) continue; // Monster Is Attacking Monster
		}

		// Calculate Manhattan Distance
		if (Math.abs(diffX) + Math.abs(diffY) < 2){
			// Calculate Z Coordinate Difference
			let diffZ = theProjectile.position[2] - creatureInfo.position[2];
			
			// Calculate Distance To Squared
			if (diffX * diffX + diffY * diffY + diffZ * diffZ <= 0.49){
				// Updating Creature Information
				creatureInfoChange([[[creatureInfo.creatureType, creatureInfo.ID], {"damage": theProjectile.damageInfo}]]);

				// Set Projectile Deletion Tag
				theMapLevel.levelProjectileArray[blockProjectileList[projectileIndex]] = "deletion";

				// Creature On Hit Health Below 0
				if (creatureInfo.properties["health"] <= 0){
					if (creatureInfo.creatureType == "player"){
						// Do Nothing
					} else {
						// Monster Creature, Delete Monster And Give Attacker EXP
						deleteMonster(creatureInfo.ID);
						if (attackerInfo[0] == "player") levelUp(playerArray[attackerInfo[1]], creatureInfo.properties.level * 100);	
					}
				}
			}
		}
	}
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
function itemHealing(amount) {
	// Defensive Properties
	this.attacker = "item",
	this.type = {"heal": amount},
	this.properties = new properties()
}

// Item Default Location
var itemDefaultPosition = [1, 1, 1];

// Item Information Array
var itemInfoArray = [[{"itemID": 0, "itemName": "Bison Steak", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"maxHealth": ["+", 25], "damage": new itemHealing(25)}],
					[{"itemID": 1, "itemName": "Armor Piercing Rounds", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Offensive"}, {"attackDamage": ["+", 5]}],
					[{"itemID": 2, "itemName": "Small Recovery Potion", "rarity": "Common", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"damage": new itemHealing(10)}],
					[{"itemID": 3, "itemName": "Mediuml Recovery Potion", "rarity": "Uncommon", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"damage": new itemHealing(100)}],
					[{"itemID": 4, "itemName": "Large Recovery Potion", "rarity": "Suprior", "itemType": "Passive", "stackType": "Linear", "buffTyle": "Defensive"}, {"damage": new itemHealing(1000)}],
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

// Pushing Item Into itemRarityArray
for (let itemInfoIndex = 0; itemInfoIndex < itemInfoArray.length; ++itemInfoIndex){
	// Input Control
	if (itemInfoArray[itemInfoIndex].length <= 0) continue;

	// Push ItemID To Array
	if (itemInfoArray[itemInfoIndex][0].rarity == "Common") itemRarityArray[0].push(itemInfoArray[itemInfoIndex][0].itemID);
	else if (itemInfoArray[itemInfoIndex][0].rarity == "Uncommon") itemRarityArray[1].push(itemInfoArray[itemInfoIndex][0].itemID);
	else if (itemInfoArray[itemInfoIndex][0].rarity == "Suprior") itemRarityArray[2].push(itemInfoArray[itemInfoIndex][0].itemID);
	else if (itemInfoArray[itemInfoIndex][0].rarity == "Legendary") itemRarityArray[3].push(itemInfoArray[itemInfoIndex][0].itemID);
}

// Update Player Property And Player Item Array
const creatureItemArrayUpdate = (additionalItemID, updatePlayerID, removeItemID) => {
	// Remove Item From The Item Array
	if (removeItemID >= 0 && removeItemID < itemArray.length) removeItem(removeItemID);

	let itemAddProperty = {};
	for (let [key, value] of Object.entries(itemInfoArray[additionalItemID][1])) {
		itemAddProperty[key] = JSON.parse(JSON.stringify(value));
	}

	// Update Player Property Based On Item
	let playerInfo = [[["player", updatePlayerID], itemAddProperty]];
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
// Spawning New Projectiles
function spawnProjectile([projectileInfo, mapLevelIndex]){
	let projectileSpawnInfo = [];
	let theMapLevel = game_map.mapLevel[mapLevelIndex];
	let newProjectileID;
	for (let i = 0; i < projectileInfo.length; i++){
		newProjectileID = theMapLevel.getNewProjectileID();
		theMapLevel.levelProjectileArray[newProjectileID] = projectileInfo[i];
		projectileSpawnInfo.push([newProjectileID, projectileInfo[i]]);
	}

	io.to("level " + mapLevelIndex).compress(true).emit('spawnProjectile', projectileSpawnInfo);
}

// Initializing Player Projectile
function initPlayerProjectile(mapLevelIndex){
	let projectileSpawnInfo = [];
	let theMapLevel = game_map.mapLevel[mapLevelIndex];
	for (let i = 0; i < theMapLevel.levelProjectileArray.length; i++){
		projectileSpawnInfo.push([i, theMapLevel.levelProjectileArray[i]])
	}
	return projectileSpawnInfo;
}

// Update All Projectiles
function updateProjectile(delta, mapLevelIndex){
	let theMapLevel = game_map.mapLevel[mapLevelIndex];
	theMapLevel.updateProjectileArray.length = theMapLevel.levelProjectileArray.length;

	let deleteProjectileList = [];
	let deleteUnitList = [];
	let projectilePos;

	for (let i = 0; i < theMapLevel.clearBlockProjectileArray.length; i++){
		game_map.mapLevel[0].blockList[theMapLevel.clearBlockProjectileArray[i][1]]
									  [theMapLevel.clearBlockProjectileArray[i][0]].projectileList = [];
	}

	theMapLevel.clearBlockProjectileArray = [];

	let projectileArray, unit, theBlock, mapX, mapY, unitIndexX, unitIndexY, floatBlockX, floatBlockY, blockX, blockY, OnXBorder;
	// Check All Projectile List
	for (let i = 0; i < theMapLevel.levelProjectileArray.length; i++) {
		projectileArray = theMapLevel.levelProjectileArray[i];
		if (projectileArray == "deletion"){
			// For Delete Projectile
			theMapLevel.levelProjectileArray[i] = null;
			theMapLevel.updateProjectileArray[i] = null;
			deleteProjectileList.push(i);

		} else if (projectileArray != null) {
			projectileArray.position[0] += projectileArray.initVelocity[0] * delta;
			projectileArray.position[1] += projectileArray.initVelocity[1] * delta;
			projectilePos = [
				projectileArray.position[0],
				projectileArray.position[1]
			];
			theMapLevel.updateProjectileArray[i] = projectilePos;
			
			[mapX, mapY] = [(projectileArray.position[0] + 0.5) >> 0, (projectileArray.position[1] + 0.5) >> 0];

			[floatBlockX, floatBlockY] = [mapX / theMapLevel.blockSize.x, mapY / theMapLevel.blockSize.y];
        	if (theMapLevel.IsNotInMapRange(floatBlockX, floatBlockY)){
				theBlock = null;
				unit = null;
			}else{
				theBlock = theMapLevel.blockList[floatBlockY >> 0][floatBlockX >> 0];
				[unitIndexX, unitIndexY] = [mapX % game_map.blockSize.x, mapY % game_map.blockSize.y];
				unit = theBlock.unitList[unitIndexY][unitIndexX];
			}

			
			if (unit == null){
				// For Delete Projectile
				theMapLevel.levelProjectileArray[i] = null;
				theMapLevel.updateProjectileArray[i] = null;
				deleteProjectileList.push(i);
				continue;
			} else {
				if (game_map.unitIDList[unit.ID].collision == true){
					// For Delete Unit
					let isNotIn = true;
					for (let ii = 0; ii < deleteUnitList.length; ii++){
						if (deleteUnitList[ii][0][0] == mapX && deleteUnitList[ii][0][1] == mapY){
							isNotIn == false;
						}
					}

					// Check Is The Unit Is Already Hit
					if (isNotIn){
						// For Delete Projectile
						theMapLevel.levelProjectileArray[i] = null;
						theMapLevel.updateProjectileArray[i] = null;
						deleteProjectileList.push(i);

						let newID = 0;
						unit.ID = newID;
						unit.Height = 0;
						deleteUnitList.push([[mapX, mapY], unit]);
						continue;
					}
				}
			}

			// Pushing Information To The Lists
			theBlock.projectileList.push(i);
			theMapLevel.clearBlockProjectileArray.push([floatBlockX >> 0, floatBlockY >> 0]);


			OnXBorder = false;
			// For Projectile On the Border Of The Block
			if (unitIndexX == 0){
				blockX = (floatBlockX - 1) >> 0;
				if (blockX >= 0){
					theMapLevel.blockList[floatBlockY >> 0][blockX].projectileList.push(i);
					theMapLevel.clearBlockProjectileArray.push([blockX, floatBlockY >> 0]);
					OnXBorder = true;
				}
			}else if (unitIndexX == theMapLevel.blockSize.x - 1){
				blockX = (floatBlockX + 1) >> 0;
				if (blockX < theMapLevel.blockNumber.x){
					theMapLevel.blockList[floatBlockY >> 0][blockX].projectileList.push(i);
					theMapLevel.clearBlockProjectileArray.push([blockX, floatBlockY >> 0]);
					OnXBorder = true;
				}
			}

			if (unitIndexY == 0){
				blockY = (floatBlockY - 1) >> 0;
				if (blockY >= 0){
					theMapLevel.blockList[blockY][floatBlockX >> 0].projectileList.push(i);
					theMapLevel.clearBlockProjectileArray.push([floatBlockX >> 0, blockY]);
					if(OnXBorder){
						theMapLevel.blockList[blockY][blockX].projectileList.push(i);
						theMapLevel.clearBlockProjectileArray.push([blockX, blockY]);
					}
				}
			}else if (unitIndexY == theMapLevel.blockSize.y - 1){
				blockY = (floatBlockY + 1) >> 0;
				if (blockY < theMapLevel.blockNumber.y){
					theMapLevel.blockList[blockY][floatBlockX >> 0].projectileList.push(i);
					theMapLevel.clearBlockProjectileArray.push([floatBlockX >> 0, blockY]);
					if(OnXBorder){
						theMapLevel.blockList[blockY][blockX].projectileList.push(i);
						theMapLevel.clearBlockProjectileArray.push([blockX, blockY]);
					}
				}
			}
		}
	}
	
	// Sending Deletion Event To Clients
	if (deleteProjectileList.length > 0){
		io.to("level " + mapLevelIndex).emit('deleteEvent', [deleteProjectileList, deleteUnitList]);
	}
}

// -------------------End Of Projectile-------------------

// -------------------Server Loop-------------------
var timeInterval = 30;
setInterval(serverLoop, timeInterval);
let startDate = new Date();
let endDate = new Date();

// Looping Certain Functions Per Server Frame
function serverLoop(){
	endDate = new Date();
	let delta = (endDate.getTime() - startDate.getTime()) / 1000;
	//For Each MapLevel
	for (let i = 0; i < game_map.mapLevel.length; ++i){
		updateProjectile(delta, i);
		updatePlayer(delta, game_map.mapLevel[i]);
		updateMonster(delta, game_map.mapLevel[i]);
	}
	startDate = new Date();
}
// -------------------End Of Server Loop-------------------
// Update Client Frame
function ClientFrameUpdate(playerID) {
	if (playerArray[playerID] == null) return;
	let mapLevelIndex = playerArray[playerID].mapLevel;
	sockArray[playerID].compress(true).emit('updateFrame', [game_map.mapLevel[mapLevelIndex].updateProjectileArray, game_map.mapLevel[mapLevelIndex].updateMonsterPos]);
}

// Changing Server Creature Information
function creatureInfoChange(creatureInfo) {
	// Example -> creatureInfo = [[creatureType, id], {"health": ["+", 10], "attackSpeed": ["=", 1], ...}]
	// Input Control (There Can By Multiple Change Requested)
	for (let i = 0; i < creatureInfo.length; i++){
		let theCreature;
		if (creatureInfo[i][0][0] == "player"){
			if (playerArray[creatureInfo[i][0][1]] == null) continue;
			theCreature = playerArray[creatureInfo[i][0][1]];
		} else {
			if (monsterArray[creatureInfo[i][0][1]] == null) continue;
			theCreature = monsterArray[creatureInfo[i][0][1]];
		}
		
		// Changing Certain Properties Based On The Input
		for (let [key, value] of Object.entries(creatureInfo[i][1])) {
			if (key == "damage"){
				creatureInfo[i][1]["health"] = ["=", damagefunction(value, theCreature)];
			} else {
				let setValue = value[1];
				if (value[0] == "+") setValue = theCreature.properties[key] + value[1];
				else if (value[0] == "-") setValue = theCreature.properties[key] - value[1];
				else if (value[0] == "*") setValue = theCreature.properties[key] * value[1];
				else if (value[0] == "/") setValue = theCreature.properties[key] / value[1];

				theCreature.properties[key] = setValue;
			}
		}
	}

	// Sending CreatureInfoChange To All Clients
	io.compress(true).emit('creatureInfoChange', creatureInfo);
}

// Function To Handle Damage
function damagefunction(damageInfo, defender){
	// Check Critical Attack By A Factor
	let criticalAttack = false;
	if (damageInfo.properties.criticalRate >= Math.random()) criticalAttack = true;

	for (let [key, value] of Object.entries(damageInfo.type)) {
		// Input Control
		if (value < 0) continue;

		// True Damage (Ignores Armor)
		if (key == "true"){
			defender.properties.health -= value;
		// Normal Attack
		} else if (key == "normal") {
			let amount = Math.floor(value * (1 - 2 / Math.PI * Math.atan(defender.properties.armor / 500)));
			if (criticalAttack) {
				amount *= 2;
				damageInfo.type["criticalNormal"] = amount;
				delete damageInfo.type["normal"];
			} else {
				damageInfo.type.normal = amount;
			}
			defender.properties.health -= amount;
		// Healing Attack
		} else if (key == "heal") {
			defender.properties.health += value;
			if (defender.properties.health > defender.properties.maxHealth){
				damageInfo.type.heal = value - (defender.properties.health - defender.properties.maxHealth);
				defender.properties.health = defender.properties.maxHealth;
			}
		}
	}

	// Return Defender Health
	return defender.properties.health;
}

// -------------------Map-------------------
// Setting The Size Of The Map
var game_map = new map([20, 20],[20, 20]);
// -------------------End Of Map-------------------

// -------------------Sending And Receiving Information-------------------
// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	const playerID = newPlayerID();
	let initMapLevel = 0;
	let spawnPos = createSpawnPosition(initMapLevel);
	// Initializing The Player To The Client
	setMapLevel(sock, spawnPos, playerID, initMapLevel);

	console.log("new player joined, ID: ", playerID);

	// Initializing Collectable Item To The Client
	sock.compress(true).emit('initItem', itemArray, itemInfoArray);
	
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	// Player Related
	sock.on('newName', (playerName) => CreateNewPlayer(playerID, playerName, spawnPos, initMapLevel, sock));
	sock.on('newPos', (Pos) => UpdatePlayerPosition(Pos, playerID));
	sock.on('disconnect', (Info) => clientDisconnect(Info, playerID));
	sock.on('requireBlock', (blockPosList) => sock.compress(true).emit('addBlocks', game_map.getUpdateBlock(blockPosList, playerArray[playerID].mapLevel)));
	sock.on('newCommand', (newCommand) => serverCommand(playerID, newCommand));

	// Creature Related
	sock.on('creatureInfo', (creatureInfo) => creatureInfoChange(creatureInfo));

	// Item Related
	sock.on('serverCreatureItemArray', (additionalItemID, updatePlayerID, removeItemID) => io.compress(true).emit('clientCreatureItemArray', creatureItemArrayUpdate(additionalItemID, updatePlayerID, removeItemID), updatePlayerID, removeItemID));
	sock.on('serverNewItem', (newItemID, newItemPosition) => io.compress(true).emit('clientNewItem', newItem(newItemID, newItemPosition), newItemPosition, newItemIndex));
	sock.on('deleteItem', (removeItemID) => io.compress(true).emit('removeItem', deleteItem(removeItemID)));

	// Projectile Related
	sock.on('newProjectile', (projectileSpawnInfo) => spawnProjectile(projectileSpawnInfo));

	// Client Frame Update
	sock.on('clientFrame', () => ClientFrameUpdate(playerID));
	// New Message From Client
	sock.on('newMessage', (clientMessage) => io.compress(true).emit('serverMessage', clientMessage));
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
for (let monsterIndex = 0; monsterIndex < 400; ++monsterIndex){
	createNewMonster(0, createSpawnPosition(0), 0);
}
for (let monsterIndex = 0; monsterIndex < 100; ++monsterIndex){
	createNewMonster(1, createSpawnPosition(1), 1);
}
