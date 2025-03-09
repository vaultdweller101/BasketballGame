import loadFence from '../models/fence/fence.js';
import * as THREE from 'three';

function createFence(scene, renderer) {
    loadFence((fence) => {
        // Set base positions
        fence.position.y = -0.9;
        fence.position.z = 6.9;
        
        const fenceArray = [];
        const numberOfFences = 4;
        const offsetX = 8.2;
        const startingX = -15.38;
      
        // Duplicate fence segments with shadow settings
        for (let i = 0; i < numberOfFences; i++) {
          const fenceClone = fence.clone();
          fenceClone.position.set(startingX + i * offsetX, fence.position.y, fence.position.z);
          
          fenceClone.traverse((child) => {
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
          
          scene.add(fenceClone);
          fenceArray.push(fenceClone);
        }
        
        // Create a half fence with clipping and shadow settings
        const halfFence = fence.clone();
        halfFence.traverse((child) => {
          if (child.isMesh) {
            child.material = child.material.clone();
            // Set shadow properties for the half fence
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Assign the clipping plane (adjust the normal and constant as needed)
            const clippingPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 18.478);
            child.material.clippingPlanes = [clippingPlane];
            child.material.clipShadows = true;
            
            // Optionally, convert material if it's MeshBasicMaterial
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
        
        halfFence.position.x += 17.42;
        scene.add(halfFence);
      });
      
    // And don't forget to enable local clipping on the renderer
    renderer.localClippingEnabled = true;
}

export default createFence;