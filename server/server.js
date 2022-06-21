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

// Function Used To Create A New Player Using Two Parameters
const CreateNewPlayer = (playerID, playerName) => {
	// Similar To A Struct
	let playerInfo  = {
		ID: playerID,
		name: playerName,
		position: [0, 0, 1],
		health: 100
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

// When Client Is Disconnected
const clientDisconnect = (Info, playerID) => {
	if (playerArray[playerID] != null){
		console.log("Player ID:", playerID, " Name:", playerArray[playerID].name, "is disconnected!  Info:", Info);
		playerArray[playerID] = null;
	}
	return playerID
};

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

// Setting The Size Of The Map
var game_map = new map([3, 3],[50, 50]);

// ID Of Player
var ID_count = 0;

// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	
	const playerID = newPlayerID(ID_count);
	

	// Initializing The Player To The Client
	sock.emit('initSelf', playerID, playerArray, game_map);
	console.log("new player joined, ID: ", playerID);
	
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	sock.on('newName', (playerName) => io.emit('newPlayer', CreateNewPlayer(playerID, playerName),playerArray.length));
	sock.on('newPos', (Pos) => io.emit('clientPos', UpdatePlayerPosition(Pos, playerID)));
	sock.on('disconnect', (Info) => io.emit('clientDisconnect', clientDisconnect(Info, playerID)));

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
