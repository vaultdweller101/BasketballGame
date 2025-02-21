import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {createHalfCourtFloor} from './halfcourt.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//making the sky 
const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
    //using a picture from google 
  map: new THREE.TextureLoader().load('sky.jpg'),
  side: THREE.BackSide 
});
//adding the sky to the scene
const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyDome);

//The lighiting for the scene 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const spotLight = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.5);
spotLight.position.set(0, 10, 0);
scene.add(spotLight);

// THis will be the geometry for the court 

// Load the texture
const floor = createHalfCourtFloor('halfcourt.jpg'); // Ensure correct path
scene.add(floor);

// const floorGeometry = new THREE.PlaneGeometry(15.24, 14.330);
// const floorMaterial = new THREE.MeshStandardMaterial({ color:  0x808080 });
// const floor = new THREE.Mesh(floorGeometry, floorMaterial);
// floor.rotation.x = -Math.PI / 2;
// scene.add(floor);


//now I want to add extra land around this floor to make it look like a basketball court
const landGeometry = new THREE.PlaneGeometry(60,60,1000,1000);
const landMaterial = new THREE.MeshStandardMaterial({ color: 0x7CFC00,flatShading: false});
const land = new THREE.Mesh(landGeometry, landMaterial);
land.rotation.x = -Math.PI / 2;
land.position.y = -0.1;
scene.add(land);

//Geometry for the backboard, we will still need to add the net and the rim 
const backboardGeometry = new THREE.BoxGeometry(2, 1, 0.1);
const backboardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
backboard.position.set(0, 3, -4.9);
scene.add(backboard);

//Rim of the backboard, might need to make bigger
const rimGeometry = new THREE.TorusGeometry(0.25, 0.05, 16, 100);
const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const rim = new THREE.Mesh(rimGeometry, rimMaterial);
rim.position.set(0, 2.5, -4.75);
rim.rotation.x = Math.PI / 2;
scene.add(rim);

//using pointer lock controls to move the camera around the scene according the WASD keys
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(camera);

//keeping track of when a key is pressed so that holding down a key will continuously move forward 
const keys = {};
document.addEventListener('keydown', (event) => (keys[event.code] = true));
document.addEventListener('keyup', (event) => (keys[event.code] = false));
//speed we move at 
const speed = 0.1;

// array of balls 
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
//we have to reed when we have pressed space, this will make is so that we call the shoot ball function every tuime we press space 
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        shootBall();
    }
});
//anaimate function like in all of our projects, will allow us to move when pressing on keys
function animate() {
    requestAnimationFrame(animate);
    if (keys['KeyW']) controls.moveForward(speed);
    if (keys['KeyS']) controls.moveForward(-speed);
    if (keys['KeyA']) controls.moveRight(-speed);
    if (keys['KeyD']) controls.moveRight(speed);
    //will go through the ball array to shoot the balls at a certain speed 
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
