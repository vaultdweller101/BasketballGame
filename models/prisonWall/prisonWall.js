import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { call } from 'three/tsl';

// Function to load a GLTF model
function loadWall(callback) {
    // Create a GLTF loader
    const loader = new GLTFLoader();

    // Load the model
    loader.load(
        // URL to the GLB or GLTF file
        '/models/prisonWall/scene.gltf',

        // Called when the model is successfully loaded
        function (gltf) {
            const wall = gltf.scene;
            // fence.position.set(0, -.9, 6.9);
            wall.scale.set(1.55, 1.55, 1.55);

            callback(wall);
        },

        // Called while loading is in progress
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // Called if loading fails
        function (error) {
            console.error('An error occurred while loading the wall:', error);
        }
    );
}

export default loadWall;