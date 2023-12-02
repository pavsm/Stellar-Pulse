import * as THREE from 'three';

import { range, texture, mix, uv, color, positionLocal, timerLocal, attribute, SpriteNodeMaterial } from 'three/nodes';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Star } from './star.js';
import { NUM_STARS, GALAXY_THICKNESS, CORE_X_DIST, CORE_Y_DIST } from './config/galaxyConfig.js';

let camera, scene, renderer, clock;
let controls;
let stars = [];
let starCreated = false;
let credits = document.querySelector('#credits');

function init() {

	if ( WebGPU.isAvailable() === false && WebGL.isWebGL2Available() === false ) {

		document.body.appendChild( WebGPU.getErrorMessage() );

		throw new Error( 'No WebGPU or WebGL2 support' );

	}
	
	const { innerWidth, innerHeight } = window;

	scene = new THREE.Scene();

	clock = new THREE.Clock();
	// scene.fog = new THREE.FogExp2(0xffffff, 0.2);


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
	
	const smokeColor = mix( color( '#e0778c' ), color( '#ff1f4c' ), positionLocal.y.mul( 1 ).clamp() );
	

	// Create particles

	const smokeNodeMaterial = new SpriteNodeMaterial();
	smokeNodeMaterial.colorNode = mix( color( '#160917' ), smokeColor, life.mul( 2 ).min( 1 ) ).mul( fakeLightEffect );
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
	fireNodeMaterial.colorNode = mix( color( '#160917' ), color( 'rgba(233,165,161,255)' ), life );
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


	// Stars


	let position = new THREE.Vector3(0, 0, 0);
	let mainStar = new Star(position);
	mainStar.toThreeObject(scene);

	function gaussianRandom(mean = 0, stdev = 1) {
		let u = 1 - Math.random();
		let v = Math.random();
		let z = Math.sqrt(- 2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

		return z * stdev + mean;
	}

	for (let i = 0; i < NUM_STARS; i++) {
		let pos = new THREE.Vector3(gaussianRandom(0, CORE_X_DIST), gaussianRandom(0, GALAXY_THICKNESS), gaussianRandom(0, CORE_Y_DIST));
		let star = new Star(pos);
		star.toThreeObject(scene);

		stars.push(star);
	}

	
	// Scene elements

	let axes  = new THREE.AxesHelper(5);
	// scene.add(axes);

	// Camera setup

	camera = new THREE.PerspectiveCamera( 60, innerWidth / innerHeight, 1, 5000 );
	camera.position.set( 0, 40, 40 );
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	//Renderer

	renderer = new WebGPURenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( innerWidth, innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.setClearColor('#160917');
	renderer.setAnimationLoop( render );
	document.querySelector('#canvas').appendChild(renderer.domElement);
	
	// update(renderer, scene, camera)

	//Orbit controls for the camera

	controls = new OrbitControls( camera, renderer.domElement );
	controls.maxDistance = 600;
	controls.minDistance = 50;
	controls.autoRotate = true;
	controls.autoRotateSpeed = 0.25;
	controls.enableDamping = true;
	controls.dampingFactor = 0.01;
	// controls.keyPanSpeed = 100;
	controls.zoomSpeed = 0.35;
	
	controls.maxPolarAngle = 60 * Math.PI / 180; // Limit angle of visibility
	
	
	// controls.keys = {
	// 	LEFT: 'ArrowLeft', //left arrow
	// 	UP: 'ArrowUp', // up arrow
	// 	RIGHT: 'ArrowRight', // right arrow
	// 	BOTTOM: 'ArrowDown' // down arrow
	// }

	// controls.listenToKeyEvents(window);

   	// controls.addEventListener("change", () => {
	//   if (this.renderer) this.renderer.render(this.scene, camera);
	// });

	
	controls.target.set( 0, 0, 0 );
	controls.update();

	let loader = new GLTFLoader();


	// GUI

	// const gui = new GUI();

	// gui.add( timer, 'scale', 0, 1, 0.01 ).name( 'speed' );


	// Window resize

	window.addEventListener('resize', onWindowResize);

}

function getBox(w, h, d) {
	let geometry = new THREE.BoxGeometry(w, h, d);
	let material = new THREE.MeshPhongMaterial({
		color: 'rgb(120,120,120)',
	});
	let mesh = new THREE.Mesh(
		geometry,
		material 
	);
	mesh.castShadow = true;

	return mesh;
}

function getPlane(size) {
	let geometry = new THREE.PlaneGeometry(size, size);
	let material = new THREE.MeshPhongMaterial({
		color: '#ffffff',
		side: THREE.DoubleSide
	});
	let mesh = new THREE.Mesh(
		geometry,
		material 
	);
	mesh.receiveShadow = true;

	return mesh;
}

function getPointLight(intensity) {
	let light = new THREE.PointLight(0xffffff, intensity);
	light.castShadow = true;

	return light;
}

function getSphere(size) {
	let geometry = new THREE.SphereGeometry(size, 24, 24);
	let material = new THREE.MeshBasicMaterial({
		color: 'rgb(255,255,255)',
	});
	let mesh = new THREE.Mesh(
		geometry,
		material 
	);

	return mesh;
}

function render() {

	if(starCreated) {
		const time = clock.getElapsedTime();

		if((time > 34)&&(time < 176)) {
			camera.position.y += 0.05;
		}
		
		// if((time > 60)&&(time < 70)){
		// 	credits.innerHTML = 'Lorem ipsum consecteur sit amet';
		// 	credits.classList.add('active');
		// } else if((time > 70)&&(time < 85)) {
		// 	credits.classList.remove('active');
		// } else if((time > 85)&&(time < 95)) {
		// 	credits.innerHTML = 'Chacho que bonito eh';
		// 	credits.classList.add('active');
		// } else if((time > 85)&&(time < 170)){
		// 	credits.classList.remove('active');
		// } else if(time > 170){
		// 	credits.innerHTML = 'For those no longer with us';
		// 	credits.classList.add('active');
		// }
		
		// camera.lookAt(new THREE.Vector3(0, 0, 0));
	
		renderer.render( scene, camera );
	
		stars.forEach((star) => {
			star.updateScale(camera);
		});

		controls.update();
	}
}

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

init();

document.querySelector('#playButton').addEventListener('click', function() {
	this.classList.add('active');
	
	let clickAudio = document.querySelector("#click");
	clickAudio.volume = 0.4;
	clickAudio.play();


	let song = document.querySelector("#song");

	clickAudio.addEventListener('ended', function(){
		song.play();
	});

	starCreated = true;
	document.querySelector('#canvas').classList.add('active');

	ctx.resume();

	let ambience = document.querySelector("#ambience");

	song.addEventListener('ended', function(){
		ambience.play();
		ambience.volume = 0.2;
	});

	ambience.addEventListener('ended', function(){
		ambience.play();
		ambience.volume = 0.2;
	});
});




