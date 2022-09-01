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
const {map, pushMap, mapList, unitProperties, unitIDList} = require('./mapClass.js');
pushMap();
const {object, sphere, allObject} = require('./object.js');
const {player, AI, allPlayer, defaultProperties} = require('./serverCreature.js');
const {projectile} = require('./serverProjectile.js');

// An Express Function
const app = express();

// Current Directory, Back One Level, Client Folder
app.use(express.static(`${__dirname}/../client`));

// Create An Server Instance
const server = http.createServer(app);
const io = socketio(server);

const CPUNumber = require('os').cpus().length;
const usingThreadNumber = 7;
const workerNumber = usingThreadNumber < CPUNumber ? usingThreadNumber : CPUNumber - 1;
const { Worker } = require('worker_threads');
var workerList = [];

workerMapList = new Array(workerNumber);
for (let i = 0; i < workerNumber; ++i) workerMapList[i] = [];

for (let i = 0; i < mapList.length; ++i) workerMapList[i % workerNumber].push(mapList[i]);

for (let i = 0; i < workerNumber; ++i){
    var worker = new Worker('./server/worker.js')
	workerList.push(worker);
	
    worker.on('message', (data) => {
		switch(data.type){
			case "updateMap":
				let theProjectile;
				for (i = 0; i < data.projectileRemoveList.length; ++i){
					theProjectile = allObject.list[data.projectileRemoveList[i]];;
					if (theProjectile == null) continue;
					theProjectile.remove();

				}
				

				io.to("level " + data.mapIndex).compress(true).emit('updateMap', data.unitModifiedList, data.projectileRemoveList);
				break;
			case "init":
				console.log("Thread " + i + " is completed!");
				break;
		}
    });

	worker.on('error', (err) => {
		throw err.stack;
	});

    worker.postMessage({
		type: "init",
		workerIndex: i,
		workerNumber: workerNumber,
		workerMapList: workerMapList[i]
	});
}

// Init All Map
for (let i = 0; i < mapList.length; ++i){
	mapList[i].newEmptyMap();
	mapList[i].initMap();
}

// -------------------Server Loop-------------------
// Start Loop
for(i = 0; i < workerList.length; ++i) {
	workerList[i].postMessage({
		type: "update"
	});
}

// -------------------End Of Server Loop-------------------

// Client Is Disconnected
const clientDisconnect = (Info, thePlayer) => {
	// Clear The PlayerID From Player Array
	workerList[thePlayer.mapIndex % workerNumber].postMessage({
		type: "deleteObject",
		ID: thePlayer.ID
	});


	// Send To All Player In Same Map
	io.to("level " + thePlayer.mapIndex).compress(true).emit('clientDisconnect', thePlayer.playerID);

	// Delete This Player's Info
	console.log("Player ID:", thePlayer.playerID, " Name:", thePlayer.name, "is disconnected!  Info:", Info);
	thePlayer.remove();
	delete thePlayer;
};


// Send Player To Map
function sendPlayerToMap(thePlayer, mapIndex, sock){
	thePlayer.mapIndex = mapIndex;

	workerList[mapIndex % workerNumber].postMessage({
		type: "newObject",
		theObject: thePlayer
	});

	// Add Player To The New Map
	sock.join("level " + mapIndex);
	sock.compress(true).emit('initSelf', {
		thePlayer: thePlayer.getInfo(),
		mapIndex: mapIndex,
		defaultProperties: defaultProperties,
		unitProperties: unitProperties,
		map: {
			dataSpace: new Uint32Array(mapList[mapIndex].dataSpace),
			size: mapList[mapIndex].size,
			unitIDList: unitIDList
		},
	});  
}


function clientFrameUpdate(newPos, sendProjectileList, requestObjectList, thePlayer, sock){
	thePlayer.changePosition(newPos);

	let newObjectList = [];
	let theObject;

	// Client Send A New Projectile
	for(i = 0; i < sendProjectileList.length; ++i) {
		theObject = spawnProjectile(sendProjectileList[i], thePlayer);
		if (theObject == null) continue;
		newObjectList.push(theObject.getInfo());
	}

	// Client Get Info To display the Object (First Time)
	for(i = 0; i < requestObjectList.length; ++i) {
		theObject = allObject.list[requestObjectList[i]];
		if (theObject == null) continue;
		newObjectList.push(theObject.getInfo());
	}
	
	// Client Display Creatures
	let displayObjectList = [];

	for(i = 0; i < thePlayer.displayObjectsLength[0]; ++i) {
		theObject = allObject.list[thePlayer.displayObjects[i]];
		if (theObject == null) continue;
		displayObjectList.push([theObject.ID, theObject.getPositionArray()]);
	}
	
	sock.compress(true).emit('updateFrame',
		newObjectList,
		displayObjectList,
	);
}


// Spawning New Projectiles
function spawnProjectile(projectileInfo, sender){
	let theProjectile = new projectile(projectileInfo, sender);

	workerList[theProjectile.mapIndex % workerNumber].postMessage({
		type: "newObject",
		theObject: theProjectile
	});

	return theProjectile;
}



// Spawning New AI
function spawnAI(AIName, mapIndex, spawnPos){
	let theAI = new AI(AIName, mapIndex, spawnPos);

	workerList[theAI.mapIndex % workerNumber].postMessage({
		type: "newObject",
		theObject: theAI
	});

	return theAI;
}


// Command Handler
const commandFromClient = (thePlayer, theCommand, sock) => {
	let otherPlayer;
	switch (theCommand[0]){
		case "ChangeMap":
			

			return;

		case "tpa":
			otherPlayer = allPlayer.list[theCommand[1]];
            if (otherPlayer == null) sock.compress(true).emit('serverMessage', "System", "Can't Find The Player With The ID", "red");
			else sock.compress(true).emit('commandFromServer', ["changePlayerPos", otherPlayer.getPositionArray()]);
			return;

		case "tpn":
			otherPlayer;
            for (let playerIndex = 0; playerIndex < allPlayer.list.length; ++playerIndex) {
                otherPlayer = allPlayer.list[playerIndex];
                if (otherPlayer != null && otherPlayer.name == theCommand[1]) {
					sock.compress(true).emit('commandFromServer', ["changePlayerPos", otherPlayer.getPositionArray()]);
                    return;
                }
            }
			sock.compress(true).emit('serverMessage', "System", "Can't Find The Player With The Name", "red");
			return;

		case "radius":
			thePlayer.setRadius(theCommand[1]);
			sock.compress(true).emit('commandFromServer', ["radius", thePlayer.getRadius()]);
			return;

	}
};

// -------------------Sending And Receiving Information-------------------
// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	let mapIndex = 0;
	var thePlayer, playerID;

	sock.on('newName', (playerName) => {
		thePlayer = new player(playerName, mapIndex);

		playerID = thePlayer.playerID;

		if (thePlayer.name == "") thePlayer.name = "Player " + playerID;

		// Initializing The Player To The Client
		sendPlayerToMap(thePlayer, mapIndex, sock);

		console.log("new player joined, name: " + thePlayer.name + "	ID: ", playerID);
	});


	for (let i = 0; i < 1000; i ++){
		spawnAI("reee", 0);
	}
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	// Player Related
	sock.on('disconnect', (Info) => clientDisconnect(Info, thePlayer));

	// Creature Related
	//sock.on('creatureInfo', (creatureInfo) => creatureInfoChange(creatureInfo));

	// Item Related
	//sock.on('serverCreatureItemArray', (additionalItemID, updatePlayerID, removeItemID) => creatureItemArrayUpdate(additionalItemID, updatePlayerID, removeItemID));
	//sock.on('deleteItem', (removeItemID) => deleteItem(removeItemID, playerArray[playerID].mapLevel));


	// Client Frame Update
	sock.on('clientFrame', (newPos, sendProjectileList, requestObjectList) => clientFrameUpdate(newPos, sendProjectileList, requestObjectList, thePlayer, sock));

	// New Message From Client
	sock.on('newMessage', (name, text) => io.compress(true).emit('serverMessage', name, text, "white"));


	sock.on('commandFromClient', (newCommand) => commandFromClient(thePlayer, newCommand, sock));

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



