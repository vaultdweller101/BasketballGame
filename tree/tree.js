
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Function to load a GLTF model
function treeLoad(scene, renderer) {
    // Create a GLTF loader
    const loader = new GLTFLoader();

    // Define a clipping plane to cut the court in half
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);  // Adjust normal and constant as needed

     // Enable local clipping in the renderer
     renderer.localClippingEnabled = true;

    // Load the model
    loader.load(
        '/tree/scene.gltf',
        function (gltf) {
            const originalTree = gltf.scene;
            originalTree.traverse((child) => {
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
            originalTree.position.set(-25, -0.5, -25);
            originalTree.scale.set(0.03, 0.03, 0.03);
            scene.add(originalTree);
    
            // Manually clone the tree without a loop
            // const treeClone1 = originalTree.clone(true);
            // treeClone1.position.set(-25, -0.5, 25);
            // treeClone1.scale.set(0.03, 0.03, 0.03);
            // scene.add(treeClone1);
    
            const treeClone2 = originalTree.clone(true);
            treeClone2.position.set(25, -0.5, -25);
            treeClone2.scale.set(0.03, 0.03, 0.03);
            scene.add(treeClone2);
           
            // const treeClone3 = originalTree.clone(true);
            // treeClone3.position.set(25, -0.5, 25);
            // treeClone3.scale.set(0.03, 0.03, 0.03);
            // scene.add(treeClone3);
    
            // You can continue cloning as many times as you need
            console.log('Tree and clones loaded successfully!');
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error occurred while loading the tree:', error);
        }
    );

}

export default treeLoad;
