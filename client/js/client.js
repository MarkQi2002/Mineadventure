
// Constructing An Player Object And Storing In The Client Side playerArray
function spawnPlayer(playerInfo){
	let new_player = new player(playerInfo.name,
								playerInfo.position,
								playerInfo.health);

	playerArray[playerInfo.ID] = new_player;
	return new_player;
}

// Initialization Every Player Before You Enter The Game
const initSelf = (severPlayerID, serverPlayerArray, serverMap) => {
	clientPlayerID = severPlayerID;
	playerArray.length = serverPlayerArray.length;
	for (let i = 0; i < serverPlayerArray.length; i++) {
		if (serverPlayerArray[i] != null){
			spawnPlayer(serverPlayerArray[i]);
		}
	}

	game_map = new map(serverMap);
};

// Initialization Myself And All Future Players
const newPlayer = (playerInfo, playerArrayLength) => {
	playerArray.length = playerArrayLength;
	let new_player = spawnPlayer(playerInfo);
	// Setting The Controller To The Player When First Enter
	if (playerInfo.ID == clientPlayerID){
		player_controller = new controller(new_player, camera);
		animate();
	}
};

// Update Every Player's Position
const playerPositionUpdate = ([Pos, PlayerID]) => {
	if (PlayerID != clientPlayerID){
		playerArray[PlayerID].object.position.set(Pos[0], Pos[1], Pos[2]);
	}
};

// When The Server Shutdown Or An Connection Error Occur, Log The Error And Transfer To index.html
const connectionError = (error) => {
	console.log(error);
	window.location.href = "index.html";
};

// When A Player Is Disconnected
const playerDisconnect = (PlayerID) => {
	if (playerArray[PlayerID] != null){
		playerArray[PlayerID].delete();
	}
};

(() => {
	// When Connected To Server, Create A Sock (MySelf)
	const sock = io();

	// Sending Information To Server Only Once
	// First Parameter Is The Tag, Second Parameter Is What We Send To The Server
	sock.emit('newName', sessionStorage.getItem("playerInitialName"));

	// Receiving Information From Server
	// First Parameter Is The Tag, Second Parameter Is The Event/Function To Operate On Information From Server
	sock.on('initSelf', initSelf);
	sock.on('newPlayer', newPlayer);
	sock.on('clientPos', playerPositionUpdate);
	sock.on('clientDisconnect', playerDisconnect);
	sock.on('connect_error', connectionError);

	// Sending My New Position To Server
	const updatePosition = () => {
		// Return The Player's Accurate Position To The Server As A Tuple
		sock.emit('newPos', [player_controller.creature.object.position.x,
							player_controller.creature.object.position.y,
							player_controller.creature.object.position.z]);
	};
	
	// Add An Event Called 'position event' And Run updataPosition When The Event Occur
	document.addEventListener('position event', updatePosition);
})();