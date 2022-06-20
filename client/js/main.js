// THREE.js Initial Set Up Variable
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Game Setting
const groundLevel = 1;
const gravity = 8;
const game_map = new map([100,100]);

// Client Side playerArray, Used To Store Player Object
var playerArray = [];
playerArray.length = 256;

// Client Side Personal Player ID
var clientPlayerID;
var player_controller;

// Stats Module
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Game Frame Update
var clock = new THREE.Clock();
var delta = 0;

// Animation Function
function animate() {
    // Beginning Of The Frame
    stats.begin();

    delta = clock.getDelta();
    player_controller.update(delta);

    renderer.render(scene, camera);
    stats.end();

    // THREE.js Animation Requirement, Looping The Animation Function
    requestAnimationFrame(animate);
};