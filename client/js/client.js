function spawnPlayer(playerInfo){
  let new_player = new player(playerInfo.name,
    [playerInfo.position[0], playerInfo.position[1], playerInfo.position[2]],
    playerInfo.health);

  playerArray[playerInfo.ID] = new_player;
  return new_player;
}




const initSelf = (playerID,oldPlayerArray) => {
  selfPlayerID = playerID;
  for (let i = 0; i < oldPlayerArray.length; i++) {
    if (oldPlayerArray[i] != null){
      spawnPlayer(oldPlayerArray[i]);
    }
  }

};


const newPlayer = (playerInfo) => {
  let new_player = spawnPlayer(playerInfo);
  if (playerInfo.ID == selfPlayerID){
    player_controller = new controller(new_player,camera);
    animate();
  }
};


const playerPositionUpdate = ([Pos,PlayerID]) => {
  if (PlayerID != selfPlayerID){
    playerArray[PlayerID].object.position.set(Pos[0],Pos[1],Pos[2]);
  }

};





(() => {

  const sock = io();
  sock.on('initSelf',  initSelf);

  sock.on('newPlayer',  newPlayer);


  sock.on('clientPos',  playerPositionUpdate);


  const updatePosition = () => {
    sock.emit('newPos', [player_controller.creature.object.position.x,
                         player_controller.creature.object.position.y,
                         player_controller.creature.object.position.z]);
  };
  
  document.addEventListener('position event', updatePosition);



})();