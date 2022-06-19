//const three = require('../client/js/module/three.js');
//const player =require('../client/js/creature');
//import * as THREE from '../client/js/module/three.js'
//import * as ds from '../client/js/creature.js'

import * as http from 'http';
import express from 'express';
import { Server } from "socket.io";

import path from 'path';
import {fileURLToPath} from 'url';

// CommonJS Syntax
//const http = require('http');
//const express = require('express');
//const socketio = require('socket.io');

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname+'/../client'));

const server = http.createServer(app);
//const io = socketio(server);
const io = new Server(server, {});






//const muain_player = new ds.player("pERIKarua",[0,0,0],100);











//const { clear, getBoard, makeTurn } = createBoard(20);

io.on('connection', (sock) => {
  console.log("new player joined");
  sock.emit('new player',233);

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
