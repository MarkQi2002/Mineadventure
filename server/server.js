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
const CreateNewItem = () => {
	// Similar To A Struct
	let itemInfo = {
		itemName: "bloodOrb",
		itemRarity: "Common",
		itemStackType: "Linear",
		itemBuffType: "Defense",
		itemPosition: [1, 1, 1]
	};

	// Indexing Player Array To Include The New Player
	for (let itemIndex = 0; itemIndex < itemArray.length; itemIndex++) {
		if (itemArray[itemIndex] == null) {
			itemArray[itemIndex] = itemInfo;
			newItemID = itemIndex;
			break;
		}
	}
	
	// Log The PlayerInfo On The Server Side
	console.log(itemInfo, newItemID);
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

// Setting The Size Of The Map
var game_map = new map([1, 1],[50, 50]);

// Once A New Player Join, Update To All Other Clients
io.on('connection', (sock) => {
	// Setting The New PlayerID
	const playerID = newPlayerID(ID_count);

	// Initializing The Player To The Client
	sock.emit('initSelf', playerID, playerArray, game_map);
	sock.emit('initItem', itemArray);
	console.log("new player joined, ID: ", playerID);
	
	// Receiving Information From Client And Calling Function
	// sock.on Is The Newly Connected Player (sock), io.emit (Send Information To All Clients)
	// First Parameter Data Name (Same As Client Side), Second Parameter The Actual Data
	sock.on('newName', (playerName) => io.emit('newPlayer', CreateNewPlayer(playerID, playerName), playerArray.length));
	sock.on('newItem', () => io.emit('newItem', CreateNewItem(), newItemID));
	sock.on('deleteItem', (itemIndex) => io.emit('removeItem', deleteItem(itemIndex)));
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
