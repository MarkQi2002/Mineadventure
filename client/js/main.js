// Game Setting
const groundLevel = 1;
const gravity = 10;
var game_map;
var gameTime = new Date();
var gameMapLevel;

// THREE.js Initial Set Up Variable
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
scene.add( camera );

// scene.background = new THREE.Color( 0xffffff );
var cameraAngle = Math.PI / 8
var carmeraHeight = 10;
var carmeraOffsetY = Math.tan(cameraAngle) * (carmeraHeight - groundLevel);
camera.rotation.x = cameraAngle;
camera.position.z = carmeraHeight;

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

// Setting WebGL Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Default THREE.PCFShadowMap
document.body.appendChild(renderer.domElement);

// Light Setting

// Hemisphere Light 
const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 4); // SkyColor, GroundColor, Intensity
hemisphereLight.position.set(0, 0, 1);
scene.add(hemisphereLight);


// Direction Light
const directionLight = new THREE.DirectionalLight(0xFFFFFF, 1); // Color, Intensity
directionLight.position.set(0, 0, 20);
directionLight.target.position.set(0, 0, 0);
scene.add(directionLight);
scene.add(directionLight.target);

// Client Side playerArray, Used To Store Player Object
var playerArray = [];

// Client Side Personal Player ID
var clientPlayerID;
var player_controller;

// Client Side Item Spawn
var itemArray = [];

// Projectile Relate
var newProjectileList = [];
var projectileList = [];
var updateProjectileList = [];

// Stats Module
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Game Frame Update
var clock = new THREE.Clock();
var delta = 0;

// Game Event Related
function updateTimeEvent(){
    document.dispatchEvent(new Event('frameEvent', {bubbles: true, cancelable: false}));
    if (changingCreatureInfo.length > 0){
        document.dispatchEvent(new Event('changingCreatureInfo', {bubbles: true, cancelable: false}));
    }
}

// Create Thread
let intervalWorker = new Worker('./js/thread.js');

// Using For Update Player
var changingCreatureInfo = [];

// Animation Function
function animate() {
    // Beginning Of The Frame
    stats.begin();
    // helper.update()
    delta = clock.getDelta();
    player_controller.update(delta);
    
    // Updating Event
    for (let i = 0; i < playerArray.length; i++){
        if (playerArray[i] != null && i != clientPlayerID){
            playerArray[i].update();
        }
    }

    // Updating Event
    for (let i = 0; i < damageTextList.length; ++i){
        if (damageTextList[i] != null){
            damageTextList[i].update(delta, i);
        }
    }

    // Setting The Renderer Of The Scene And Camera
    renderer.render(scene, camera);
    stats.end();

    // THREE.js Animation Requirement, Looping The Animation Function
    requestAnimationFrame(animate);
};