import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {createHalfCourtFloor} from './halfcourt.js';
//this is for the sky 
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { mx_fractal_noise_float } from 'three/src/nodes/TSL.js';
import loadBasketballCourt from './models/court/basketballCourt.js';
import {updateScore} from './score.js';
import loadNet from './models/net/net.js';
import ctreeLoad from './models/cocotree/cTree.js';
import stLightLoad from './models/stadLights/lights.js';
import createWall from './walls_fences/wallManager.js';
import { create_spheres, check_collision_against_spheres } from './collision_spheres.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//making the objects have shadows
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap; //trying this to see how smooth 

ctreeLoad(scene,renderer);
stLightLoad(scene,renderer);
const sky = new Sky();
sky.scale.setScalar(450000);
const skyUniforms = sky.material.uniforms;
//adding sky to scene
sky.castShadow=true;
scene.add(sky);


//I want to make it so that when I press a key, I toggle from night time to day time 
//the flag we will use to determine white one to display

//lighting 
let isNight = false;
let ambientLight = new THREE.AmbientLight(0xffffff,0.5);
//ambientLight.castShadow=true;
scene.add(ambientLight);


//now the sun 
let sun = new THREE.Vector3();

let sunlight = new THREE.DirectionalLight(0xffffff,1.5);
sunlight.position.set(50,100,50);
//making the sunlight cast a shadow
sunlight.castShadow=true;
sunlight.shadow.mapSize.width = 4096; // Higher resolution improves shadow quality
sunlight.shadow.mapSize.height = 4096;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 500;
sunlight.shadow.camera.left = -50;
sunlight.shadow.camera.right = 50;
sunlight.shadow.camera.top = 50;
sunlight.shadow.camera.bottom = -50;
scene.add(sunlight);



//adding a sun 
const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32), // Large sphere for the sun
    new THREE.MeshBasicMaterial({ color: 0xffd700 }) // Glowing yellow sun
);
sunMesh.position.set(100, 200, 100); // Positioning the sun
//shadows
sunMesh.castShadow=true;
scene.add(sunMesh);
//adding a moon
const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32), // Large sphere for the moon
    new THREE.MeshBasicMaterial({ color: 0xffffff }) // Grayish moon
);
moonMesh.position.set(100, 200, 100); // Positioning the moon
//shadows 
//moonMesh.castShadow=true;
scene.add(moonMesh); 

//giving the moon lighting
let moonlight = new THREE.DirectionalLight(0xffffff,0.5);
moonlight.position.set(100,200,100);
//making the moonlight cast a shadow
moonlight.castShadow=true;
moonlight.shadow.mapSize.width = 4096;
moonlight.shadow.mapSize.height = 4096;
moonlight.shadow.camera.near = 0.5;
moonlight.shadow.camera.far = 500;
moonlight.shadow.camera.left = -50;
moonlight.shadow.camera.right = 50;
moonlight.shadow.camera.top = 50;
moonlight.shadow.camera.bottom = -50;
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
//now I will create clouds for the daytime 
function setDayMode() {
    isNight=false;

    //daytime color 
    scene.background =new THREE.Color(0x87CEEB);
    scene.add(sky);
    
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
// This clock is used only to get setElapsedTime without triggering the delta time from the other clock, which is time between frames
const clock = new THREE.Clock();
// This clock is used only for the charging bar in order to not messed up the animation
const clock2 = new THREE.Clock();
// This clock is used only for ballSimulation
const clock3 = new THREE.Clock();
// This clock is used only to jump
const clock4 = new THREE.Clock();

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
// const spotLight = new THREE.SpotLight(0xffffff, 1.5, 50, Math.PI / 4, 0.5);
// spotLight.position.set(0, 10, 0);
// spotLight.castShadow=true;
// scene.add(spotLight);

// Floor (Court)
// Load the texture
// const floor = createHalfCourtFloor('./photos/halfcourt.jpg'); // Ensure correct path
// scene.add(floor);

const landGeometry = new THREE.PlaneGeometry(60, 60, 200, 200); // Increase segments for better shader effect

const landMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e7940,  // A nice grass green color
    roughness: 0.8,
    metalness: 0.1
});

const land = new THREE.Mesh(landGeometry, landMaterial);
land.rotation.x = -Math.PI / 2;
land.position.y = -0.1;
// land.position.z = 7.5;
//making the land recieve shadows 
land.receiveShadow=true;
scene.add(land);

// loading in the basketball court
loadBasketballCourt(scene, renderer);

// loading in the net
loadNet(scene, renderer);

createWall(scene, renderer);

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
pole.castShadow=true;

// Create Base
const baseGeometry = new THREE.BoxGeometry(1, 0.2, 0.5);
const base = new THREE.Mesh(baseGeometry, poleMaterial);
base.position.set(0, 0, -7); // -4.54
base.castShadow=true;
base.receiveShadow=true;
scene.add(base);

// Create Diagonal Support
const supportGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 16);
const support = new THREE.Mesh(supportGeometry, poleMaterial);
support.position.set(0, 2, -6.74);
support.rotation.set(Math.PI / 6, 0, 0);
support.castShadow=true;
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
rim.castShadow=true;
scene.add(rim);

// Backboard

// Load the backboard texture
const backboardTexture = textureLoader.load('photos/backboard.jpg');

backboardTexture.wrapS = THREE.RepeatWrapping;
backboardTexture.wrapT = THREE.RepeatWrapping;

// created an array to prevent the jpg from showing on all sides of the backboard
const materials = [
    new THREE.MeshStandardMaterial({ color: 0xffffff }),  // Right side
    new THREE.MeshStandardMaterial({ color: 0xffffff }),  // Left side
    new THREE.MeshStandardMaterial({ color: 0xffffff }),  // Top side
    new THREE.MeshStandardMaterial({ color: 0xffffff }),  // Bottom side
    new THREE.MeshStandardMaterial({ map: backboardTexture }), // Front (with texture)
    new THREE.MeshStandardMaterial({ color: 0xffffff })   // Back side
];

// Create the backboard geometry (a flat rectangle)
const backboardGeometry = new THREE.BoxGeometry(2, 1, .1);
const backboard = new THREE.Mesh(backboardGeometry, materials);
backboard.position.set(0, 3, -6.4);
backboard.castShadow=true;
backboard.receiveShadow=true;
scene.add(backboard);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

// Movement
const keys = {};
document.addEventListener('keydown', (event) => (keys[event.code] = true));
document.addEventListener('keyup', (event) => (keys[event.code] = false));
// Running speed: 10 m/s
const speed = 30;

// Create a texture loader
const textureLoaderBall = new THREE.TextureLoader();
const basketballTexture = textureLoaderBall.load('/textures/ball/ball.png');  // Adjust path if needed

// Ball shooting
const balls = [];
let multiplier = 1;

function shootBall() {
    const ballGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    
    // Create a material with the loaded texture
    const ballMaterial = new THREE.MeshStandardMaterial({
        map: basketballTexture,          // Apply texture
        metalness: 0.3,                  // Optional: add metallic look
        roughness: 0.8                   // Optional: adjust roughness for a realistic look
    });
    
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.geometry.computeBoundingSphere();
    ball.frustumCulled = false;
    ball.castShadow=true;
    scene.add(ball); 
    
    ball.position.copy(camera.position);    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    //keeping track of when the ball was created
    const createdAt = clock.getElapsedTime();
    // default ball speed is 10 m/s
    balls.push({ mesh: ball, velocity: direction.multiplyScalar(10 * multiplier), 
        score: false, from: ball.position, collision_immune: false, collision_time: 0 ,createdAt: createdAt});
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

let jump_velocity = new THREE.Vector3(0, 5, 0);
let final_jump_velocity = jump_velocity.clone();
let deltaTime;
let id;

function jump() {

    let jumpLoop = () => {

        id = requestAnimationFrame(jumpLoop);
        deltaTime = clock4.getDelta();
        jump_velocity.y -= 9.8 * deltaTime; // Simulating gravity
        final_jump_velocity.set(jump_velocity.x, jump_velocity.y, jump_velocity.z);
        camera.position.add(final_jump_velocity.multiplyScalar(deltaTime));

        if (camera.position.y <= 1.5) { // If landed, stop jumping
            console.log("Land");
            camera.position.y = 1.5; // Reset to ground level
            jump_velocity.set(0, 5, 0); // Reset jump velocity
            cancelAnimationFrame(id);
            return;
        }
    };

    jumpLoop();
    return;
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
    if (event.code === 'ShiftLeft') {
        ///camera.position.y += 0.2;
        jump();
    }
});

setDayMode();

// Deconstruct rim into a bunch of spheres
const spheres = [];
// Deconstruct net into a bunch of spheres
const net_spheres = [];

// rim.visible = false;

// For the rim itself
create_spheres(50, rim.position, 0.02, 0.3, spheres);
// For the net
const net_collision_sphere_size = 0.02;
let rim_position_1 = rim.position.clone();
let delta_width = 0.02;
let new_radius = 0.34;

for (let i = 0; i < 8; i ++ ){
    rim_position_1.y -= 0.05;
    new_radius -= delta_width;
    create_spheres(50, rim_position_1, net_collision_sphere_size, new_radius, net_spheres);
}

for (let i = 0; i < 4; i ++){
    rim_position_1.y -= 0.05;
    create_spheres(50, rim_position_1, net_collision_sphere_size, new_radius, net_spheres);
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

// ScoreBS
let scoreBS = new THREE.Sphere(rim.position, 0.15);

let angle;
let ballToRim = new THREE.Vector3();
let scorePerShot = 0;

// Wind vector
let angleX;
let angleY;
let angleZ;

// Wind speed set to 1 m/s
let wind = new THREE.Vector3(1, 0, 0);

function randomizeWind() {
    // Reset wind vector
    wind.set(1, 0, 0);

    // Generate random rotation angles in radians
    angleX = Math.random() * Math.PI * 2; 
    angleY = Math.random() * Math.PI * 2;
    angleZ = Math.random() * Math.PI * 2;

    // Create rotation matrices
    const rotationMatrixX = new THREE.Matrix4().makeRotationX(angleX);
    const rotationMatrixY = new THREE.Matrix4().makeRotationY(angleY);
    const rotationMatrixZ = new THREE.Matrix4().makeRotationZ(angleZ);

    // Apply rotations to the wind vector
    wind.applyMatrix4(rotationMatrixX);
    wind.applyMatrix4(rotationMatrixY);
    wind.applyMatrix4(rotationMatrixZ);

    // Random wind magnitude according to this reference: https://www.weather.gov/pqr/wind, Calm to Moderate Breeze
    wind.multiplyScalar(Math.random() * 8);
}

// Ball physics
let final_velocity = new THREE.Vector3(0,0,0);
let which_sphere;
let which_sphere_net;
// mass of basketball: 600 g = 0.6 kg
const mass = 0.6;
let drag_acceleration = new THREE.Vector3(0,0,0);
let lift_acceleration = new THREE.Vector3(0,0,0);
let flow = new THREE.Vector3(0,0,0);
// set angular velocity to 6 rad/s
let angular_velocity = 6;
// Hard code spin axis to only be around horizontal axis
let spinAxis = new THREE.Vector3(0, 0, 0);
// Velocity projection on xz plane
let projection = new THREE.Vector3(0,0,0);
// vector to aim ball at the center of the net
let throw_vector = new THREE.Vector3(0,0,0);

function ballSimulation(ballObj, delta){
    ballBS = ballObj.mesh.geometry.boundingSphere;
    ballBS.center.copy(ballObj.mesh.position);
    
    which_sphere = check_collision_against_spheres(ballBS, spheres);
    which_sphere_net = check_collision_against_spheres(ballBS, net_spheres);

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
            ballObj.velocity.x *= -0.6;
            ballObj.velocity.z *= -0.6;
            ballObj.velocity.y *= -1;
            // multiplyScalar(-0.6);
            // collision immune
            ballObj.collision_immune = true;
            ballObj.collision_time = clock.getElapsedTime();
        }
    }
    // Check if the ball hit the support
    else if ( supportBB.intersectsSphere(ballBS) ){
        // compute angle between ballObj velocity and normal
        angle = ballObj.velocity.angleTo(supportNormals);
        ballObj.velocity.applyAxisAngle(supportNormals, -angle);
        // // apply bounce
        ballObj.velocity.multiplyScalar(-1);
    }
    // Check if the ball hit the rim
    else if (which_sphere != -1){
        ballToRim.subVectors(spheres[which_sphere].center, ballObj.mesh.position).normalize();
        ballObj.velocity.reflect(ballToRim);
        ballObj.velocity.y = - Math.abs(ballObj.velocity.y);
    }

    // Check if the ball hit the net
    if (which_sphere_net != -1){
        ballToRim.subVectors(net_spheres[which_sphere_net].center, ballObj.mesh.position).normalize();
        ballObj.velocity.reflect(ballToRim);
    }

    // Scoring
    if ( scoreBS.containsPoint(ballObj.mesh.position) && ballObj.velocity.y < 0 && ballObj.score == false){
        ballObj.score = true;
        console.log("Score!");
        if (ballObj.from.distanceTo(rim.position) >= 2.2){
            scorePerShot = 3;
        }
        else{
            scorePerShot = 2;
        }
        updateScore(scorePerShot, balls.length);
    }

    // apply gravity, lift and drag only while on air
    if (ballObj.mesh.position.y - land.position.y > 0.3){
        ballObj.velocity.y -=  9.8 * delta; 

        // Calculate lift: https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/beach.html
        // Find flow of air
        flow.subVectors(wind, ballObj.velocity);
        // axis of rotation would be cross product between velocity and velocity projection on xz plane
        projection.set(ballObj.velocity.x, 0, ballObj.velocity.z);
        spinAxis.crossVectors(ballObj.velocity, projection).normalize();
        // Apply lift, whose normalized vector is a cross product between flow direction and axis of rotation
        lift_acceleration.crossVectors(spinAxis, flow).normalize();
        // F = (0.3 * 2 * Math.PI * rotational_velocity * radius * radius * |ball_velocity - wind_velocity|) * (2 * radius) * (pi / 4)
        lift_acceleration.multiplyScalar(0.3 * 2 * Math.PI * angular_velocity * 0.15 * 0.15 * flow.length() * 2 * 0.15 * Math.PI / 4);
        // a = F/m
        lift_acceleration.divideScalar(mass);
        ballObj.velocity.add(lift_acceleration.multiplyScalar(delta));

        // Calculate drag
        // Drag's direction is that of of air flow
        drag_acceleration.set(flow.x, flow.y, flow.z).normalize();
        // // F = 1/2 * 1.3 * |ball_velocity - wind_velocity|^2 * pi * radius * radius * 0.5
        drag_acceleration.multiplyScalar(1/2 * 1.3 * flow.length() * flow.length() * Math.PI * 0.15 * 0.15 * 0.5);
        // // a = F/m
        drag_acceleration.divideScalar(mass);
        ballObj.velocity.add(drag_acceleration.multiplyScalar(delta));

        // Make the ball spin visually
        if (ballObj.velocity.length() > 0.1){
            if (ballObj.velocity.z > 0){
                ballObj.mesh.rotation.x += delta * angular_velocity;
            }
            else if (ballObj.velocity.z < 0){
                ballObj.mesh.rotation.x -= delta * angular_velocity;
            }
            if (ballObj.velocity.x > 0){
                ballObj.mesh.rotation.z += delta * angular_velocity;
            }
            else if (ballObj.velocity.x < 0){
                ballObj.mesh.rotation.z -= delta * angular_velocity;
            }
        }
    }

    // Multiply with delta to make sure it's independent of framerate
    final_velocity.set(ballObj.velocity.x, ballObj.velocity.y, ballObj.velocity.z);
    final_velocity.multiplyScalar(delta);
    ballObj.mesh.position.add(final_velocity);

    // console.log(ballObj.from.distanceTo(rim.position));
}

let current_time;
function animate() {
    requestAnimationFrame(animate);
    let delta = clock3.getDelta();
    let final_speed = speed * delta;
    if (keys['KeyW']) controls.moveForward(final_speed);
    if (keys['KeyS']) controls.moveForward(-final_speed);
    if (keys['KeyA']) controls.moveRight(-final_speed);
    if (keys['KeyD']) controls.moveRight(final_speed);
    
    // Every 1 seconds
    setInterval(randomizeWind, 3000); 
    current_time = clock.getElapsedTime();
    //handling the deletion of the ball
    for (let i = balls.length - 1; i >= 0; i--) {
        if (current_time - balls[i].createdAt > 10) {
            scene.remove(balls[i].mesh);
            balls.splice(i, 1);
        }
    }
    balls.forEach((ballObj) => {
        // Modify immunity frame status
        // Too small a duration -> Ball stuck
        // Too long a duration -> Ball phase through obj
        if (current_time - ballObj.collision_time > 10 * delta){
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
