const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );




//map
const map = new THREE.Group();
for (let i = -50; i < 50; i++) {
    for (let ii = -50; ii <50; ii++) {
        const material = new THREE.MeshBasicMaterial( { color: new THREE.Color(Math.random(), Math.random(), Math.random()) } );
        var mesh = new THREE.Mesh( geometry, material);
        mesh.position.set(i,ii,0);
        map.add( mesh );
    }
}
map.position.set(0,0,-10);
scene.add( map );





//stats module
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

function animate() {
    stats.begin();

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    me.object.translateZ( -0.1 );
    renderer.render( scene, camera );

    stats.end();
    requestAnimationFrame( animate );
};


//camera.translateZ( 55 );


me = new player("pERIKarua",[0,0,0],100);
me.object.add(cube)

console.log(me.name);
console.log(me.object.position);

animate();