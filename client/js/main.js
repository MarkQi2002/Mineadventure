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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
document.body.appendChild(renderer.domElement);

// Light Setting

// Light

const light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1);//skyColor, groundColor, intensity
light.position.set(0, 0, 1);
scene.add(light);

// Direction Light
const directionLight = new THREE.DirectionalLight(0xFFFFFF, 1);// color, intensity
directionLight.position.set(0, 0, 0);
directionLight.target.position.set(-1, -1, -1);
directionLight.castShadow = true;

directionLight.shadowDarkness = 0.5;

// these six values define the boundaries of the yellow box seen above
directionLight.castShadow = true
directionLight.shadow.mapSize.width = 512
directionLight.shadow.mapSize.height = 512
directionLight.shadow.camera.near = 0.5
directionLight.shadow.camera.far = 100
scene.add(directionLight);
scene.add(directionLight.target);

//const helper = new THREE.DirectionalLightHelper(light);




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
    //helper.update()
    delta = clock.getDelta();
    player_controller.update(delta);

    renderer.render(scene, camera);
    stats.end();

    // THREE.js Animation Requirement, Looping The Animation Function
    requestAnimationFrame(animate);
};