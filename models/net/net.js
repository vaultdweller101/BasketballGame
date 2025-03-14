// import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to load a GLTF model
function loadNet(scene, renderer) {
    // Create a GLTF loader
    const loader = new GLTFLoader();

    // Load the model
    loader.load(
        // URL to the GLB or GLTF file
        '/models/net/scene.gltf',

        // Called when the model is successfully loaded
        function (gltf) {
            const net = gltf.scene;
            net.position.set(0, 1.7, -6.04);
            net.scale.set(.35, .35, .35);      
            
            net.traverse((child) => {
                if (child.isMesh) {
                    // Clone material to avoid affecting shared instances
                    child.material = child.material.clone();
                    // Set shadow properties
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Optionally, convert MeshBasicMaterial to MeshStandardMaterial
                    if (child.material.type === 'MeshBasicMaterial') {
                        const oldMaterial = child.material;
                        child.material = new THREE.MeshStandardMaterial({
                        map: oldMaterial.map,
                        color: oldMaterial.color,
                        roughness: 0.8,
                        metalness: 0.1
                        });
                    }
                }
            });

            // Add the model to the scene
            scene.add(net);
            console.log('Net loaded successfully!');
        },

        // Called while loading is in progress
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // Called if loading fails
        function (error) {
            console.error('An error occurred while loading the net:', error);
        }
    );
}

export default loadNet;
