// THREE.js Initial Set Up Variable
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15);
//scene.background = new THREE.Color( 0xffffff );
camera.position.z = 10;

// Resize Window
const resizeWindow = () => {
	console.log("Resize Window In Main!")
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
};

// Fix window size event
window.addEventListener('resize', resizeWindow);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

// Light Setting

const skyColor = 0xFFFFFF;  // light blue
const groundColor = 0x000000;  // brownish orange
const intensity = 2;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
light.position.set(0, 0, 1);
scene.add(light);

/*
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 0, 0);
light.target.position.set(0, 0, -1);
scene.add(light);
scene.add(light.target);*/



// Game Setting
const groundLevel = 1;
const gravity = 10;
var game_map;

// Client Side playerArray, Used To Store Player Object
var playerArray = [];

// Client Side Personal Player ID
var clientPlayerID;
var player_controller;

// Client Side Item Spawn
var itemArray = [];

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