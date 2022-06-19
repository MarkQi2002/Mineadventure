const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );




//game setting
const groundLevel = 1;//set ground position on world z axis
const gravity = 9.81;//per second
const game_map = new map([100,100]);

var playerArray = [];
playerArray.length = 30;

//const main_player = new player("pERIKarua",[0,0,groundLevel],100);
var selfPlayerID;
var player_controller;





//stats module
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );


//game frame update
var clock = new THREE.Clock();
var delta = 0;
function animate() {
    stats.begin();





    delta = clock.getDelta();
    player_controller.update(delta);

    renderer.render( scene, camera );
    stats.end();
    requestAnimationFrame( animate );
};