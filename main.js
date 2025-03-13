import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { GLTFLoader } from "three/examples/jsm/Addons.js";
import {createHalfCourtFloor} from './halfcourt.js';
//this is for the sky 
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { mx_fractal_noise_float } from 'three/src/nodes/TSL.js';
import loadBasketballCourt from './models/court/basketballCourt.js';
import {updateScore, getScore} from './score.js';
import loadNet from './models/net/net.js';
import ctreeLoad from './models/cocotree/cTree.js';
import stLightLoad from './models/stadLights/lights.js';
import createWall from './walls_fences/wallManager.js';
import { create_spheres, check_collision_against_spheres } from './collision_spheres.js';
// this is for sound
import { playRimHitSound, playAmbientSound, playCongratulationSound } from './sound.js';

// Create Loading Screen Overlay
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loadingScreen';
loadingScreen.style.position = 'fixed';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.background = 'rgba(0, 0, 0, 0.8)';
loadingScreen.style.display = 'flex';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.color = 'white';
loadingScreen.style.fontSize = '24px';
loadingScreen.style.zIndex = '10';

const loadingText = document.createElement('p');
loadingText.innerText = 'Loading...';

loadingScreen.appendChild(loadingText);
document.body.appendChild(loadingScreen);

// Create Timer Display
const timerDisplay = document.createElement('div');
timerDisplay.id = 'timerDisplay';
timerDisplay.style.position = 'fixed';
timerDisplay.style.top = '20px';
timerDisplay.style.right = '20px';
timerDisplay.style.color = 'white';
timerDisplay.style.fontSize = '24px';
timerDisplay.style.background = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent background
timerDisplay.style.padding = '10px 15px';
timerDisplay.style.borderRadius = '5px';
timerDisplay.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(timerDisplay);

// Create High Score Display
const highScoreDisplay = document.createElement('div');
highScoreDisplay.id = 'highScoreDisplay';
highScoreDisplay.style.position = 'fixed';
highScoreDisplay.style.top = '80px';
highScoreDisplay.style.right = '20px';
highScoreDisplay.style.color = 'white';
highScoreDisplay.style.fontSize = '20px';
highScoreDisplay.style.background = 'rgba(0, 0, 0, 0.7)';
highScoreDisplay.style.padding = '10px 15px';
highScoreDisplay.style.borderRadius = '5px';
highScoreDisplay.style.fontFamily = 'Arial, sans-serif';
document.body.appendChild(highScoreDisplay);

// Load High Score from localStorage (or set to 0 if not found)
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
highScoreDisplay.innerText = `High Score: ${highScore}`;

// Function to update the timer
let timeLeft = 60; // 20 seconds to play
let endGame = false;

function updateTimer() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerDisplay.innerText = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if (timeLeft > 0) {
        timeLeft--;
        setTimeout(updateTimer, 1000); // Call every second
    } else {
        endGame = true;
        timerDisplay.innerText = "Time's Up!";
        endGameFunc();
    }
}

// Function to end the game and show a popup
function endGameFunc() {
    let playerScore = getScore(); // Call your existing function to get the player's score

    // Check if player beats the high score
    if (playerScore > highScore) {
        highScore = playerScore; // Update high score
        localStorage.setItem('highScore', highScore); // Save new high score to localStorage
        highScoreDisplay.innerText = `High Score: ${highScore}`; // Update UI
    }

    // let playAgain = confirm(`Time's Up!\nYour Score: ${playerScore}\nDo you want to try again?`);

    // if (playAgain) {
    //     location.reload(); // Reload the game if the player wants to try again
    // }
}

// Function to start the game after a few seconds
setTimeout(() => {
    loadingScreen.style.display = 'none'; // Hide loading screen
    document.addEventListener('click', () => controls.lock()); // Enable controls
    animate(); // Start the game loop
    updateTimer(); // Start the timer
    playAmbientSound(); // Start the ambient sound
}, 2000); // 2000 milliseconds 

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
chargingBarBackground.position.set(0, 0.05, -0.1);
camera.add(chargingBarBackground);

// Charging bar to indicate how much power the player is using to shoot the ball
const chargingBarGeometry = new THREE.PlaneGeometry(0.1, 0.01);
const chargingBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); 
const chargingBar = new THREE.Mesh(chargingBarGeometry, chargingBarMaterial);
chargingBar.position.set(0, 0.05, -0.1);
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
//making the players arms
function createPlayerArms() {
    // arms group to hold both arms 
    const armsGroup = new THREE.Group();
  
    // using standard mesh material
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0ac69, // Natural skin tone
      roughness: 0.6,
      metalness: 0.05,
      transparent: false
    });
  //the color of the shirt 
    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x4285f4, 
      roughness: 0.5,
      metalness: 0.1
    });
  
    // helper function to create are
    function createArm(isRight) {
      const armGroup = new THREE.Group();
  
      //upper arm 
      const upperArmGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.3, 8);
      const upperArm = new THREE.Mesh(upperArmGeometry, shirtMaterial);
      upperArm.position.set(0, -0.15, 0);
      upperArm.castShadow = true;
      upperArm.receiveShadow = true;
  
      // elbow joint
      const elbowGeometry = new THREE.SphereGeometry(0.04, 8, 8);
      const elbow = new THREE.Mesh(elbowGeometry, shirtMaterial);
      elbow.position.set(0, -0.3, 0);
      elbow.castShadow = true;
      elbow.receiveShadow = true;
  
      //forarm 
      const forearmGeometry = new THREE.CylinderGeometry(0.04, 0.035, 0.25, 8);
      const forearm = new THREE.Mesh(forearmGeometry, skinMaterial);
      forearm.position.set(0, -0.15, 0);
      forearm.castShadow = true;
      forearm.receiveShadow = true;
  
      //forearm group
      const forearmGroup = new THREE.Group();
      forearmGroup.add(forearm);
      forearmGroup.position.set(0, -0.3, 0);
  
      //wrist
      const wristGeometry = new THREE.SphereGeometry(0.035, 8, 8);
      const wrist = new THREE.Mesh(wristGeometry, skinMaterial);
      wrist.position.set(0, -0.25, 0);
      wrist.castShadow = true;
      wrist.receiveShadow = true;
      forearmGroup.add(wrist);
  
      //creating the hand 
      const handGroup = createHand(isRight);
      handGroup.position.set(0, -0.3, 0);
      forearmGroup.add(handGroup);
  
      //building arm hierchy 
      armGroup.add(upperArm);
      armGroup.add(elbow);
      armGroup.add(forearmGroup);
  
      return {
        group: armGroup,
        upperArm: upperArm,
        forearmGroup: forearmGroup,
        handGroup: handGroup
      };
    }
  
    //function to build hand 
    function createHand(isRight) {
      const handGroup = new THREE.Group();
  
      //building the palm
      const palmGeometry = new THREE.BoxGeometry(0.07, 0.03, 0.08);
      palmGeometry.translate(0, -0.015, 0.04);
      const palm = new THREE.Mesh(palmGeometry, skinMaterial);
      palm.castShadow = true;
      palm.receiveShadow = true;
      handGroup.add(palm);
  
      //building the fingers 
      const fingerPositions = [
        { x: 0.025, y: -0.015, z: 0.07, scale: 0.9 },   // Thumb
        { x: 0.025, y: -0.015, z: 0.09, scale: 1.0 },   // Index
        { x: 0.0, y: -0.015, z: 0.09, scale: 1.05 },    // Middle
        { x: -0.025, y: -0.015, z: 0.09, scale: 0.95 }, // Ring
        { x: -0.045, y: -0.015, z: 0.085, scale: 0.85 } // Pinky
      ];
  
      fingerPositions.forEach((pos, index) => {
        const xPos = isRight ? pos.x : -pos.x;
        let fingerGeometry, rotation;
  
        if (index === 0) {
          fingerGeometry = new THREE.CapsuleGeometry(0.015, 0.06, 4, 6);
          rotation = isRight ? 
            new THREE.Euler(0.3, 0.5, -0.4) :
            new THREE.Euler(0.3, -0.5, 0.4);
        } else {
          const fingerRadius = 0.012 * pos.scale;
          const fingerLength = 0.07 * pos.scale;
          fingerGeometry = new THREE.CapsuleGeometry(fingerRadius, fingerLength, 4, 6);
          rotation = new THREE.Euler(-0.1, 0, 0);
        }
  
        const finger = new THREE.Mesh(fingerGeometry, skinMaterial);
        finger.position.set(xPos, pos.y, pos.z);
        finger.rotation.copy(rotation);
        finger.castShadow = true;
        finger.receiveShadow = true;
        handGroup.add(finger);
      });
  
      return handGroup;
    }
  
    // Create left and right arms
    const rightArmComponents = createArm(true);
    const leftArmComponents = createArm(false);
  
    // Position arms relative to the camera
    rightArmComponents.group.position.set(0.25, -0.2, -0.25);
    leftArmComponents.group.position.set(-0.25, -0.2, -0.25);
  
    rightArmComponents.group.rotation.set(0.3, 0, -0.1);
    leftArmComponents.group.rotation.set(0.3, 0, 0.1);
  
    // Add arms to the main group
    armsGroup.add(rightArmComponents.group);
    armsGroup.add(leftArmComponents.group);
  
    // Add arms to the camera
    camera.add(armsGroup);
  
    console.log("Arms added to the scene:", armsGroup);
  
    return {
      armsGroup,
      rightArm: rightArmComponents.group,
      leftArm: leftArmComponents.group,
      rightForearm: rightArmComponents.forearmGroup,
      leftForearm: leftArmComponents.forearmGroup,
      rightHand: rightArmComponents.handGroup,
      leftHand: leftArmComponents.handGroup
    };
  }
  
  // Adjust camera near clipping plane
  camera.near = 0.01;
  camera.updateProjectionMatrix();
  
  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 2, 3);
  scene.add(directionalLight);
  
  // Debug logging
  console.log("Camera settings:", camera);
//creating the arms 
const playerArms = createPlayerArms();
//now to make parameter for the animation
let armSwingPhase=0;
const armSwingSpeed=5;
const armSwingAmount=0.3; //how far the arm will swing 
const armClock = new THREE.Clock();

//animating them seprately 
function animatePlayerArms(playerArms, keys, deltaTime) {
    const armSwingSpeed = 5;
    const armSwingAmount = 0.3;
    
    // Determine if player is moving
    const isMoving = keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'];
    
    // Update animation phase
    if (isMoving) {
      armSwingPhase += deltaTime * armSwingSpeed;
    } else {
      // Gradually return to rest position
      if (armSwingPhase % (2 * Math.PI) > 0.1) {
        armSwingPhase += deltaTime * armSwingSpeed * 0.5;
      } else {
        armSwingPhase = 0;
      }
    }
    
    // Apply animation if moving or returning to rest
    if (isMoving || armSwingPhase !== 0) {
      // Calculate swing based on sin waves
      const rightArmSwing = Math.sin(armSwingPhase) * armSwingAmount;
      const leftArmSwing = Math.sin(armSwingPhase + Math.PI) * armSwingAmount; // Opposite phase
      
      // Apply swing to entire arms
      playerArms.rightArm.rotation.x = 0.3 + rightArmSwing;
      playerArms.leftArm.rotation.x = 0.3 + leftArmSwing;
      
      // Add subtle vertical movement
      playerArms.rightArm.position.y = -0.2 + Math.abs(rightArmSwing) * 0.05;
      playerArms.leftArm.position.y = -0.2 + Math.abs(leftArmSwing) * 0.05;
      
      // Add subtle forearm rotation (bending at the elbow)
      playerArms.rightForearm.rotation.x = -0.1 - rightArmSwing * 0.5;
      playerArms.leftForearm.rotation.x = -0.1 - leftArmSwing * 0.5;
      
      // Add subtle hand rotation
      playerArms.rightHand.rotation.x = Math.sin(armSwingPhase) * 0.15;
      playerArms.leftHand.rotation.x = Math.sin(armSwingPhase + Math.PI) * 0.15;
    }
  }
//creating an anamation for when player shoot the ball
function animateShootingMotion(playerArms) {
    //storing the original postions to go back to them later 
    const originalRightRotation = playerArms.rightArm.rotation.clone();
    const originalLeftRotation = playerArms.leftArm.rotation.clone();
    const originalRightForearmRotation = playerArms.rightForearm.rotation.clone();
    const originalLeftForearmRotation = playerArms.leftForearm.rotation.clone();
    
    // how long the animation will last set it to 5 seconds 
    const duration = 0.5;
    //start time is set to the time this function is called
    const startTime = performance.now();
    
    // this is where we create the shooting animation 
    function performShootingAnimation() {
        //converts elapsed time to seconds, so the time now - the time before and diving it by 1000
      const elapsed = (performance.now() - startTime) / 1000; 
      const progress = Math.min(elapsed / duration, 1); 
      
      if (progress < 1) {
        //this is the first half of the animation 
        if (progress < 0) {
          const p = progress / 0.3;
          //drawing arms back 
          playerArms.rightArm.rotation.x = originalRightRotation.x - p * 0.5;
          playerArms.leftArm.rotation.x = originalLeftRotation.x - p * 0.5;
          //bending the elbows
          playerArms.rightForearm.rotation.x = originalRightForearmRotation.x - p * 0.3;
          playerArms.leftForearm.rotation.x = originalLeftForearmRotation.x - p * 0.3;
        } 
        //second half whcih is pushing forward 
        else {
          const p = (progress - 0.3) / 0.7;
          //pushing arms forward
          playerArms.rightArm.rotation.x = originalRightRotation.x - 0.5 + p * 2.0;
          playerArms.leftArm.rotation.x = originalLeftRotation.x - 0.5 + p * 1.0;
          // elbow extending 
          playerArms.rightForearm.rotation.x = originalRightForearmRotation.x - 0.3 + p * 0.7*2.0;
          playerArms.leftForearm.rotation.x = originalLeftForearmRotation.x - 0.3 + p * 0.7*2.0;
        }
        
        requestAnimationFrame(performShootingAnimation);
      } else {
        //then we go back to the original player postition
        setTimeout(() => {
          playerArms.rightArm.rotation.copy(originalRightRotation);
          playerArms.leftArm.rotation.copy(originalLeftRotation);
          playerArms.rightForearm.rotation.copy(originalRightForearmRotation);
          playerArms.leftForearm.rotation.copy(originalLeftForearmRotation);
        }, 200);
        //shoting the ball after we have exectuted the first half of the animation 
        shootBall();
      }
    }
    
    //strarting the animation 
    performShootingAnimation();
  }  
// Controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

// Movement
const keys = {};
document.addEventListener('keydown', (event) => (keys[event.code] = true));
document.addEventListener('keyup', (event) => (keys[event.code] = false));
// Running speed: 10 m/s
const speed = 10;

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
        score: false, from: ball.position.clone(), collision_immune: false, collision_time: 0 ,createdAt: createdAt});
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
        animateShootingMotion(playerArms);
        charge_ball();
        //shootBall(); will now shoot after animation is done, called inside animateShooting 
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
const rho = 1.3; // density of air in kg/m^3
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
    if (ballObj.mesh.position.y - land.position.y <= 0.2){
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
            playRimHitSound();
        }
    }
    // Check if the ball hit the support
    else if ( supportBB.intersectsSphere(ballBS) ){
        // compute angle between ballObj velocity and normal
        angle = ballObj.velocity.angleTo(supportNormals);
        ballObj.velocity.applyAxisAngle(supportNormals, -angle);
        // // apply bounce
        ballObj.velocity.multiplyScalar(-1);
        playRimHitSound();
    }
    // Check if the ball hit the rim
    else if (which_sphere != -1){
        ballToRim.subVectors(spheres[which_sphere].center, ballObj.mesh.position).normalize();
        ballObj.velocity.reflect(ballToRim);
        ballObj.velocity.y = - Math.abs(ballObj.velocity.y);
        playRimHitSound();
    }

    // Check if the ball hit the net
    if (which_sphere_net != -1){
        ballToRim.subVectors(net_spheres[which_sphere_net].center, ballObj.mesh.position).normalize();
        ballObj.velocity.reflect(ballToRim);
    }

    // Scoring
    if ( scoreBS.containsPoint(ballObj.mesh.position) && ballObj.velocity.y < 0 && ballObj.score == false && endGame == false){
        ballObj.score = true;
        console.log("Score from: " + ballObj.from.distanceTo(rim.position) + " meters away");
        if (ballObj.from.distanceTo(rim.position) >= 7){
            scorePerShot = 3;
        }
        else{
            scorePerShot = 2;
        }
        updateScore(scorePerShot, balls.length);
        playCongratulationSound();
    }

    // apply gravity, lift and drag only while on air
    if (ballObj.mesh.position.y - land.position.y > 0.2){
        ballObj.velocity.y -=  9.8 * delta; 

        // Calculate lift: https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/beach.html
        // Find flow of air
        flow.subVectors(wind, ballObj.velocity);
        // axis of rotation would be cross product between velocity and velocity projection on xz plane
        projection.set(ballObj.velocity.x, 0, ballObj.velocity.z);
        spinAxis.crossVectors(ballObj.velocity, projection).normalize();
        // Apply lift, whose normalized vector is a cross product between flow direction and axis of rotation
        lift_acceleration.crossVectors(spinAxis, flow).normalize();
        // F = Rho  *      G                                              *   v                              * 2r           * pi/4
        // F = (1.3 * 2 * Math.PI * rotational_velocity * radius * radius * |ball_velocity - wind_velocity|) * (2 * radius) * (pi / 4)
        lift_acceleration.multiplyScalar(rho * 2 * Math.PI * angular_velocity * 0.15 * 0.15 * flow.length() * 2 * 0.15 * Math.PI / 4);
        // a = F/m
        lift_acceleration.divideScalar(mass);
        ballObj.velocity.add(lift_acceleration.multiplyScalar(delta));

        // Calculate drag
        // Drag's direction is that of of air flow
        drag_acceleration.set(flow.x, flow.y, flow.z).normalize();
        // // F = 1/2 * 1.3 * |ball_velocity - wind_velocity|^2 * pi * radius * radius * 0.5
        drag_acceleration.multiplyScalar(1/2 * rho * flow.length() * flow.length() * Math.PI * 0.15 * 0.15 * 0.5);
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
    animatePlayerArms(playerArms, keys, delta);
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
    // console.log(camera.position.distanceTo(rim.position));
}

camera.position.set(0, 1.5, 5);
// animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

