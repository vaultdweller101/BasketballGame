import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to load and return the hand model
export function loadHands(camera) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        
        loader.load('models/hand/scene.gltf', function (gltf) {
            const hands = gltf.scene;
            hands.scale.set(0.3, 0.3, 0.3); // Adjust size if needed
            hands.position.set(0, -0.5, -0.8); // Position in front of the camera
            hands.visible = false; // Initially hidden
            
            camera.add(hands); // Attach hands to the camera
            
            resolve(hands); // Return the hands object when loaded
        }, undefined, function (error) {
            console.error('Error loading hand model:', error);
            reject(error);
        });
    });
}