import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {createHalfCourtFloor} from './halfcourt.js';
//this is for the sky 
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { mx_fractal_noise_float } from 'three/src/nodes/TSL.js';
import loadBasketballCourt from './court/basketballCourt.js';
import {updateScore} from './score.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const sky = new Sky();
sky.scale.setScalar(450000);
const skyUniforms = sky.material.uniforms;
//adding sky to scene
scene.add(sky);

//I want to make it so that when I press a key, I toggle from night time to day time 
//the flag we will use to determine white one to display

//lighting 
let isNight = false;
let ambientLight = new THREE.AmbientLight(0xffffff,0.5);
scene.add(ambientLight);


//now the sun 
let sun = new THREE.Vector3();

let sunlight = new THREE.DirectionalLight(0xffffff,1.5);
sunlight.position.set(100,200,100);
scene.add(sunlight);

//adding a sun 
const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32), // Large sphere for the sun
    new THREE.MeshBasicMaterial({ color: 0xffd700 }) // Glowing yellow sun
);
sunMesh.position.set(100, 200, 100); // Positioning the sun
scene.add(sunMesh);
//adding a moon
const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32), // Large sphere for the moon
    new THREE.MeshBasicMaterial({ color: 0xffffff }) // Grayish moon
);
moonMesh.position.set(-100, 200, -100); // Positioning the moon
scene.add(moonMesh); 

//giving the moon lighting
let moonlight = new THREE.DirectionalLight(0xffffff,0.5);
moonlight.position.set(-100,200,-100);
scene.add(moonlight);

function addStars()
{
    //creating the star geometry 
    const starGeaometry=new THREE.BufferGeometry();
    //a list of all of the star locations which we will create randomly 
    const starVertices = [];

    //creating 1000 stars 
    for(let i =0;i<1000;i++)
    {
        //random xyz coordinates
        const x=(Math.random()-0.5)*2000;
        const y=Math.random()*500+100;
        const z = (Math.random()-0.5)*2000;
        starVertices.push(x,y,z);
    }

    starGeaometry.setAttribute('position',new THREE.Float32BufferAttribute(starVertices,3));
    const starMaterial = new THREE.PointsMaterial({color:0xffffff});

    const starMesh=new THREE.Points(starGeaometry,starMaterial);
    starMesh.visible=false;
    scene.add(starMesh);
    return starMesh;
}

const stars=addStars();
//fucntion to set up daytime settings
function setDayMode() {
    isNight=false;

    //daytime color 
    scene.background =new THREE.Color(0x87CEEB);
    
    skyUniforms['turbidity'].value = 0.0001; // Lower = less hazy
    skyUniforms['rayleigh'].value = 0.1; // Less blue scattering
    skyUniforms['mieCoefficient'].value = 100; // Softer light scattering
    skyUniforms['mieDirectionalG'].value = .005; // Reduce direct light glow

    
    const phi = THREE.MathUtils.degToRad(5); 
    const theta = THREE.MathUtils.degToRad(180); 
    sun.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sun);

    //lighiting 
    ambientLight.color.set(0xffffff);
    ambientLight.intensity=0.5;

    //hiding the moon
    moonlight.intensity=0;
    sunlight.intensity=1.5;

    sunMesh.visible=true;
    moonMesh.visible=false;

    //we will hid the stars we have for the night 
    stars.visible = false;

    
}

//now for when we want it to me night time 
function setNightMode()
{
    isNight=true;
    scene.remove(sky);
    //now we change the sky color
    scene.background=new THREE.Color(0x0b0c1e);
    //change sky uniforms for night time 
    skyUniforms['turbidity'].value = 2;
    skyUniforms['rayleigh'].value = 0.2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    //changing the sun location
    const phi = THREE.MathUtils.degToRad(120);
    const theta = THREE.MathUtils.degToRad(180);
    sun.setFromSphericalCoords(1, phi, theta);
    skyUniforms['sunPosition'].value.copy(sun);
    //change the lighting 
    ambientLight.color.set(0x202040);
    ambientLight.intensity = 0.2;

    sunlight.intensity = 0.0;
    moonlight.intensity = 1.5; 
    sunMesh.visible=false;
    moonMesh.visible=true;
    //now we want to show the stars 
    stars.visible=true;
}
const clock = new THREE.Clock();
// This clock is used only for the charging bar in order to not messed up the animation
const clock2 = new THREE.Clock();
// This clock is used only for ballSimulation
const clock3 = new THREE.Clock();

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

// Lighting
const spotLight = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.5);
spotLight.position.set(0, 10, 0);
scene.add(spotLight);

// Floor (Court)
// Load the texture
// const floor = createHalfCourtFloor('./photos/halfcourt.jpg'); // Ensure correct path
// scene.add(floor);

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
// land.position.z = 7.5;
scene.add(land);

loadBasketballCourt(scene, renderer);

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
const speed = .05;

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
    
    balls.push({ mesh: ball, velocity: direction.multiplyScalar(speed_constant * multiplier), 
        score: false, from: ball.position, collision_immune: false, collision_time: 0 });
}

// Charging
let animation_time = 0;
let delta_animation_time = 0;
const T = 4;

function charge_ball(){
    requestAnimationFrame(charge_ball);
    delta_animation_time = clock2.getDelta();
    animation_time += delta_animation_time;
    let adjustment_factor = Math.sin((2 * Math.PI / T) * animation_time)
    chargingBar.scale.x = (0.5 + 0.5 * adjustment_factor);
    // Multiplier range from 0 to 2
    multiplier = (adjustment_factor + 1);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        charge_ball();
        shootBall();
    }
    if (event.code === 'KeyT') { 
        if (isNight) {
            setDayMode();
        } else {
            setNightMode();
        }
    }
});

setDayMode();



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
let ballToRim = new THREE.Vector3();
let ballToCenter = new THREE.Vector3();
let centerToRim = new THREE.Vector3();
let scorePerShot = 0;

// Wind vector
let angleX;
let angleY;
let angleZ;
const wind_constant = 0.00005;
let wind = new THREE.Vector3(1, 0, 0);
wind = wind.multiplyScalar(wind_constant);

function randomizeWind() {
    // Generate random rotation angles in radians
    angleX = (Math.random() - 0.5) * Math.PI * 0.1; // Small random rotations
    angleY = (Math.random() - 0.5) * Math.PI * 0.1;
    angleZ = (Math.random() - 0.5) * Math.PI * 0.1;

    // Create rotation matrices
    const rotationMatrixX = new THREE.Matrix4().makeRotationX(angleX);
    const rotationMatrixY = new THREE.Matrix4().makeRotationY(angleY);
    const rotationMatrixZ = new THREE.Matrix4().makeRotationZ(angleZ);

    // Apply rotations to the wind vector
    wind.applyMatrix4(rotationMatrixX);
    wind.applyMatrix4(rotationMatrixY);
    wind.applyMatrix4(rotationMatrixZ);
}

// Ball physics
let final_velocity = new THREE.Vector3(0,0,0);
let fps = 240;

function ballSimulation(ballObj, delta){
    ballBS = ballObj.mesh.geometry.boundingSphere;
    ballBS.center.copy(ballObj.mesh.position);

    // Check if the ball hit the ground
    if (ballObj.mesh.position.y - land.position.y <= 0.3){
        // apply bounce
        ballObj.velocity.y = Math.abs(ballObj.velocity.y);
        // the bounce absorb some energy, thus decrease the velocity
        ballObj.velocity.multiplyScalar(0.7);
    }
    // Check if the ball hit the backboard
    else if (backboardBB.intersectsSphere(ballBS) || baseBB.intersectsSphere(ballBS) || poleBB.intersectsSphere(ballBS)){
        if (ballObj.collision_immune == false){
            // compute angle between ballObj velocity and normal
            angle = ballObj.velocity.angleTo(backboardNormals);
            ballObj.velocity.applyAxisAngle(backboardNormals, -angle);
            // // apply bounce
            ballObj.velocity.multiplyScalar(-0.4);
            // collision immune
            ballObj.collision_immune = true;
            ballObj.collision_time = clock.getElapsedTime();
            console.log("Hit bb");
        }
    }
    // Check if the ball hit the support
    else if ( supportBB.intersectsSphere(ballBS) ){
        if (ballObj.collision_immune == false){
            // compute angle between ballObj velocity and normal
            angle = ballObj.velocity.angleTo(supportNormals);
            ballObj.velocity.applyAxisAngle(supportNormals, -angle);
            // // apply bounce
            ballObj.velocity.multiplyScalar(-0.3);
            // collision immune
            ballObj.collision_immune = true;
            ballObj.collision_time = clock.getElapsedTime();
        }
    }
    // Check if the ball hit the rim
    else if (rimBS.intersectsSphere(ballBS) && Math.abs(ballObj.mesh.position.y - rim.position.y) <= 0.17){
        // if (ballObj.collision_immune == false){

            ballToCenter.subVectors(rim.position, ballObj.mesh.position);
            centerToRim.set(ballToCenter.x, 0, ballToCenter.z);
            centerToRim.normalize().multiplyScalar(0.3);
            ballToRim.addVectors(ballToCenter, centerToRim).normalize();

            // Check if the ball goes in the rim (Only when the ball velocity's y component is negative
            // and the ball's x and z position is exactly the same as the rim's)
            if ( innerRimBS.containsPoint(ballObj.mesh.position) && ballObj.velocity.y < 0 && ballObj.score == false){
                ballObj.score = true;
                console.log("Score!");
                if (ballObj.from.distanceTo(rim.position) >= 7){
                    scorePerShot = 3;
                }
                else{
                    scorePerShot = 2;
                }
                updateScore(scorePerShot, balls.length);
            }
            ballObj.velocity.reflect(ballToRim);
        // }
    }
    // Apply air resistance and gravity
    else{
        // apply gravity
        ballObj.velocity.y -= acceleration_constant * 0.98 * delta * fps; 
        // apply air resistance
        ballObj.velocity.multiplyScalar(0.9999);
    }
    // Apply wind
    ballObj.velocity.add(wind);

    final_velocity.set(ballObj.velocity.x, ballObj.velocity.y, ballObj.velocity.z);
    final_velocity.multiplyScalar(delta * fps);
    ballObj.mesh.position.add(final_velocity);
    
}

let current_time;
function animate() {
    requestAnimationFrame(animate);
    let delta = clock3.getDelta();
    let final_speed = speed * delta * fps;
    if (keys['KeyW']) controls.moveForward(final_speed);
    if (keys['KeyS']) controls.moveForward(-final_speed);
    if (keys['KeyA']) controls.moveRight(-final_speed);
    if (keys['KeyD']) controls.moveRight(final_speed);
    
    // Every 3 seconds
    setInterval(randomizeWind, 3000); 
    current_time = clock.getElapsedTime();

    balls.forEach((ballObj) => {
        // Modify immunity frame status
        // Too small a duration -> Ball stuck
        // Too long a duration -> Ball phase through obj
        if (current_time - ballObj.collision_time > 0.1 * fps * delta){
            ballObj.collision_immune = false
        }
        ballSimulation(ballObj, delta);
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
