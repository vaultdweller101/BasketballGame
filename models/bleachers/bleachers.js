import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to load a GLTF model
function loadBleacher(callback) {
    // Create a GLTF loader
    const loader = new GLTFLoader();

    // Load the model
    loader.load(
        // URL to the GLB or GLTF file
        '/models/bleachers/scene.gltf',

        // Called when the model is successfully loaded
        function (gltf) {
            const bleacher = gltf.scene;
            // fence.position.set(0, -.9, 6.9);
            bleacher.scale.set(25, 25, 25);
            bleacher.rotation.y = Math.PI / 2;

            callback(bleacher);
        },

        // Called while loading is in progress
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // Called if loading fails
        function (error) {
            console.error('An error occurred while loading the bleacher:', error);
        }
    );
}

export default loadBleacher;