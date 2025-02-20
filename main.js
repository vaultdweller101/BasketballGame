import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const scene = new THREE.Scene();

//THREE.PerspectiveCamera( fov angle, aspect ratio, near depth, far depth );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10);
controls.target.set(0, 5, 0);

// Rendering 3D axis
const createAxisLine = (color, start, end) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
};
const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(3, 0, 0)); // Red
const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3, 0)); // Green
const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 3)); // Blue
scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);

// Setting up the lights
const pointLight = new THREE.PointLight(0xffffff, 100, 100);
pointLight.position.set(5, 5, 5); // Position the light
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, .0, 1.0).normalize();
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x505050);  // Soft white light
scene.add(ambientLight);

const phong_material = new THREE.MeshPhongMaterial({
    color: 0x00ff00, // Green color
    shininess: 100   // Shininess of the material
});

// Transformation Matrix

function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function rotationMatrixZ(theta) {
  return new THREE.Matrix4().set(
    Math.cos(theta),-Math.sin(theta), 0, 0,
    Math.sin(theta), Math.cos(theta), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );
}

function scaleMatrix(sx, sy, sz) {
  return new THREE.Matrix4().set(
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1
  );
}

// TODO: Create basketball
let basketball_geometry = new THREE.SphereGeometry(1, 32, 32);
let basketball_material = new THREE.MeshBasicMaterial({ color: 0xffa500 }); // Orange color
let basketball = new THREE.Mesh(basketball_geometry, basketball_material);
scene.add(basketball);

// TODO: Create basketball black stripes
let stripe_geometry = new THREE.CylinderGeometry(1.05, 1.05, 0.1, 32);
let stripe_material = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black color
let stripe1 = new THREE.Mesh(stripe_geometry, stripe_material);
let stripe2 = stripe1.clone();
let stripe3 = stripe1.clone();
let stripe4 = stripe1.clone();
scene.add(stripe1);
stripe2.rotation.z = Math.PI / 2;
scene.add(stripe2);
stripe3.scale.set(Math.sqrt(3)/2, 1, Math.sqrt(3)/2);
stripe3.translateY(0.5);
scene.add(stripe3);
stripe4.scale.set(Math.sqrt(3)/2, 1, Math.sqrt(3)/2);
stripe4.translateY(-0.5);
scene.add(stripe4);

// Attach the stripes to the basketball
basketball.add(stripe1);
basketball.add(stripe2);  
basketball.add(stripe3);
basketball.add(stripe4);

// TODO: Create backboard and hoop
let backboard_geometry = new THREE.BoxGeometry(2, 2, 0.1);
let backboard_material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color
let backboard = new THREE.Mesh(backboard_geometry, backboard_material);
backboard.position.set(0, 0, -6.05);
scene.add(backboard);

let hoop_geometry = new THREE.TorusGeometry(1.05, 0.05, 16, 100);
let hoop_material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
let hoop = new THREE.Mesh(hoop_geometry, hoop_material);
hoop.translateZ(1.1);
hoop.rotation.x = Math.PI / 2;
scene.add(hoop);

// Attach the hoop to the backboard
backboard.add(hoop);

// Create bounding boxes
basketball.geometry.computeBoundingBox();
backboard.geometry.computeBoundingBox();
hoop.geometry.computeBoundingBox();

// Clone bounding boxes to update positions dynamically
let basketballBoundingBox = new THREE.Box3().setFromObject(basketball);
let backboardBoundingBox = new THREE.Box3().setFromObject(backboard);
let hoopBoundingBox = new THREE.Box3().setFromObject(hoop);

// Reminder: y green x red z blue

let delta_animation_time;
const clock = new THREE.Clock();
// Not declare MAX_ANGLE with const gives error for some reason

function animate() {
  // ...
  delta_animation_time = clock.getDelta();

	renderer.render( scene, camera );
  controls.update();

  //   // TODO
  //   // Animate the cube

  if (throwed) {
    basketball.translateZ(-100 * delta_animation_time);
    basketballBoundingBox.setFromObject(basketball);
  
    // Check for collision with backboard
    if (basketballBoundingBox.intersectsBox(backboardBoundingBox)) {
        console.log("Collision with Backboard!");
        throwed = false; // Stop movement or add bounce effect
    }

    // Check for collision with hoop
    if (basketballBoundingBox.intersectsBox(hoopBoundingBox)) {
        console.log("Collision with Hoop!");
        throwed = false;
    }
  }
  
  if (basketball.position.z < -200){
    basketball.position.set(0, 0, 0);
    throwed = false;
  }
  // console.log(basketball.position);

}
renderer.setAnimationLoop( animate );

// TODO: Add event listener
let throwed = false;
window.addEventListener('keydown', onKeyPress); // onKeyPress is called each time a key is pressed
// Function to handle keypress
function onKeyPress(event) {
    switch (event.key) {
        case ' ':
            throwed = true;
            break;
        default:
            console.log(`Key ${event.key} pressed`);
    }
}