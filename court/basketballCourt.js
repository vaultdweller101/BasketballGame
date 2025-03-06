// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// const loadCourt = async () => {
//     const loaders = new GLTFLoader();

//     return new Promise((resolve, reject) => {
//         loaders.load(
//             '/court/scene.gltf',
//             function(gltf) {
//                 const model1 = gltf.scene;
//                 model1.position.set(0, 0, 0);
//                 // model1.scale.set(3, 3, 3);

//                 resolve(model1);
//             },
//             undefined,
//             function(error) {
//                 console.error('An error occurred while loading model', error);
//                 reject(error);
//             }
//         );
//     });
// }

// export default loadCourt;

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to load a GLTF model
function loadBasketballCourt(scene, renderer) {
    // Create a GLTF loader
    const loader = new GLTFLoader();

    // Define a clipping plane to cut the court in half
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 9);  // Adjust normal and constant as needed

     // Enable local clipping in the renderer
     renderer.localClippingEnabled = true;

    // Load the model
    loader.load(
        // URL to the GLB or GLTF file
        '/court/scene.gltf',

        // Called when the model is successfully loaded
        function (gltf) {
            const court = gltf.scene;
            court.position.set(0, 0, 9);   
            court.scale.set(1.1, 1.1, 1.1);      
            // court.rotation.y = Math.PI / 2;

            // Apply clipping plane to the court material
            court.traverse((child) => {
                if (child.isMesh) {
                    child.material.clippingPlanes = [clippingPlane];
                    // Add these two lines:
                    child.receiveShadow = true;
                    child.castShadow = true; // Optional, if parts of the court should cast shadows on other parts
                    
                    // Make sure the material can receive shadows
                    if (child.material) {
                        // If the material is MeshBasicMaterial, replace it
                        if (child.material.type === 'MeshBasicMaterial') {
                            const oldMaterial = child.material;
                            child.material = new THREE.MeshStandardMaterial({
                                map: oldMaterial.map,
                                color: oldMaterial.color,
                                roughness: 0.8,
                                metalness: 0.1
                            });
                        }
                        
                        // Enable shadow clipping if you're using clippingPlanes
                        child.material.clipShadows = true;
                    }
                }
            });

            // Add the model to the scene
            scene.add(court);
            console.log('Basketball court loaded successfully!');
        },

        // Called while loading is in progress
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // Called if loading fails
        function (error) {
            console.error('An error occurred while loading the basketball court:', error);
        }
    );
}

export default loadBasketballCourt;
