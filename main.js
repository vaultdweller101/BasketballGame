import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { GLTFLoader } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// texturing used for hoop
const textureLoader = new THREE.TextureLoader();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const spotLight = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.5);
spotLight.position.set(0, 10, 0);
scene.add(spotLight);

// Floor (Court)
const floorGeometry = new THREE.PlaneGeometry(20, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xd2691e });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Backboard

// Load the backboard texture
const backboardTexture = textureLoader.load('photos/backboard.jpg');

// created an array to prevent the jpg from showing on all sides of the backboard
const materials = [
    new THREE.MeshBasicMaterial({ color: 0xffffff }),  // Right side
    new THREE.MeshBasicMaterial({ color: 0xffffff }),  // Left side
    new THREE.MeshBasicMaterial({ color: 0xffffff }),  // Top side
    new THREE.MeshBasicMaterial({ color: 0xffffff }),  // Bottom side
    new THREE.MeshBasicMaterial({ map: backboardTexture }), // Front (with texture)
    new THREE.MeshBasicMaterial({ color: 0xffffff })   // Back side
];

// Create the backboard geometry (a flat rectangle)
const backboardGeometry = new THREE.BoxGeometry(2, 1, .1);
const backboard = new THREE.Mesh(backboardGeometry, materials);
backboard.position.set(0, 3, -3.86);
scene.add(backboard);

// Rim
const rimGeometry = new THREE.TorusGeometry(0.30, 0.02, 16, 100);
const rimMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffa54f,  // Bright orange color
    metalness: 1.0,   // High metalness for a metallic look
    roughness: 0.05,   // Low roughness to make it slightly shiny
    emissive: 0xff5500, // Slight glow effect for a metal look
    emissiveIntensity: 0.3  // extra glow
});
const rim = new THREE.Mesh(rimGeometry, rimMaterial);
rim.position.set(0, 2.565, -3.5);
rim.rotation.x = Math.PI / 2;
scene.add(rim);

// net (planning on working on this either this weekend or next week)

// support for the hoop

// Create Pole
const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 32);
const poleMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    metalness: 0.9,
    roughness: 0.3
});
const pole = new THREE.Mesh(poleGeometry, poleMaterial);
pole.position.set(0, 0, -4.54);
scene.add(pole);

// Create Diagonal Support
const supportGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 16);
const support = new THREE.Mesh(supportGeometry, poleMaterial);
support.position.set(0, 2, -4.2);
support.rotation.set(Math.PI / 6, 0, 0);
scene.add(support);

// Create Base
const baseGeometry = new THREE.BoxGeometry(1, 0.2, 0.5);
const base = new THREE.Mesh(baseGeometry, poleMaterial);
base.position.set(0, 0, -4.54);
scene.add(base);


// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

// Movement
const keys = {};
document.addEventListener('keydown', (event) => (keys[event.code] = true));
document.addEventListener('keyup', (event) => (keys[event.code] = false));
const speed = 0.1;

// Ball shooting
const balls = [];
function shootBall() {
    const ballGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);
    
    ball.position.copy(camera.position);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    balls.push({ mesh: ball, velocity: direction.multiplyScalar(0.5) });
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        shootBall();
    }
});

function animate() {
    requestAnimationFrame(animate);
    if (keys['KeyW']) controls.moveForward(speed);
    if (keys['KeyS']) controls.moveForward(-speed);
    if (keys['KeyA']) controls.moveRight(-speed);
    if (keys['KeyD']) controls.moveRight(speed);
    
    balls.forEach((ballObj) => {
        ballObj.mesh.position.add(ballObj.velocity);
    });
    
    renderer.render(scene, camera);
}

camera.position.set(0, 1.5, 5);
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
