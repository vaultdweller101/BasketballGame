import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function loadGrass(scene, renderer) {
    const loader = new GLTFLoader();

    // Enable local clipping
    renderer.localClippingEnabled = true;

    // Define a clipping plane to cut the grass in half
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 10000);

    // Define positions for multiple grass patches
    const positions = [
        { x: -15, y: 0, z: 30 },
        { x: 25, y: 0, z: -25 },
        { x: -25, y: 0, z: 25 },
        { x: -25, y: 0, z: -25 },
        { x: -25, y: 0, z: 25 },
        { x: -20, y: 0, z: 20 }
    ];

    positions.forEach((position) => {
        loader.load(
            '/models/grass/scene.gltf',
            function (gltf) {
                const grass = gltf.scene;
                grass.position.set(position.x, position.y, position.z);

                // Apply clipping and shadow properties
                grass.traverse((child) => {
                    if (child.isMesh) {
                        child.material.clippingPlanes = [clippingPlane];
                        child.receiveShadow = true;
                        child.castShadow = true;

                        // Ensure it's using MeshStandardMaterial for better lighting
                        if (child.material && child.material.type === 'MeshBasicMaterial') {
                            const oldMaterial = child.material;
                            child.material = new THREE.MeshStandardMaterial({
                                map: oldMaterial.map,
                                color: oldMaterial.color,
                                roughness: 0.8,
                                metalness: 0.1
                            });
                        }

                        // Enable shadow clipping
                        child.material.clipShadows = true;
                    }
                });

                scene.add(grass);
                console.log(`Grass loaded at position (${position.x}, ${position.y}, ${position.z})`);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('Error loading grass:', error);
            }
        );
    });
}

export default loadGrass;
