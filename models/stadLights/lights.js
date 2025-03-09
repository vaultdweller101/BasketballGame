
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to load a GLTF model
function stLightLoad(scene, renderer) {
    // Create a GLTF loader
    const loader = new GLTFLoader();

    // Define a clipping plane to cut the court in half
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);  // Adjust normal and constant as needed

     // Enable local clipping in the renderer
     renderer.localClippingEnabled = true;

    // Load the model
    loader.load(
        '/models/stadLights/scene.gltf',
        function (gltf) {
            const originalLight = gltf.scene;
            originalLight.traverse((child) => {
                if (child.isMesh) {
                    child.material.clippingPlanes = [clippingPlane];
                    child.receiveShadow = true;
                    child.castShadow = true;
                    if (child.material) {
                        if (child.material.type === 'MeshBasicMaterial') {
                            const oldMaterial = child.material;
                            child.material = new THREE.MeshStandardMaterial({
                                map: oldMaterial.map,
                                color: oldMaterial.color,
                                roughness: 0.8,
                                metalness: 0.1
                            });
                        }
                        child.material.clipShadows = true;
                    }
                }
            });
    
            // Position and add the original tree
            originalLight.position.set(-12, -1, -15);
            originalLight.scale.set(0.0025, 0.0025, 0.0025);
            originalLight.rotateY(-Math.PI/2);
            //scene.add(originalLight);
    
            const LightClone3 = originalLight.clone(true);
            LightClone3.position.set(-12, -1, -15);
            LightClone3.scale.set(0.0025, 0.0025, 0.0025);
            LightClone3.rotateY(Math.PI/6);
            scene.add(LightClone3);
    
            const LightClone2 = originalLight.clone(true);
            LightClone2.position.set(12, -1, -15);
            LightClone2.scale.set(0.0025, 0.0025, 0.0025);
            LightClone2.rotateY(-Math.PI/6);
            scene.add(LightClone2);
           
    
            // You can continue cloning as many times as you need
            console.log('Lights and clones loaded successfully!');
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error occurred while loading the light:', error);
        }
    );

}

export default stLightLoad;
