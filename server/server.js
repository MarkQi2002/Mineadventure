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
	this["level"] = 1;
	this["experience"] = 0; // level * 100 * e ^ ((level - 1) / 15)   need 93745637 exp to get level 100
	
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

	// Other Properties
	this["moveSpeed"] = 3;
}

// Default Creature Information
function creatureInfoClass(ID, creatureType, name, initPos, mapLevel) {
	this["ID"] = ID;
	this["creatureType"] = creatureType;
	this["name"] = name;
	this["position"] =  initPos;
	this["mapLevel"] =  mapLevel;
		
	// Player Properties
	this["properties"] = new properties;
	
	// Server Side Creature Item Array
	this["creatureItemArray"] = {};
}

// find a spawn place without collision
function createSpawnPosition(mapLevelIndex) {
	let mapX, mapY;
	while (1) {
		mapX = (Math.random() * game_map.blockNumber.x * game_map.blockSize.x) >> 0;
		mapY = (Math.random() * game_map.blockNumber.y * game_map.blockSize.y) >> 0;
		let unit = game_map.mapLevel[mapLevelIndex].getUnit([mapX, mapY]);
		if (unit != null && !(game_map.unitIDList[unit.ID].collision)) break;
	}
	return [mapX, mapY];
}

// Exponential Level Up Function
function experienceRequire(level) {
	return Math.floor(level * 100 * Math.exp((level - 1) / 15));
}

// Linear Growth For Player Properties When Level Up
function levelUp(creatureInfo, experience) {
	creatureInfo.properties.experience += experience;
	let nextLevelEXP = experienceRequire(creatureInfo.properties.level);
	while (creatureInfo.properties.experience >= nextLevelEXP){
		creatureInfo.properties.level += 1;
		creatureInfo.properties.experience -= nextLevelEXP;
		nextLevelEXP = experienceRequire(creatureInfo.properties.level);

		creatureInfo.properties.health += creatureInfo.properties.maxHealthGrowth;
		creatureInfo.properties.maxHealth += creatureInfo.properties.maxHealthGrowth;
		creatureInfo.properties.attackDamage += creatureInfo.properties.attackDamageGrowth;
		creatureInfo.properties.attackSpeed += creatureInfo.properties.attackSpeedGrowth;
		creatureInfo.properties.criticalRate += creatureInfo.properties.criticalRateGrowth;
	}

	// Level Up Information
	let levelUpInfo = { "level": ["=", creatureInfo.properties.level],
						"experience": ["=", creatureInfo.properties.experience],
						"health": ["=", creatureInfo.properties.health],
						"maxHealth": ["=", creatureInfo.properties.maxHealth],
						"attackDamage": ["=", creatureInfo.properties.attackDamage],
						"attackSpeed": ["=", creatureInfo.properties.attackSpeed],
						"criticalRate": ["=", creatureInfo.properties.criticalRate]
					};

	io.compress(true).emit('creatureInfoChange', [[[creatureInfo.creatureType, creatureInfo.ID], levelUpInfo]]);
}

// -------------------End Of Creature-------------------

// -------------------Player-------------------
// Game Related Variable Declaration
var playerArray = [];
playerArray.length = 32;

// ID Of Player
var ID_count = 0;

// Function Used To Create A New Player Using Two Parameters
const CreateNewPlayer = (playerID, playerName, spawnPos, mapLevel) => {
	// Similar To A Struct
	let playerInfo  = new creatureInfoClass(playerID,
											"player",
											playerName != '' ? playerName : "player_" + playerID,
											[spawnPos[0], spawnPos[1], 1],
											mapLevel);

	// Indexing Player Array To Include The New Player
	playerArray[playerID] = playerInfo;

	// Log The PlayerInfo On The Server Side
	console.log(playerInfo);

	// Add Player Into mapLevel
	game_map.mapLevel[mapLevel].levelPlayerArray.push(playerInfo);

	// Send To all player in Same Level
	io.to("level " + mapLevel).compress(true).emit('newPlayer', playerInfo, playerArray.length);
};

// Update Player Based On delta
function updatePlayer(delta, theMapLevel) {
	let thePlayer;
	for (let i = 0; i < theMapLevel.levelPlayerArray.length; ++i) {
		thePlayer = theMapLevel.levelPlayerArray[i];
		if (thePlayer != null){
			creatureOnHit(thePlayer, theMapLevel);
		}
	}
}

// Pos Is An Array Of Size 3 (XYZ)
const UpdatePlayerPosition = (Pos, playerID) => {
	if (playerArray[playerID] != null) {
		playerArray[playerID].position = Pos;

		// Send To all player in Same Level
		io.to("level " + playerArray[playerID].mapLevel).compress(true).emit('clientPos', [Pos, playerID]);
	}
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
function createNewMonster(ID, spawnPos, mapLevel, monsterID){
	if (monsterID == null){
		monsterID = newMonsterID();
	} else if (monsterArray[monsterID] != null) {
		deleteMonster(monsterID);
	}

	// Monster Information Struct
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


// Updating Monster Position Frame
function updateMonster(delta, theMapLevel){
	let monsterID;
	theMapLevel.updateMonsterPos = [];
	for (let i = 0; i < theMapLevel.levelMonsterArray.length; ++i) {
		monsterID = theMapLevel.levelMonsterArray[i].ID;

		if(AI_controllerList[monsterID] == null){
			//createNewMonster(0, createSpawnPosition(0), i);
			continue;
		};

		theMonster = AI_controllerList[monsterID].creature;

		goal = playerArray[0] != null ? [Math.floor(playerArray[0].position[0]), Math.floor(playerArray[0].position[1])] : [0,0];

		AI_controllerList[monsterID].update(delta, game_map, goal, spawnProjectile);
		theMapLevel.updateMonsterPos.push([theMonster.position, monsterID]);

		creatureOnHit(theMonster, theMapLevel);
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
		
		let mapLevelIndex = monsterArray[monsterID].mapLevel;

		// Remove The Monster From mapLevel
		let index = game_map.mapLevel[mapLevelIndex].levelMonsterArray.indexOf(monsterArray[monsterID]);
		if (index > -1) { // only splice array when item is found
			game_map.mapLevel[mapLevelIndex].levelMonsterArray.splice(index, 1); // 2nd parameter means remove one item only
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

// Function To Call If A Creature Has Been Hit
function creatureOnHit(creatureInfo, theMapLevel) {
	let theBlock = theMapLevel.getBlock([(creatureInfo.position[0] + 0.5) >> 0,
										 (creatureInfo.position[1] + 0.5) >> 0]);
	
	if (theBlock == null) return;

	let blockProjectileList = theBlock.projectileList;

	let theProjectile;
	for (let ii = 0; ii < blockProjectileList.length; ++ii) {
		// Get The Projectile
		theProjectile = theMapLevel.levelProjectileArray[blockProjectileList[ii]];
		if (theProjectile == null || theProjectile == "deletion") continue;
		// Creature Collision With Projectile
		let diffX = theProjectile.position[0] - creatureInfo.position[0];
		let diffY = theProjectile.position[1] - creatureInfo.position[1];
		// Calculate Manhattan Distance
		let attackerInfo = theProjectile.damageInfo.attacker;
		if (creatureInfo.creatureType == "player"){
			if (attackerInfo[1] == creatureInfo.ID) continue;
		} else {
			if (attackerInfo[0] == creatureInfo.creatureType) continue;
		}

		if (Math.abs(diffX) + Math.abs(diffY) < 2){
			let diffZ = theProjectile.position[2] - creatureInfo.position[2];
			// Calculate Distance To Squared
			if (diffX * diffX + diffY * diffY + diffZ * diffZ <= 0.49){
				creatureInfoChange([[[creatureInfo.creatureType, creatureInfo.ID], {"damage": theProjectile.damageInfo}]]);
				theMapLevel.levelProjectileArray[blockProjectileList[ii]] = "deletion";
				if (creatureInfo.properties["health"] <= 0){
					if (creatureInfo.creatureType == "player"){
						// Do Nothing
					} else {
						deleteMonster(creatureInfo.ID);
						if (attackerInfo[0] == "player"){
							levelUp(playerArray[attackerInfo[1]], creatureInfo.properties.level * 100);
						}
						
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
		game_map.mapLevel[0].getBlock(theMapLevel.clearBlockProjectileArray[i]).projectileList = [];
	}

	theMapLevel.clearBlockProjectileArray = [];

	let projectileArray, unit, theBlock, mapX, mapY;
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

			theBlock = theMapLevel.getBlock([mapX, mapY]);

			unit = null;
			if (theBlock != null){
				unit = theBlock.unitList[mapY % game_map.blockSize.y][mapX % game_map.blockSize.x];
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
			theMapLevel.clearBlockProjectileArray.push([mapX, mapY]);
		}
	}
	
	// Sending Deletion Event To Clients
	if (deleteProjectileList.length > 0){
		io.to("level " + mapLevelIndex).emit('deleteEvent', [deleteProjectileList, deleteUnitList]);
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
function ClientFrameUpdate(mapLevelIndex){
	return [game_map.mapLevel[mapLevelIndex].updateProjectileArray, game_map.mapLevel[mapLevelIndex].updateMonsterPos];
}

// Changing Server Creature Information
function creatureInfoChange(creatureInfo){
	// Example creatureInfo = [[creatureType, id], {"health": ["+", 10], "attackSpeed": ["=", 1], ...}]
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

	io.compress(true).emit('creatureInfoChange', creatureInfo);
}

function damagefunction(damageInfo, defender){
	let criticalAttack = false;
	if (damageInfo.properties.criticalRate >= Math.random()) criticalAttack = true;

	for (let [key, value] of Object.entries(damageInfo.type)) {
		if (value < 0) continue;

		if (key == "true"){
			defender.properties.health -= value;
		}else if(key == "normal"){
			let amount = Math.floor(value * (1 - 2 / Math.PI * Math.atan(defender.properties.armor / 500)));
			if (criticalAttack){
				amount *= 2;
				damageInfo.type["criticalNormal"] = amount;
				delete damageInfo.type["normal"];
			}else{
				damageInfo.type.normal = amount;
			}
			defender.properties.health -= amount;
			
		}else if(key == "heal"){
			defender.properties.health += value;
			if (defender.properties.health > defender.properties.maxHealth){
				damageInfo.type.heal = value - (defender.properties.health - defender.properties.maxHealth);
				defender.properties.health = defender.properties.maxHealth;
			}
		}
	}

	return defender.properties.health;
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
	}
};

// -------------------Map-------------------
// Setting The Size Of The Map
var game_map = new map([20, 20],[20, 20]);
// -------------------End Of Map-------------------

// -------------------Sending And Receiving Information-------------------
// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	const playerID = newPlayerID();
	let initMapLevel = playerID;
	let spawnPos = createSpawnPosition(initMapLevel);
	sock.join("level " + initMapLevel);
	// Initializing The Player To The Client
	sock.compress(true).emit('initSelf', playerID, game_map.mapLevel[initMapLevel].levelPlayerArray, playerArray.length,
							 game_map.getInitMap(spawnPos, initMapLevel, [1, 1]), initPlayerProjectile(initMapLevel),
							 game_map.mapLevel[initMapLevel].levelMonsterArray, monsterArray.length, initMapLevel);

	console.log("new player joined, ID: ", playerID);

	// Initializing Collectable Item To The Client
	sock.compress(true).emit('initItem', itemArray, itemInfoArray);
	
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	// Player Related
	sock.on('newName', (playerName) => CreateNewPlayer(playerID, playerName, spawnPos, initMapLevel));
	sock.on('newPos', (Pos) => UpdatePlayerPosition(Pos, playerID));
	sock.on('disconnect', (Info) => clientDisconnect(Info, playerID));
	sock.on('requireBlock', (blockPosList) => sock.compress(true).emit('addBlocks', game_map.getUpdateBlock(blockPosList, playerArray[playerID].mapLevel)));

	// Creature Related
	sock.on('creatureInfo', (creatureInfo) => creatureInfoChange(creatureInfo));

	// Item Related
	sock.on('serverCreatureItemArray', (additionalItemID, updatePlayerID, removeItemID) => io.compress(true).emit('clientCreatureItemArray', creatureItemArrayUpdate(additionalItemID, updatePlayerID, removeItemID), updatePlayerID, removeItemID));
	sock.on('serverNewItem', (newItemID, newItemPosition) => io.compress(true).emit('clientNewItem', newItem(newItemID, newItemPosition), newItemPosition, newItemIndex));
	sock.on('deleteItem', (removeItemID) => io.compress(true).emit('removeItem', deleteItem(removeItemID)));

	// Projectile Related
	sock.on('newProjectile', (projectileSpawnInfo) => spawnProjectile(projectileSpawnInfo));

	// Client Frame Update
	sock.on('clientFrame', () => sock.compress(true).emit('updateFrame', ClientFrameUpdate(playerArray[playerID].mapLevel)));

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
for (let i = 0; i < 500; ++i){
	createNewMonster(0, createSpawnPosition(0), 0);
}

//createNewMonster(0, [0, 0, 1]);

