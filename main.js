import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {createHalfCourtFloor} from './halfcourt.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// texturing used for hoop
const textureLoader = new THREE.TextureLoader();

//making the sky
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
    //using a picture from google
  map: new THREE.TextureLoader().load('./photos/sky.jpg'),
  side: THREE.BackSide
});
//adding the sky to the scene
const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyDome);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const spotLight = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.5);
spotLight.position.set(0, 10, 0);
scene.add(spotLight);

// Floor (Court)
// Load the texture
const floor = createHalfCourtFloor('./photos/halfcourt.jpg'); // Ensure correct path
scene.add(floor);

//now I will add more land to make it look like a basketball court at a park
const landGeometry = new THREE.PlaneGeometry(60,60,1000,1000);
const landMaterial = new THREE.MeshStandardMaterial({ color: 0x7CFC00,flatShading: false});
const land = new THREE.Mesh(landGeometry, landMaterial);
land.rotation.x = -Math.PI / 2;
land.position.y = -0.1;
scene.add(land);

// support for the hoop

// Create Pole
const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 32);
const poleMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    metalness: 0.9,
    roughness: 0.3
});
const pole = new THREE.Mesh(poleGeometry, poleMaterial);
pole.position.set(0, 0, -7);
scene.add(pole);

// Create Base
const baseGeometry = new THREE.BoxGeometry(1, 0.2, 0.5);
const base = new THREE.Mesh(baseGeometry, poleMaterial);
base.position.set(0, 0, -7); // -4.54
scene.add(base);

// Create Diagonal Support
const supportGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 16);
const support = new THREE.Mesh(supportGeometry, poleMaterial);
support.position.set(0, 2, -6.74);
support.rotation.set(Math.PI / 6, 0, 0);
scene.add(support);

// net (planning on working on this either this weekend or next week)

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
rim.position.set(0, 2.565, -6.04);
rim.rotation.x = Math.PI / 2;
scene.add(rim);

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
backboard.position.set(0, 3, -6.4);
scene.add(backboard);

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
const speed_constant = 0.05;
const acceleration_constant = 0.0001;
function shootBall() {
    const ballGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);
    
    ball.position.copy(camera.position);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    balls.push({ mesh: ball, velocity: direction.multiplyScalar(speed_constant) });
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        shootBall();
    }
});

// Specify backboard normals for collision detection for front and side
const backboardNormals = new THREE.Vector3(0, 0, 1);

// Ball physics
function ballSimulation(ballObj){
    // Check if the ball hit the ground
    if (ballObj.mesh.position.y - land.position.y <= 0.4){
        // apply bounce
        ballObj.velocity.y = Math.abs(ballObj.velocity.y);
        // the bounce absorb some energy, thus decrease the velocity
        ballObj.velocity.multiplyScalar(0.7);
    }
    // Check if the ball hit the backboard
    else if (Math.abs(ballObj.mesh.position.z - backboard.position.z) <= 0.3 && Math.abs(ballObj.mesh.position.x - backboard.position.x) <= 1.3
    && Math.abs(ballObj.mesh.position.y - backboard.position.y) <= 0.8){
        // compute angle between ballObj velocity and backboard normal
        const angle = ballObj.velocity.angleTo(backboardNormals);
        ballObj.velocity.applyAxisAngle(backboardNormals, angle);
        // // apply bounce
        ballObj.velocity.z *= -1;
        ballObj.velocity.x *= -1;
    }
    // Check if the ball hit the rim
    else if (Math.sqrt((ballObj.mesh.position.z - rim.position.z) ** 2 + (ballObj.mesh.position.x - rim.position.x) ** 2) <= 0.3 
    && Math.abs(ballObj.mesh.position.y - rim.position.y) <= 0.3){
        // Check if the ball goes in the rim (Only when the ball velocity's y component is negative
        // and the ball's x and z position is exactly the same as the rim's)
        if (ballObj.velocity.y < 0 && Math.abs(ballObj.mesh.position.x - rim.position.x) <= 0.2 && Math.abs(ballObj.mesh.position.z - rim.position.z) <= 0.2){
            // the ball goes in the rim
            ballObj.velocity.x = 0;
            ballObj.velocity.z = 0;
        }
        // Otherwise, the ball hits the rim and bounce away
        // apply bounce
        else{
            ballObj.velocity.z *= -1;
            ballObj.velocity.x *= -1;
        }
    }
    // Apply air resistance and gravity
    else{
        // apply gravity
        ballObj.velocity.y -= acceleration_constant * 0.98; 
        // apply air resistance
        ballObj.velocity.multiplyScalar(0.9999);
    }
    ballObj.mesh.position.add(ballObj.velocity);
}

function animate() {
    requestAnimationFrame(animate);
    if (keys['KeyW']) controls.moveForward(speed);
    if (keys['KeyS']) controls.moveForward(-speed);
    if (keys['KeyA']) controls.moveRight(-speed);
    if (keys['KeyD']) controls.moveRight(speed);
    
    balls.forEach((ballObj) => {
        ballSimulation(ballObj);
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
