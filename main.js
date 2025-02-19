import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { cos } from 'three/tsl';

// susu

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


// ***** Assignment 2 *****
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


// Start here.

const l = 0.5
const positions = new Float32Array([
    // Front face
    -l, -l,  l, // 0
     l, -l,  l, // 1
     l,  l,  l, // 2
    -l,  l,  l, // 3

    // Left face
    -l, -l, -l, // 4
    -l, -l,  l, // 5
    -l,  l,  l, // 6 
    -l,  l, -l, // 7
  
    // Top face
     l,  l,  l, // 8
    -l,  l,  l, // 9
    -l,  l, -l, // 10
     l,  l, -l, // 11

    // Bottom face
     l, -l,  l,  // 12
    -l, -l,  l,  // 13
    -l, -l, -l,  // 14
     l, -l, -l,  // 15

    // Right face
     l, -l, -l,  // 16
     l, -l,  l,  // 17
     l,  l,  l,  // 18
     l,  l, -l,  // 19

     // Back face
    -l, -l, -l,  // 20
     l, -l, -l,  // 21
     l,  l, -l,  // 22
    -l,  l, -l,  // 23
  ]);
  
  const indices = [
    // Front face
    0, 1, 2,
    0, 2, 3,
  
    // Left face
    4, 5, 6,
    4, 6, 7,
  
    // Top face
    9, 8, 10,
    10, 8, 11,
  
    // Bottom face
    12, 13, 14,
    12, 14, 15,
  
    // Right face
    17, 16, 18,
    18, 16, 19,

    // Back face
    21, 20, 22,
    22, 20, 23,
    
  ];
  
  // Compute normals
  const normals = new Float32Array([
    // Front face
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  
    // Left face
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
  
    // Top face
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
  
    // Bottom face
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  
    // Right face
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // Back face
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
  ]);

const custom_cube_geometry = new THREE.BufferGeometry();
custom_cube_geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
custom_cube_geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
custom_cube_geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

let cube = new THREE.Mesh( custom_cube_geometry, phong_material );
// scene.add(cube);

// TODO: Implement wireframe geometry
const wireframe_vertices = new Float32Array([
  // Front face
      -l, -l, l,
      l, -l, l,
      l, -l, l,
      l, l, l,
      l, l, l,
      -l, l, l,
      -l, l, l,
      -l, -l, l,
  // Top face
      -l, l, -l,
      -l, l, l,
      -l, l, l,
      l, l, l,
      l, l, l,
      l, l, -l,
      l, l, -l,
      -l, l, -l,
  // Bottom face
      -l, -l, l,
      -l, -l, -l,
      -l, -l, -l,
      l, -l, -l,
      l, -l, -l,
      l, -l, l,
      l, -l, l,
      -l, -l, l,
  // Left face
      -l, -l, -l,
      -l, -l, l,
      -l, -l, l,
      -l, l, l,
      -l, l, l,
      -l, l, -l,
      -l, l, -l,
      -l, -l, -l,
  // Right face
      l, -l, l,
      l, -l, -l,
      l, -l, -l,
      l, l, -l,
      l, l, -l,
      l, l, l,
      l, l, l,
      l, -l, l,
  // Back face
      l, -l, -l,
      -l, -l, -l,
      -l, -l, -l,
      -l, l, -l,
      -l, l, -l,
      l, l, -l,
      l, l, -l,
      l, -l, -l,
]);

const wireframe_geometry = new THREE.BufferGeometry();
wireframe_geometry.setAttribute( 'position', new THREE.BufferAttribute( wireframe_vertices, 3 ) );
const wireframe_material = new THREE.LineBasicMaterial( { color: 0xffffff } );

let wireframe = new THREE.LineSegments( wireframe_geometry, wireframe_material );

function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}
// TODO: Implement the other transformation functions.

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

let cubes = [];
let wireframes = [];
for (let i = 0; i < 7; i++) {
	let cube = new THREE.Mesh(custom_cube_geometry, phong_material);
	cube.matrixAutoUpdate = false;
	cubes.push(cube);
	scene.add(cube);

  let wireframe = new THREE.LineSegments( wireframe_geometry, wireframe_material );
  wireframe.matrixAutoUpdate = false;
  wireframes.push(wireframe);
  scene.add(wireframe);

  cubes[i].visible = true;
  wireframes[i].visible = false;
}

// TODO: Transform cubes

const scaleFactor = 1.5;

// Rotate the cubes. Reminder: y green x red z blue
const rotationZ = rotationMatrixZ(Math.PI/18); // Rotate 10 degrees
const translation_bottom_left_to_origin = translationMatrix(l, l * scaleFactor, 0); // Translate the cube to the origin
const translation_origin_to_top_left = translationMatrix(-l, l * scaleFactor, 0); // Translate the cube to the top left

const scale = scaleMatrix(1, 1 * scaleFactor, 1); // Scale the cube by 1.5 in the y direction

let animation_time = 0;
let delta_animation_time;
let rotation_angle;
const clock = new THREE.Clock();
// Not declare MAX_ANGLE with const gives error for some reason
const MAX_ANGLE = 10 * Math.PI/180;
const T = 2;

let model_transformation_animated = new THREE.Matrix4();

function animate() {
  // ...
  delta_animation_time = clock.getDelta();
  if (still){
    rotation_angle = MAX_ANGLE;
  }
  else{
    animation_time += delta_animation_time; 
    rotation_angle = MAX_ANGLE * (0.5 + 0.5 * Math.sin((2 * Math.PI / T) * animation_time));// make it a function of animation_time
  }
  
  let rotation = rotationMatrixZ(rotation_angle);
  // ...
  // Define other matrices
  
  // Apply transformations
  for (let i = 0; i < cubes.length; i++) {
    if (i == 0) {
      //cubes[i].matrix.copy(model_transformation_animated);
      model_transformation_animated.identity();
      model_transformation_animated.multiplyMatrices(scale, model_transformation_animated);
    }
    cubes[i].matrix.copy(model_transformation_animated);
    wireframes[i].matrix.copy(model_transformation_animated);
    model_transformation_animated.multiplyMatrices(translation_bottom_left_to_origin, model_transformation_animated);
    model_transformation_animated.multiplyMatrices(rotation, model_transformation_animated);
    model_transformation_animated.multiplyMatrices(translation_origin_to_top_left, model_transformation_animated);
    
  }

	renderer.render( scene, camera );
  controls.update();

  //   // TODO
  //   // Animate the cube

}
renderer.setAnimationLoop( animate );

// TODO: Add event listener
let still = false;
window.addEventListener('keydown', onKeyPress); // onKeyPress is called each time a key is pressed
// Function to handle keypress
function onKeyPress(event) {
    switch (event.key) {
        case 'w':
          for (let i = 0; i < cubes.length; i++) {
            cubes[i].visible = !cubes[i].visible;
            wireframes[i].visible = !wireframes[i].visible;
          }
          break;
        case 's': // Note we only do this if s is pressed.
            still = !still;
            break;
        default:
            console.log(`Key ${event.key} pressed`);
    }
}