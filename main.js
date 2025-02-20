import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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
const backboardGeometry = new THREE.BoxGeometry(2, 1, 0.1);
const backboardMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
backboard.position.set(0, 3, -4.9);
scene.add(backboard);

// Rim
const rimGeometry = new THREE.TorusGeometry(0.25, 0.05, 16, 100);
const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const rim = new THREE.Mesh(rimGeometry, rimMaterial);
rim.position.set(0, 2.5, -4.75);
rim.rotation.x = Math.PI / 2;
scene.add(rim);

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
