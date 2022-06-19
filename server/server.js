// CommonJS Syntax
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);
//const io = new Server(server, {});






//const muain_player = new ds.player("pERIKarua",[0,0,0],100);

const CreateNewPlayer = (playerID) => {

  let playerInfo  = {
    ID: playerID,
    name: 'pERIKarya',
    position: [Math.random()*5,Math.random()*5,1],
    health: 100,
  };

  playerArray[playerID] = playerInfo;

  console.log(playerInfo);
  return playerInfo;
};


const UpdatePlayerPosition = (Pos,playerID) => {
  if (playerArray[playerID]!= null){
    playerArray[playerID].position = [Pos[0],Pos[1],Pos[2]];
  }
  return [Pos,playerID];
};

//var creature



var playerArray = [];
playerArray.length = 30;
//const { clear, getBoard, makeTurn } = createBoard(20);

var ID_count = 0;
io.on('connection', (sock) => {
  const playerID = ID_count;
  ID_count ++;
  console.log("new player joined, ID: ",playerID);
  sock.emit('initSelf',playerID,playerArray);//init the new player
  io.emit('newPlayer',CreateNewPlayer(playerID));//send new player info to all player

  
  
  
  sock.on('newPos',(Pos) => io.emit('clientPos', UpdatePlayerPosition(Pos,playerID)));
  //sock.on('message', (text) => io.emit('message', text));
 /* sock.on('turn', ({ x, y }) => {
    if (cooldown()) {
      const playerWon = makeTurn(x, y, color);
      io.emit('turn', { x, y, color });

      if (playerWon) {
        sock.emit('message', 'You Won!');
        io.emit('message', 'New Round');
        clear();
        io.emit('board');
      }
    }
  });*/
});

server.on('error', (err) => {
  console.error(err);
});

server.listen(8080, () => {
  console.log('server is ready');
});
