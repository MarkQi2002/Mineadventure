const newPlayer = (text) => {
  console.log(text);
  let new_player = new player("pERIKarua",[0,0,groundLevel],100);
};


(() => {

  const sock = io();
  sock.on('new player',  newPlayer);

})();