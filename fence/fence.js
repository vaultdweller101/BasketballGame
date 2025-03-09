import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to load a GLTF model
function loadFence(scene) {
    // Create a GLTF loader
    const loader = new GLTFLoader();

    // Load the model
    loader.load(
        // URL to the GLB or GLTF file
        '/fence/scene.gltf',

        // Called when the model is successfully loaded
        function (gltf) {
            const fence = gltf.scene;
            fence.position.set(0, -.9, 6.9);
            fence.scale.set(1, 1, 1);

            // Add the model to the scene
            scene.add(fence);
            console.log('Fence loaded successfully!');
        },

        // Called while loading is in progress
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // Called if loading fails
        function (error) {
            console.error('An error occurred while loading the fence:', error);
        }
    );
}

export default loadFence;