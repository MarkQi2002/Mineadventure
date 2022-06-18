const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );




/*
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
*/






//stats module
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

function animate() {
    stats.begin();

    /*
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    me.object.translateZ( -0.1 );
    */


    player_controller.update();


    renderer.render( scene, camera );
    stats.end();
    requestAnimationFrame( animate );
};


game_map = new map([100,100]);

me = new player("pERIKarua",[0,0,-9],100);

const player_controller = new controller(me,camera);








animate();