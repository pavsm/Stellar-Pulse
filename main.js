import * as THREE from 'three';

import { range, texture, mix, uv, color, positionLocal, timerLocal, attribute, SpriteNodeMaterial } from 'three/nodes';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Star } from './star.js';
import { GALAXY_THICKNESS, CORE_X_DIST, CORE_Y_DIST } from './config/galaxyConfig.js';
import { COLOR_A, COLOR_B, LIGHT_COLOR, BG_COLOR } from './config/colorRandomizer.js';




let camera, scene, renderer, clock;
let controls;
let numStars = ''; //1000
let mainStar;
let stars = [];
let capturer;

let distanceToStar;

let universeLoaded = false;
let loaderLaunched = false;



// Modified from Particles example code in ThreeJS documentation

async function init() {

	if ( WebGPU.isAvailable() === false && WebGL.isWebGL2Available() === false ) {

		document.body.appendChild( WebGPU.getErrorMessage() );

		throw new Error( 'No WebGPU or WebGL2 support' );

	}
	
	const { innerWidth, innerHeight } = window;

	scene = new THREE.Scene();

	clock = new THREE.Clock();


	// Set initial CSS styles

	document.documentElement.style
    .setProperty('--background-color', BG_COLOR);

	document.documentElement.style
    .setProperty('--light-color', LIGHT_COLOR);

	console.log(LIGHT_COLOR + ' ' + BG_COLOR);


	// Textures

	const textureLoader = new THREE.TextureLoader();
	const map = textureLoader.load( './textures/smoke.png' );


	// Create nodes

	const lifeRange = range( .1, 1 );
	const offsetRange = range( new THREE.Vector3( - 3, 1, - 3 ), new THREE.Vector3( 3, 3, 3 ) );
	
	const timer = timerLocal( .01, 1 );
	
	const lifeTime = timer.mul( lifeRange ).mod( 1 );
	const scaleRange = range( .2, 3 );
	const rotateRange = range( .1, 4 );
	
	const life = lifeTime.div( lifeRange );
	
	const fakeLightEffect = positionLocal.y.oneMinus().max( 0.2 );
	
	const textureNode = texture( map, uv().rotateUV( timer.mul( rotateRange ) ) );
	
	const opacityNode = textureNode.a.mul( life.oneMinus() );
	
	const smokeColor = mix( color( COLOR_A ), color( COLOR_B ), positionLocal.y.mul( 1 ).clamp() );
	

	// Create particles

	const smokeNodeMaterial = new SpriteNodeMaterial();
	smokeNodeMaterial.colorNode = mix( color( BG_COLOR ), smokeColor, life.mul( 2 ).min( 1 ) ).mul( fakeLightEffect );
	smokeNodeMaterial.opacityNode = opacityNode;
	smokeNodeMaterial.positionNode = offsetRange.mul( lifeTime );
	smokeNodeMaterial.scaleNode = scaleRange.mul( lifeTime.max( 0.2 ) );
	smokeNodeMaterial.depthWrite = false;
	smokeNodeMaterial.transparent = true;
	
	const smokeInstancedSprite = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), smokeNodeMaterial );
	smokeInstancedSprite.scale.setScalar( 100 );
	smokeInstancedSprite.isInstancedMesh = true;
	smokeInstancedSprite.count = 1000;
	smokeInstancedSprite.position.y = 0;
	scene.add( smokeInstancedSprite );

	//

	const fireNodeMaterial = new SpriteNodeMaterial();
	fireNodeMaterial.colorNode = mix( color( BG_COLOR ), color( LIGHT_COLOR ), life );
	fireNodeMaterial.positionNode = range( new THREE.Vector3( -2, 0, -2 ), new THREE.Vector3( 2, 0, 2 ) ).mul( lifeTime );
	fireNodeMaterial.scaleNode = smokeNodeMaterial.scaleNode;
	fireNodeMaterial.opacityNode = opacityNode;
	fireNodeMaterial.blending = THREE.AdditiveBlending;
	fireNodeMaterial.transparent = true;
	fireNodeMaterial.depthWrite = false;
	const fireInstancedSprite = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), fireNodeMaterial );
	fireInstancedSprite.scale.setScalar( 50 );
	fireInstancedSprite.isInstancedMesh = true;
	fireInstancedSprite.count = 50;
	fireInstancedSprite.position.y = 10;
	fireInstancedSprite.renderOrder = 1;
	scene.add( fireInstancedSprite );


	// Main star

	let position = new THREE.Vector3(0, 0, 0);
	mainStar = new Star(position);
	mainStar.toThreeObject(scene);
	

	// Axes for orientation -- Removed from final version 

	let axes  = new THREE.AxesHelper(5);
	// scene.add(axes);



	// Camera setup

	camera = new THREE.PerspectiveCamera( 60, innerWidth / innerHeight, 1, 5000 );
	camera.position.set( 0, 40, 40 );
	camera.lookAt(new THREE.Vector3(0, 0, 0));



	//Renderer

	renderer = new WebGPURenderer( { canvas: canvas, antialias: true, depthTest: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( innerWidth, innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.setClearColor(BG_COLOR);
	renderer.setAnimationLoop( render );



	//Orbit controls for the camera

	controls = new OrbitControls( camera, renderer.domElement );
	controls.maxDistance = 600;
	controls.minDistance = 50;
	controls.autoRotate = true;
	controls.autoRotateSpeed = 0.25;
	controls.enableDamping = true;
	controls.enablePan = false;
	controls.dampingFactor = 0.01;
	controls.zoomSpeed = 0.35;
	
	controls.maxPolarAngle = 60 * Math.PI / 180; // Limit angle of visibility


	controls.target.set( 0, 0, 0 );
	controls.update();



	//GLTF Loader

	let loader = new GLTFLoader();



	// GUI

	// const gui = new GUI();
	// gui.add( timer, 'scale', 0, 1, 0.01 ).name( 'speed' );



	// CCapture initialization for the screenshot/wallpaper feature
	// Frame limit set at 1 to capture just 1 image, saved automatically
	// - Note - : The image is compressed in a TAR file. Can be converted to ZIP using online tools

	capturer = new CCapture( { format: 'png', name: 'StarPulse-Wallpaper', frameLimit: 1 } );

}


function render() {

	if ((!numStars) && (!loaderLaunched)) { // Site waits for response before pushing stars
		loadCount().then(count => { numStars = count; });
		loaderLaunched = true;
	} else if ((numStars) && (!universeLoaded)){
		for (let i = 0; i < numStars; i++) { 
			// gaussianRandom: more stars closer to the core, fewer stars outside the core
			let pos = new THREE.Vector3(gaussianRandom(0, CORE_X_DIST), gaussianRandom(0, GALAXY_THICKNESS), gaussianRandom(0, CORE_Y_DIST));
			let star = new Star(pos);
			star.toThreeObject(scene);
	
			stars.push(star);
		}
		universeLoaded = true;
	}

	if(starCreated) { // A new star must be placed to render
		const time = clock.getElapsedTime();

		if((time > 34)&&(time < 176)) {
			camera.position.y += 0.05;
		}
	
		renderer.render( scene, camera );
	
		stars.forEach((star) => {
			star.updateScale(camera);
		});

		controls.update();

		if (capturePressed) takeScreenShot();

		distanceToStar = camera.position.distanceTo( mainStar.position );
		document.querySelector('#distance').innerHTML = parseInt(distanceToStar/6) + ' LIGHT-YEARS AWAY';
	}
}

function gaussianRandom(mean = 0, stdev = 1) {
	let u = 1 - Math.random();
	let v = Math.random();
	let z = Math.sqrt(- 2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

	return z * stdev + mean;
}

function takeScreenShot() { // Triggers CCapture
	capturer.start();
	capturer.capture( canvas );
	capturePressed = false;
}

function onWindowResize(){ // To adjust aspect ratio of the rendered scene
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	let windowHeight = window.innerHeight;
	// Height 100vh scripted to avoid problems in mobile Safari
	document.querySelector('html').style.height = windowHeight +'px';
	document.querySelector('body').style.height = windowHeight +'px';
	document.querySelector('#loader').style.height = windowHeight +'px';
}


// Window resize

window.addEventListener('resize', onWindowResize);


// Loader
const loader = document.querySelector('#loader');

let assetsLoaded = false; 

init().then(() => {
  assetsLoaded = true;
  loader.classList.add('hidden');
  setTimeout(() => loader.style.display = 'none', 1000);
});






