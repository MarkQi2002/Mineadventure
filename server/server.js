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



// -------------------Camp-------------------
/*
var campArray = [];
campArray.length = 32;
var newCampIndex = 0;

class camp{
	constructor(name){
		newCampIndex = newDynamicArrayID(campArray, newCampIndex, 32, "Camp List")
		campArray[newCampIndex] = this;
		this.friendlyFire = false;
		this.ID = newCampIndex;
		this.name = name;
		this.members = [];
		this.enemyCamp = [];
		this.friendCamp = [];
	}

	IsAttackable([creatureType, ID]){
		if (this.friendlyFire) return true;
		
		let theCampID;
		if (creatureType == "player"){
			theCampID = playerArray[ID].camp;
		}else{
			theCampID = monsterArray[ID].camp;
		}

		if (this.IsFriend(theCampID) || this.IsMember([creatureType, ID]))return false;
		
		return true;

	}

	IsMember([creatureType, ID]){
		// Return If the Creature ID Is Already Inside
		if (creatureType == "player"){
			if (playerArray[ID].camp == this.ID) return true;
		}else{
			if (monsterArray[ID].camp == this.ID) return true;
		}
		return false;
	}

	IsEnemy(theCampID){
		let index = this.enemyCamp.indexOf(theCampID);
		if (index == -1) return false;
		return true;
	}

	IsFriend(theCampID){
		let index = this.friendCamp.indexOf(theCampID)
		if (index == -1) return false;
		return true
	}

	addMember([creatureType, ID]){
		// Return If the Creature ID Is Already Inside
		if(this.IsMember([creatureType, ID])) return;

		if (creatureType == "player"){
			playerArray[ID].camp = this.ID;
		}else{
			monsterArray[ID].camp = this.ID;
		}

		this.members.push([creatureType, ID]);

	}

	addEnemy(theCampID){
		// Return If the Camp ID Is Already Inside
		if (theCampID >= campArray.length || this.IsEnemy(theCampID)) return;

		// If FriendCamp Has The Came ID, Remove It
		if (this.IsFriend(theCampID)) this.friendCamp.splice(i, 1); // 2nd parameter means remove one item only
		this.enemyCamp.push(theCampID);

	}

	addFriend(theCampID){
		// Return If the Camp ID Is Already Inside
		if (theCampID >= campArray.length || this.IsFriend(theCampID)) return;

		// If EnemyCamp Has The Came ID, Remove It
		if (this.IsEnemy(theCampID)) this.enemyCamp.splie(i, 1); // 2nd parameter means remove one item only
		this.friendCamp.push(theCampID);
	}

	removeMember([creatureType, ID]){
		for (let index = 0; index < this.members.length; ++index){
			if (this.members[index].creatureType == creatureType && this.members[index].ID == ID){
				this.members.splie(index, 1);
				return;
			}
		}
	}

	removeEnemy(theCampID){
		let index = this.enemyCamp.indexOf(theCampID);
		if (index > -1) this.enemyCamp.splie(index, 1);
	}

	removeFriend(theCampID){
		let index = this.friendCamp.indexOf(theCampID);
		if (index > -1) this.friendCamp.splie(index, 1);
	}
}*/



function campInfo(){
	this["defaultPlayer"] = -100
	this["defaultMonster"] = 0
	this["monsterKiller"] = 0
}

function IsAttackable(attackerCampInfo, defenderCamp){
	return attackerCampInfo[defenderCamp] < 50;
}
// -------------------End Of Camp-------------------

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
function creatureInfoClass(ID, creatureType, name, initPos, mapLevel, camp) {
	// Creature Identification Information
	this["ID"] = ID;
	this["creatureType"] = creatureType;
	this["name"] = name;
	this["position"] =  initPos;
	this["mapLevel"] =  mapLevel;
	this["camp"] = camp
	this["campInfo"] = new campInfo();

	this["lastBlockPos"] = [initPos[0] / game_map.blockSize.x >> 0, initPos[1] / game_map.blockSize.y >> 0];
		
	// Creature Properties Information
	this["properties"] = new properties();
	
	// Creature Item Array
	this["creatureItemArray"] = {};
}

// Generate Spawn Position Without Collision With Wall
function createSpawnPosition(mapLevelIndex) {
	// Variable Declaration
	let mapX, mapY;

	let findCount = 0;
	// Randomly Generate XY Coordinate Until Found One That Doesn't Collide With The Wall
	while (findCount < 100) {
		mapX = (Math.random() * game_map.blockNumber.x * game_map.blockSize.x) >> 0;
		mapY = (Math.random() * game_map.blockNumber.y * game_map.blockSize.y) >> 0;
		let unit = game_map.mapLevel[mapLevelIndex].getUnit([mapX, mapY]);
		if (unit != null && !(game_map.getAllChildUnitCollision(unit))) break;
		++findCount;
	}

	// Return Valid Position XY Coordinate
	return [mapX, mapY];
}

function createSurroundingSpawnPosition(mapLevelIndex,[blockX,blockY], [blockHalfRangeX, blockHalfRangeY], [spawnMinRangeX, spawnMinRangeY]) {
	// Variable Declaration
	let mapX, mapY;

	let centerMapX = (blockX + 0.5) * game_map.blockSize.x >> 0;
	let centerMapY = (blockY + 0.5) * game_map.blockSize.y >> 0;
	let findCount = 0;
	// Randomly Generate XY Coordinate Until Found One That Doesn't Collide With The Wall
	while (findCount < 100) {
		mapX = ((Math.random() * (1 + blockHalfRangeX * 2) - blockHalfRangeX + blockX) * game_map.blockSize.x) >> 0;
		mapY = ((Math.random() * (1 + blockHalfRangeY * 2) - blockHalfRangeY + blockY) * game_map.blockSize.y) >> 0;
		if (Math.abs(centerMapX - mapX) < spawnMinRangeX || Math.abs(centerMapY - mapY) < spawnMinRangeY) continue;
		let unit = game_map.mapLevel[mapLevelIndex].getUnit([mapX, mapY]);
		if (unit != null && !(game_map.getAllChildUnitCollision(unit))) break;
		++findCount;
	}

	// Return Valid Position XY Coordinate
	return [mapX, mapY];
}

// Exponential Level Up Function
function experienceRequire(level) {
	// Calculate EXP Required To Level Up
	return Math.floor(level * 100 * Math.exp((level - 1) / 15));
}

// Creature Add Level
function levelUpLocal(creatureInfo, addLevel) {
	// Increase Creature Properties Based On Level Up Growth Rate
	creatureInfo.properties.level += addLevel;
	creatureInfo.properties.health += creatureInfo.properties.maxHealthGrowth * addLevel;
	creatureInfo.properties.maxHealth += creatureInfo.properties.maxHealthGrowth * addLevel;
	creatureInfo.properties.attackDamage += creatureInfo.properties.attackDamageGrowth * addLevel;
	creatureInfo.properties.attackSpeed += creatureInfo.properties.attackSpeedGrowth * addLevel;
	creatureInfo.properties.criticalRate += creatureInfo.properties.criticalRateGrowth * addLevel;

}

// This Function Is Called When Creature Gain EXP
function levelUp(creatureInfo, experience) {
	// Add EXP Gained And Calculate Required EXP To Level Up
	creatureInfo.properties.experience += experience;
	let creaturelevel = creatureInfo.properties.level;
	let nextLevelEXP = experienceRequire(creaturelevel);
	let number = 0;
	// Continuously Level Up Creature Until Not Enough EXP To Level Up Further More
	while (creatureInfo.properties.experience >= nextLevelEXP){
		// Level Up And Remove EXP
		creaturelevel += 1;
		creatureInfo.properties.experience -= nextLevelEXP;
		nextLevelEXP = experienceRequire(creaturelevel);
		++ number;
	}

	levelUpLocal(creatureInfo, number);

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
	io.to("level " + creatureInfo.mapLevel).compress(true).emit('creatureInfoChange', [[[creatureInfo.creatureType, creatureInfo.ID], levelUpInfo]]);
}


// Get A New ID From A DynamicArray
function newDynamicArrayID(dynamicArray, arrayCount, IncreaseAmount, printName){
	let exceedCount = 0;
	// Stop Untill Get An playerID Corresponding To An Empty Space In dynamicArray
	while (dynamicArray[arrayCount] != null) {
		arrayCount = (arrayCount + 1) % dynamicArray.length;
		exceedCount++;

		// If Exceed Max dynamicArray Length
		if (exceedCount >= dynamicArray.length) {
			dynamicArray.length += IncreaseAmount;
			console.log("Exceed Max " + printName + " Length, Double The" + printName + "Length! Current Length: ", dynamicArray.length);
		}
	}

	// Return ID_Count
	return arrayCount;
}

// Check Whether Creature Has Been Hit Or Not
function creatureOnHit(creatureInfo, theMapLevel) {
	// Get The Block The Creature Located Within
	let theBlock = theMapLevel.getBlock([(creatureInfo.position[0] + 0.5) >> 0,
										 (creatureInfo.position[1] + 0.5) >> 0]);
	
	// If Outside Border Return
	if (theBlock == null) return;

	// Extract All Projectiles Within The Block
	let blockProjectileList = theBlock.projectileList.getInorderList();

	// Variable Declaration
	let theProjectile;

	// Loop Through All Projectiles Within blockProjectileList
	for (let projectileIndex = 0; projectileIndex < blockProjectileList.length; ++projectileIndex) {
		// Get The Projectile
		theProjectile = theMapLevel.levelProjectileArray[blockProjectileList[projectileIndex]];

		// If The Index Is Empty Or The Projectile Is In The Process Of Deletion, Continue
		if (theProjectile == null || theProjectile == "deletion") continue;

		// Check Attacker Information
		let attackerInfo = theProjectile.damageInfo.attacker;

		// Is Not Attackable
		if((attackerInfo[0] == creatureInfo.creatureType && attackerInfo[1] == creatureInfo.ID) || 
			!IsAttackable(attackerInfo[2], creatureInfo.camp)) continue;

		// Calculate XY Coordinate Difference
		let diffX = theProjectile.position[0] - creatureInfo.position[0];
		let diffY = theProjectile.position[1] - creatureInfo.position[1];

		// Calculate Manhattan Distance
		if (Math.abs(diffX) + Math.abs(diffY) < 2){
			// Calculate Z Coordinate Difference
			let diffZ = theProjectile.position[2] - creatureInfo.position[2];
			
			// Calculate Distance To Squared
			if (diffX * diffX + diffY * diffY + diffZ * diffZ <= 0.49){
				// Updating Creature Information
				creatureInfoChange([[[creatureInfo.creatureType, creatureInfo.ID], {"damage": theProjectile.damageInfo}]]);
				if (AI_controllerList[creatureInfo.ID] != null) AI_controllerList[creatureInfo.ID].setAggro(attackerInfo[0], attackerInfo[1], 1);
				// Set Projectile Deletion Tag
				theMapLevel.levelProjectileArray[blockProjectileList[projectileIndex]] = "deletion";

				// Creature On Hit Health Below 0
				if (creatureInfo.properties["health"] <= 0){
					if (creatureInfo.creatureType == "player"){
						// Do Nothing
					} else {
						// Monster Creature, Delete Monster And Give Attacker EXP
						itemDrop(creatureInfo.ID);
						deleteMonster(creatureInfo.ID);
						if (attackerInfo[0] == "player" && playerArray[attackerInfo[1]] != null) levelUp(playerArray[attackerInfo[1]], creatureInfo.properties.level * 100);
						return;
					}
				}
			}
		}
	}
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
											mapLevel,
											"defaultPlayer");

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
		if (thePlayer == null) continue; 
		
		// Check Player Collision With Projectile
		creatureOnHit(thePlayer, theMapLevel);

		updateSurroundingMonster(delta, thePlayer, theMapLevel);
	}
}

// Pos Is An Array Of Size 3 (XYZ)
const UpdatePlayerPosition = (Pos, playerID) => {
	// Updating Player Position
	if (playerArray[playerID] != null) {
		let [blockX, blockY] = [Pos[0] / game_map.blockSize.x >> 0, Pos[1] / game_map.blockSize.y >> 0];
		if (blockX != playerArray[playerID].lastBlockPos[0] || blockY != playerArray[playerID].lastBlockPos[1]){
			let theMapLevel = game_map.mapLevel[playerArray[playerID].mapLevel];
			let lastBlock = theMapLevel.getBlockByBlockPos([playerArray[playerID].lastBlockPos[0], playerArray[playerID].lastBlockPos[1]]);

			if (lastBlock != null){
				let theBlockArray = lastBlock.blockCreatureArray;
				for (let i = 0; i < theBlockArray.length; ++i){
					if (theBlockArray[i] != null && theBlockArray[i].ID == playerArray[playerID].ID && theBlockArray[i].creatureType == playerArray[playerID].creatureType){
						lastBlock.blockCreatureArray.splice(i, 1);
						break;
					}
				}
			}

			theMapLevel.getBlock([Pos[0], Pos[1]]).blockCreatureArray.push([playerArray[playerID].creatureType, playerArray[playerID].ID]);
			playerArray[playerID].lastBlockPos = [blockX, blockY];
		}

		playerArray[playerID].position = Pos;
		
		// Send To All Player On Same Level
		io.to("level " + playerArray[playerID].mapLevel).compress(true).emit('clientPos', [Pos, playerID]);
	}
};

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

		
		//Remove from blockCreatureArray
		let lastBlock = game_map.mapLevel[mapLevelIndex].getBlockByBlockPos([playerArray[playerID].lastBlockPos[0], playerArray[playerID].lastBlockPos[1]]);
		if (lastBlock != null){
			let theBlockArray = lastBlock.blockCreatureArray;
			for (let i = 0; i < theBlockArray.length; ++i){
				if (theBlockArray[i] != null && theBlockArray[i][1] == playerArray[playerID].ID && theBlockArray[i][0] == playerArray[playerID].creatureType){
					lastBlock.blockCreatureArray.splice(i, 1);
					break;
				}
			}
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
							 game_map.mapLevel[newMapLevelIndex].levelMonsterArray, monsterArray.length, newMapLevelIndex,
							 game_map.mapLevel[newMapLevelIndex].itemArray, itemInfoArray);
}

// -------------------End Of Player-------------------

// -------------------Monster-------------------
var AI_controllerList = [];
AI_controllerList.length = 100;
var monsterArray = [];
monsterArray.length = 100;
var monster_ID_Count = 0;
var monsterInfoArray = [[{"name": "Fakedoge", "type": "burrower",
						  "properties": {"health": 50, "maxHealth": 50, "attackDamage": 10, "attackSpeed": 0.5, "moveSpeed": 3},
						  "camp": "defaultMonster",
					      "campInfo": {"defaultMonster": 100}
						},{}],
						
						[{"name": "Fakecat", "type": "burrower", 
						  "properties":{"health": 100, "maxHealth": 100, "attackDamage": 20, "attackSpeed": 0.5, "moveSpeed": 3},
						  "camp": "defaultMonster",
					      "campInfo": {"defaultMonster": 100}
						},{}],


					];

// Creating A New Monster
function createNewMonster(ID, level, spawnPos, mapLevel, monsterID) {
	// Input Control
	if (monsterID == null){
		monster_ID_Count = newDynamicArrayID(monsterArray, monster_ID_Count, 100, "Monster Array");
		monsterID = monster_ID_Count;
	}
	else if (monsterArray[monsterID] != null) deleteMonster(monsterID);

	// Monster Information
	let monsterInfo  = new creatureInfoClass(monsterID,
											"monster",
											monsterInfoArray[ID][0].name,
											[spawnPos[0], spawnPos[1], 1],
											mapLevel,
											monsterInfoArray[ID][0].camp);
	
	// Monster Can't Attack Each Other
	//monsterInfo.campInfo.defaultMonster = 100;
	for (let [key, value] of Object.entries(monsterInfoArray[ID][0]["campInfo"])) {
		monsterInfo.campInfo[key] = value;
	}
											
	// Add Properties By ID
	for (let [key, value] of Object.entries(monsterInfoArray[ID][0]["properties"])) {
		monsterInfo.properties[key] = value;
	}

	// Saving Monster Info To Monster Array
	monsterArray[monsterID] = monsterInfo;

	// Set Level
	if (level < 1) level = 1;
	levelUpLocal(monsterInfo, level - 1);


	// Add Monster In Block
	let theMapLevel = game_map.mapLevel[mapLevel];
    let lastBlock = theMapLevel.getBlockByBlockPos([monsterInfo.lastBlockPos[0], monsterInfo.lastBlockPos[1]]);
    lastBlock.blockCreatureArray.push([monsterInfo.creatureType, monsterInfo.ID]);



	// If The AI_contollerList Is Not Long Enought Increment It
	if (monsterID >= AI_controllerList.length){
		AI_controllerList.length = monsterID + 1;
	}

	// Creating A New AI Controller Based On MonsterInfo
	AI_controllerList[monsterID] = new AI_controller(monsterInfo);

	// Log The MonsterInfo On The Server Side
	//console.log(monsterInfo);

	// Add Monster Into mapLevel
	theMapLevel.levelMonsterArray.push(monsterInfo);

	// Send Information To Client To Generate A New Monster
	io.to("level " + mapLevel).compress(true).emit('newMonster', monsterInfo, monsterArray.length);

	// Return The Monster Information
	return monsterInfo;
}

// Updating Monster
function updateSurroundingMonster(delta, thePlayer, theMapLevel) {
	// Variable Declaration
	let monsterID, theBlock;
	let surroundingMonsterNumber = 0;

	// All Monster Surround The Player Within theMapLevel
	let surroundingBlocks = game_map.getSurroundingBlock(thePlayer.lastBlockPos, thePlayer.mapLevel, [1, 1])
	for (let i = 0; i < surroundingBlocks.length; ++i) {
		theBlock = surroundingBlocks[i][2];
		if (theBlock.updated) continue;
		theBlock.updated = true;
		theMapLevel.resetBlockUpdated.push(theBlock);
		for (let ii = 0; ii < theBlock.blockCreatureArray.length; ++ii) {
			
			if (theBlock.blockCreatureArray[ii][0] == "player") continue;

			monsterID = theBlock.blockCreatureArray[ii][1];
		
			// If Monster Is Empty Continue
			if (AI_controllerList[monsterID] == null) continue;

			++surroundingMonsterNumber;

			// Extract The Creature
			theMonster = AI_controllerList[monsterID].creature;

			// AI controller update
			AI_controllerList[monsterID].update(delta, game_map, spawnProjectile, playerArray, monsterArray);
			theMapLevel.updateMonsterPos.push([theMonster.position, monsterID]);

			// Check Monster Collision With Projectile
			creatureOnHit(theMonster, theMapLevel);
		}
	}

	if (surroundingMonsterNumber < 10){
		let newSpawnPos = createSurroundingSpawnPosition(thePlayer.mapLevel, thePlayer.lastBlockPos, [1, 1], [game_map.blockSize.x / 2, game_map.blockSize.y / 2])
		let [monsterInfoID, minLevel, maxLevel, levelHalfRange] = theMapLevel.monsterSpawnFunction(theMapLevel.monsterSpawnInfo);
		//thePlayer.properties.level
		

		let randomNum = Math.random() * 2 - 1;

		let spawnLevel = ((randomNum > 1 ? levelHalfRange : -levelHalfRange) * Math.log(Math.abs(randomNum)) / Math.log(50) + thePlayer.properties.level) >> 0;

		if (spawnLevel > maxLevel) spawnLevel = maxLevel;
		else if (spawnLevel < minLevel)spawnLevel = minLevel;
		console.log(spawnLevel)
		createNewMonster(monsterInfoID, spawnLevel, newSpawnPos, thePlayer.mapLevel);
	}
}


// Randomly Generating An Item ID Based On Rarity Distribution
function itemDrop(monsterID){
	// Variable Declaration For Spawning Item After Monster Dead
	let newItemID;
	let newItemPosition = monsterArray[monsterID].position;

	let monsterDropRate = 1.00;
	let randomNumber = Math.random();
	if (randomNumber < 0.60 * monsterDropRate) newItemID = itemRarityArray[0][Math.floor(Math.random() * itemRarityArray[0].length)];
	else if (randomNumber < 0.85 * monsterDropRate) newItemID = itemRarityArray[1][Math.floor(Math.random() * itemRarityArray[1].length)];
	else if (randomNumber < 0.95 * monsterDropRate) newItemID = itemRarityArray[2][Math.floor(Math.random() * itemRarityArray[2].length)];
	else if (randomNumber < 1.00 * monsterDropRate) newItemID = itemRarityArray[3][Math.floor(Math.random() * itemRarityArray[3].length)];	

	// Spawning The Actual Item
	if (newItemID != null && typeof newItemID != "undefined") newItem(newItemID, newItemPosition, monsterArray[monsterID].mapLevel);
}

// Deleting A Monster Based On The Input Monster ID
function deleteMonster(monsterID) {
	// When The MonsterArray Corresponding To MonsterID Is Not NULL Spawn An Item
	if (monsterArray[monsterID] != null) {
		// Get Which Map Level The Monster Is In
		let mapLevelIndex = monsterArray[monsterID].mapLevel;

		// Remove The Monster From mapLevel
		let index = game_map.mapLevel[mapLevelIndex].levelMonsterArray.indexOf(monsterArray[monsterID]);
		if (index > -1) { // Only Splice Array When Item Is Found
			game_map.mapLevel[mapLevelIndex].levelMonsterArray.splice(index, 1); // 2nd Parameter Means Remove One Item Only
		}
		
		//Remove from blockCreatureArray
		let lastBlock = game_map.mapLevel[mapLevelIndex].getBlockByBlockPos([monsterArray[monsterID].lastBlockPos[0], monsterArray[monsterID].lastBlockPos[1]]);
		if (lastBlock != null){
			let theBlockArray = lastBlock.blockCreatureArray;
			for (let i = 0; i < theBlockArray.length; ++i){
				if (theBlockArray[i] != null && theBlockArray[i][1] == monsterArray[monsterID].ID && theBlockArray[i][0] == monsterArray[monsterID].creatureType){
					lastBlock.blockCreatureArray.splice(i, 1);
					break;
				}
			}
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

// -------------------End Of Monster-------------------

// -------------------Item-------------------
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
	let thePlayer = playerArray[updatePlayerID];
	if (thePlayer == null) return;

	// Remove Item From The Item Array
	let mapLevelIndex = thePlayer.mapLevel;
	if (removeItemID >= 0 && removeItemID < game_map.mapLevel[mapLevelIndex].itemArray.length) deleteItem(removeItemID, mapLevelIndex);

	let itemAddProperty = {};
	for (let [key, value] of Object.entries(itemInfoArray[additionalItemID][1])) {
		itemAddProperty[key] = JSON.parse(JSON.stringify(value));
	}

	// Update Player Property Based On Item
	let playerInfo = [[["player", updatePlayerID], itemAddProperty]];
	creatureInfoChange(playerInfo);

	// Update Server Side Player Item Array
	if (thePlayer.creatureItemArray[additionalItemID] != null)
		thePlayer.creatureItemArray[additionalItemID]++;
	else
		thePlayer.creatureItemArray[additionalItemID] = 1;

	io.to("level " + mapLevelIndex).compress(true).emit('clientCreatureItemArray', additionalItemID, updatePlayerID, removeItemID);
}

// Creating An Item When Client Send A Request
const newItem = (newItemID, newItemPosition, mapLevelIndex) => {
	let theMapLevel = game_map.mapLevel[mapLevelIndex];
	// Indexing Item Array To Include The New Item
	theMapLevel.currentItemIndex = newDynamicArrayID(theMapLevel.itemArray, theMapLevel.currentItemIndex, 100, "Item Array");
	let itemIndex = theMapLevel.currentItemIndex;

	// Save The ItemID Into The Server Item Array
	theMapLevel.itemArray[itemIndex] = {"itemID": newItemID, "itemPosition": newItemPosition};
	
	// Log The ItemInfo On The Server Side
	console.log(itemInfoArray[newItemID], itemIndex);
	
	io.to("level " + mapLevelIndex).compress(true).emit('clientNewItem', newItemID, newItemPosition, itemIndex);
};

// Delete Item
const deleteItem = (removeItemID, mapLevelIndex) => {
	removeItem(removeItemID, mapLevelIndex);
	io.to("level " + mapLevelIndex).compress(true).emit('removeItem', removeItemID);
};

// Removing An Item As A Function
function removeItem(removeItemID, mapLevelIndex) {
	let theMapLevel = game_map.mapLevel[mapLevelIndex];
	if (theMapLevel.itemArray[removeItemID] != null){
		console.log("Deleting Item ", removeItemID);
		delete theMapLevel.itemArray[removeItemID];
		theMapLevel.itemArray[removeItemID] = null;
	}
}

// -------------------End Of Item-------------------

// -------------------Projectile-------------------
// Spawning New Projectiles
function spawnProjectile([projectileInfo, mapLevelIndex]){
	let projectileSpawnInfo = [];
	let theMapLevel = game_map.mapLevel[mapLevelIndex];
	let newProjectileID, theBlock;
	for (let i = 0; i < projectileInfo.length; i++){
		theMapLevel.projectile_count = newDynamicArrayID(theMapLevel.levelProjectileArray, theMapLevel.projectile_count, 100, "Projectile Array");
		newProjectileID = theMapLevel.projectile_count;
		theMapLevel.levelProjectileArray[newProjectileID] = projectileInfo[i];
		if (theMapLevel.clearBlockProjectileArray.length < theMapLevel.levelProjectileArray.length){
			theMapLevel.clearBlockProjectileArray.length = theMapLevel.levelProjectileArray.length;
		}
		theBlock = theMapLevel.getBlock([(projectileInfo[i].position[0]+ 0.5) >> 0, (projectileInfo[i].position[1]+ 0.5) >> 0]);
		if (theBlock != null){
			theBlock.projectileList.insert(newProjectileID);
			theMapLevel.clearBlockProjectileArray[newProjectileID] = [theBlock];
		}else{
			theMapLevel.clearBlockProjectileArray[newProjectileID] = [];
		}
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
	theMapLevel.updateProjectileArray =[];
	let deleteProjectileList = [];
	let deleteUnitList = [];
	let projectilePos;

	//for (let i = 0; i < theMapLevel.clearBlockProjectileArray.length; i++){
		//theMapLevel.clearBlockProjectileArray[i].projectileList = [];
	//}

	//theMapLevel.clearBlockProjectileArray = [];

	let projectileArray, unit, theBlock, mapX, mapY, unitIndexX, unitIndexY, floatBlockX, floatBlockY, blockX, blockY, OnXBorder, lastBlock;
	// Check All Projectile List
	for (let i = 0; i < theMapLevel.levelProjectileArray.length; i++) {
		projectileArray = theMapLevel.levelProjectileArray[i];
		if (projectileArray == "deletion"){
			// For Delete Projectile
			deleteProjectile(theMapLevel, i);
			deleteProjectileList.push(i);

		} else if (projectileArray != null) {
			let [lastBlockX, lastBlockY] = [(projectileArray.position[0] + 0.5) / game_map.blockSize.x >> 0, (projectileArray.position[1] + 0.5) / game_map.blockSize.y >> 0];
			projectileArray.position[0] += projectileArray.initVelocity[0] * delta;
			projectileArray.position[1] += projectileArray.initVelocity[1] * delta;
			

			projectilePos = [
				projectileArray.position[0],
				projectileArray.position[1]
			];
			
			[mapX, mapY] = [(projectileArray.position[0] + 0.5) >> 0, (projectileArray.position[1] + 0.5) >> 0];
			[floatBlockX, floatBlockY] = [mapX / theMapLevel.blockSize.x, mapY / theMapLevel.blockSize.y];
			[blockX, blockY] = [floatBlockX >> 0, floatBlockY >> 0];


			if (theMapLevel.IsNotInMapRange(floatBlockX, floatBlockY)){
				theBlock = null;
				unit = null;
			}else{
				theBlock = theMapLevel.blockList[blockY][blockX];
				[unitIndexX, unitIndexY] = [mapX % game_map.blockSize.x, mapY % game_map.blockSize.y];
				unit = theBlock.unitList[unitIndexY][unitIndexX];
			}

			
			if (unit == null){
				// For Delete Projectile
				deleteProjectile(theMapLevel, i);
				deleteProjectileList.push(i);
				continue;
			} else {
				if (getAllChildUnitDestroyable(unit)){
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
						deleteProjectile(theMapLevel, i);
						deleteProjectileList.push(i);


						if (game_map.unitIDList[unit.ID].destroyable){
							unit.ID = 15;
							unit.Height = 0;
						}
						unit.childUnit = null;
						deleteUnitList.push([[mapX, mapY], unit]);
						continue;
					}
				}
			}

			// Update Only If Block Change
			if (lastBlockX != blockX || lastBlockY != blockY){
				for (let ii = 0; ii < theMapLevel.clearBlockProjectileArray[i].length; ++ii){
					lastBlock = theMapLevel.clearBlockProjectileArray[i][ii];
					lastBlock.projectileList.remove(i);
				}
				theMapLevel.clearBlockProjectileArray[i] = [];

				// Pushing Information To The Lists
				theBlock.projectileList.insert(i);
				theMapLevel.clearBlockProjectileArray[i].push(theBlock);


				OnXBorder = false;
				// For Projectile On the Border Of The Block
				if (unitIndexX == 0){
					blockX = (floatBlockX - 1) >> 0;
					if (blockX >= 0){
						theBlock = theMapLevel.blockList[floatBlockY >> 0][blockX];
						theBlock.projectileList.insert(i);
						theMapLevel.clearBlockProjectileArray[i].push(theBlock);
						OnXBorder = true;
					}
				}else if (unitIndexX == theMapLevel.blockSize.x - 1){
					blockX = (floatBlockX + 1) >> 0;
					if (blockX < theMapLevel.blockNumber.x){
						theBlock = theMapLevel.blockList[floatBlockY >> 0][blockX];
						theBlock.projectileList.insert(i);
						theMapLevel.clearBlockProjectileArray[i].push(theBlock);
						OnXBorder = true;
					}
				}

				if (unitIndexY == 0){
					blockY = (floatBlockY - 1) >> 0;
					if (blockY >= 0){
						theBlock = theMapLevel.blockList[blockY][floatBlockX >> 0];
						theBlock.projectileList.insert(i);
						theMapLevel.clearBlockProjectileArray[i].push(theBlock);
						if(OnXBorder){
							theBlock = theMapLevel.blockList[blockY][blockX];
							theBlock.projectileList.insert(i);
							theMapLevel.clearBlockProjectileArray[i].push(theBlock);
						}
					}
				}else if (unitIndexY == theMapLevel.blockSize.y - 1){
					blockY = (floatBlockY + 1) >> 0;
					if (blockY < theMapLevel.blockNumber.y){
						theBlock = theMapLevel.blockList[blockY][floatBlockX >> 0];
						theBlock.projectileList.insert(i);
						theMapLevel.clearBlockProjectileArray[i].push(theBlock);
						if(OnXBorder){
							theBlock = theMapLevel.blockList[blockY][blockX];
							theBlock.projectileList.insert(i);
							theMapLevel.clearBlockProjectileArray[i].push(theBlock);
						}
					}
				}
			} 

        	
			theMapLevel.updateProjectileArray.push([i, projectilePos]);
		}
	}
	
	// Sending Deletion Event To Clients
	if (deleteProjectileList.length > 0){
		io.to("level " + mapLevelIndex).emit('deleteEvent', [deleteProjectileList, deleteUnitList]);
	}
}

function deleteProjectile(theMapLevel, projectileID){
	let lastBlock;
	for (let ii = 0; ii < theMapLevel.clearBlockProjectileArray[projectileID].length; ++ii){
		lastBlock = theMapLevel.clearBlockProjectileArray[projectileID][ii];
		lastBlock.projectileList.remove(projectileID);
	}

	theMapLevel.levelProjectileArray[projectileID] = null;
	theMapLevel.clearBlockProjectileArray[projectileID] = null;
}


function getAllChildUnitDestroyable(unit){
	return game_map.unitIDList[unit.ID].destroyable || (unit.childUnit == null ? false : getAllChildUnitDestroyable(unit.childUnit));
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
	let theMapLevel;
	for (let i = 0; i < game_map.mapLevel.length; ++i){
		// Reset all block.updated to false
		theMapLevel = game_map.mapLevel[i];
		for (let ii = 0; ii < theMapLevel.resetBlockUpdated.length; ++ii){
			theMapLevel.resetBlockUpdated[ii].updated = false;
		}
		theMapLevel.resetBlockUpdated = [];
		theMapLevel.updateMonsterPos = [];
		updateProjectile(delta, i);
		updatePlayer(delta, theMapLevel);
		

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
game_map.createMapLevel();
// -------------------End Of Map-------------------

// -------------------Sending And Receiving Information-------------------
// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	ID_Count = newDynamicArrayID(playerArray, ID_Count, 32, "Player Array");
	const playerID = ID_Count;
	let initMapLevel = 0;
	let spawnPos = createSpawnPosition(initMapLevel);
	// Initializing The Player To The Client
	setMapLevel(sock, spawnPos, playerID, initMapLevel);

	console.log("new player joined, ID: ", playerID);
	
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
	sock.on('serverCreatureItemArray', (additionalItemID, updatePlayerID, removeItemID) => creatureItemArrayUpdate(additionalItemID, updatePlayerID, removeItemID));
	sock.on('deleteItem', (removeItemID) => deleteItem(removeItemID, playerArray[playerID].mapLevel));

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


/*
// Spawning 500 Monsters Randomly Throughout The Map
for (let monsterIndex = 0; monsterIndex < 1000; ++monsterIndex){
	createNewMonster(0, createSpawnPosition(0), 0);
}
for (let monsterIndex = 0; monsterIndex < 1000; ++monsterIndex){
	createNewMonster(1, createSpawnPosition(1), 1);
}*/
