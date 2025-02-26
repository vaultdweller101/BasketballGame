import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {createHalfCourtFloor} from './halfcourt.js';
//this is for the sky 
import { Sky } from 'three/examples/jsm/objects/Sky.js';

const sky = new Sky();
sky.scale.setScalar(450000);


// Sky parameters
const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 5; // Lower = less hazy
skyUniforms['rayleigh'].value = 0.33; // Less blue scattering
skyUniforms['mieCoefficient'].value = 0.001; // Softer light scattering
skyUniforms['mieDirectionalG'].value = 0.7; // Reduce direct light glow


// Sun position for MIDDAY 
const sun = new THREE.Vector3();
const phi = THREE.MathUtils.degToRad(90 - 85); // Higher value = closer to overhead (90 is directly above)
const theta = THREE.MathUtils.degToRad(180); // Sun from the south
sun.setFromSphericalCoords(1, phi, theta);
skyUniforms['sunPosition'].value.copy(sun);

// Optional: Add a directional light to simulate sunlight
const sunlight = new THREE.DirectionalLight(0xffffff, 1.5);
sunlight.position.copy(sun).multiplyScalar(10000); // Place the light far away



//end of sky
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const clock = new THREE.Clock();
//adding sky to scene
scene.add(sky);
scene.add(sunlight);
// Crosshair
const crosshairGeometry = new THREE.CircleGeometry(0.001, 32);
const crosshairMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // green
const crosshair = new THREE.Mesh(crosshairGeometry, crosshairMaterial);
crosshair.position.set(0, 0, -0.1);
camera.add(crosshair);

// Black charging bar background
const chargingBarBackgroundGeometry = new THREE.PlaneGeometry(0.1, 0.01);
const chargingBarBackgroundMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // black
const chargingBarBackground = new THREE.Mesh(chargingBarBackgroundGeometry, chargingBarBackgroundMaterial);
chargingBarBackground.position.set(0, -0.05, -0.1);
camera.add(chargingBarBackground);

// Charging bar to indicate how much power the player is using to shoot the ball
const chargingBarGeometry = new THREE.PlaneGeometry(0.1, 0.01);
const chargingBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); 
const chargingBar = new THREE.Mesh(chargingBarGeometry, chargingBarMaterial);
chargingBar.position.set(0, -0.05, -0.1);
camera.add(chargingBar);

// texturing used for hoop
const textureLoader = new THREE.TextureLoader();

//making the sky
// const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
// const skyMaterial = new THREE.MeshBasicMaterial({
//     //using a picture from google
//   map: new THREE.TextureLoader().load('./photos/sky.jpg'),
//   side: THREE.BackSide
// });
// //adding the sky to the scene
// const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
// scene.add(skyDome);

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
// const landGeometry = new THREE.PlaneGeometry(60,60,1000,1000);
// const landMaterial = new THREE.MeshStandardMaterial({ color: 0x7CFC00,flatShading: false});
// const land = new THREE.Mesh(landGeometry, landMaterial);
// land.rotation.x = -Math.PI / 2;
// land.position.y = -0.1;
// scene.add(land);
const landGeometry = new THREE.PlaneGeometry(60, 60, 200, 200); // Increase segments for better shader effect

const landMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 }, // To animate if needed
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
            float brightness = 0.5 + 0.5 * sin(vPosition.x * 0.2) * cos(vPosition.y * 0.2);
            vec3 grassColor = mix(vec3(0.1, 0.3, 0.1), vec3(0.2, 0.6, 0.2), brightness);
            gl_FragColor = vec4(grassColor, 1.0);
        }
    `,
});

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
let multiplier = 1;

function shootBall() {
    const ballGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.geometry.computeBoundingSphere();
    ball.frustumCulled = false;
    scene.add(ball);
    
    ball.position.copy(camera.position);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    balls.push({ mesh: ball, velocity: direction.multiplyScalar(speed_constant * multiplier) });
}

// Charging
let animation_time = 0;
let delta_animation_time = 0;
const T = 4;

function charge_ball(){
    requestAnimationFrame(charge_ball);
    delta_animation_time = clock.getDelta();
    animation_time += delta_animation_time;
    let adjustment_factor = Math.sin((2 * Math.PI / T) * animation_time)
    chargingBar.scale.x = (0.5 + 0.5 * adjustment_factor);
    // Multiplier range from 0 to 2
    multiplier = adjustment_factor + 1;
}

// First space: Start charging
// Second space: Stop charging and shoot
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        charge_ball();
        shootBall();
    }
});

// Score Display
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '20px';
scoreDisplay.style.left = '50%';
scoreDisplay.style.transform = 'translateX(-50%)';
scoreDisplay.style.fontSize = '24px';
scoreDisplay.style.color = 'white';
scoreDisplay.style.fontFamily = 'Arial, sans-serif';
scoreDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
scoreDisplay.style.padding = '10px 20px';
scoreDisplay.style.borderRadius = '10px';
scoreDisplay.innerHTML = 'Score: 0';
document.body.appendChild(scoreDisplay);

let score = 0; // Score counter

function updateScore() {
    score++;
    scoreDisplay.innerHTML = `Score: ${score}`;
}

// Specify backboard normals for collision detection for front and side
const backboardNormals = new THREE.Vector3(0, 0, 1);
const supportNormals = new THREE.Vector3(0,-0.5, Math.sqrt(3)/2);

// Compute Bounding Box and Sphere
// Backboard
let backboardBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
backboardBB.setFromObject(backboard);

// Base
let baseBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
baseBB.setFromObject(base);

// Support
let supportBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
supportBB.setFromObject(support);

// Pole
let poleBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
poleBB.setFromObject(pole);

// Ball
let ballBS;

// Rim
rim.geometry.computeBoundingSphere();
let rimBS = rim.geometry.boundingSphere;
rimBS.center.copy(rim.position);
rim.frustumCulled = false;

// Inner Rim
let innerRimBS = new THREE.Sphere(rimBS.center, 0.28);
innerRimBS.center.copy(rim.position);

let angle;

// Ball physics
function ballSimulation(ballObj){
    ballBS = ballObj.mesh.geometry.boundingSphere;
    ballBS.center.copy(ballObj.mesh.position);

    // Check if the ball hit the ground
    if (ballObj.mesh.position.y - land.position.y <= 0.15){
        // apply bounce
        ballObj.velocity.y = Math.abs(ballObj.velocity.y);
        // the bounce absorb some energy, thus decrease the velocity
        ballObj.velocity.multiplyScalar(0.7);
    }
    // Check if the ball hit the backboard
    else if (backboardBB.intersectsSphere(ballBS) || baseBB.intersectsSphere(ballBS) || poleBB.intersectsSphere(ballBS)){
        // compute angle between ballObj velocity and backboard normal
        angle = ballObj.velocity.angleTo(backboardNormals);
        ballObj.velocity.applyAxisAngle(backboardNormals, -angle);
        // // apply bounce
        ballObj.velocity.z *= -1;
        ballObj.velocity.x *= -1;
    }
    // Check if the ball hit the support
    else if ( supportBB.intersectsSphere(ballBS) ){
        // compute angle between ballObj velocity and backboard normal
        angle = ballObj.velocity.angleTo(supportNormals);
        ballObj.velocity.applyAxisAngle(supportNormals, -angle);
        // // apply bounce
        ballObj.velocity.z *= -1;
        ballObj.velocity.x *= -1;
    }
    // Check if the ball hit the rim
    else if (rimBS.intersectsSphere(ballBS) && Math.abs(ballObj.mesh.position.y - rim.position.y) <= 0.17){
        // Check if the ball goes in the rim (Only when the ball velocity's y component is negative
        // and the ball's x and z position is exactly the same as the rim's)
        if (innerRimBS.intersectsSphere(ballBS) && Math.abs(ballObj.mesh.position.y - rim.position.y) <= 0.015
        && ballObj.velocity.y < 0 ){
            console.log("Score!");
            updateScore();
        }
        // apply bounce
        ballObj.velocity.z *= -1;
        ballObj.velocity.x *= -1;
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
