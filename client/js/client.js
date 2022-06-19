const initSelf = (playerID) => {
  selfPlayerID = playerID;
  
 
  
};


const newPlayer = (playerInfo) => {
  let new_player = new player(playerInfo.name,
    [playerInfo.position[0], playerInfo.position[1], groundLevel],
    playerInfo.health);

  playerArray[playerInfo.ID] = new_player;

  if (playerInfo.ID == selfPlayerID){
    player_controller = new controller(new_player,camera);
    animate();
  }


  
};


const playerPositionUpdate = (Pos,PlayerID) => {
  console.log(Pos);
  console.log(PlayerID);
};





(() => {

  const sock = io();
  sock.on('initSelf',  initSelf);

  sock.on('newPlayer',  newPlayer);


  sock.on('clientPos',  playerPositionUpdate);


  const updatePosition = () => {
    sock.emit('newPos', [player_controller.creature.object.position.x,
                         player_controller.creature.object.position.y]);
  };
  document.addEventListener('position event', updatePosition);



})();