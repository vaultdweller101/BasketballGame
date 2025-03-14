import loadBleacher from '../models/bleachers/bleachers.js';
import * as THREE from 'three';

function createBleacher(scene, renderer) {
    // prison bleacher load
    loadBleacher((bleacher) => {
        // Set base positions
        bleacher.position.y = 0;
        let zPos = bleacher.position.z = 16;
        
        const bleacherArray = [];
        const numberOfbleachers = 7;
        const offsetX = 5;
        const startingX = -15;
    
        // Duplicate fence segments with shadow settings
        for (let i = 0; i < numberOfbleachers; i++) {
        const bleacherClone = bleacher.clone();
        bleacherClone.position.set(startingX + i * offsetX, bleacher.position.y, zPos);
        
        bleacherClone.traverse((child) => {
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
        
        scene.add(bleacherClone);
        bleacherArray.push(bleacherClone);
        }

        // Create a half fence with clipping and shadow settings
        // const halfbleacher = bleacher.clone();
        // halfbleacher.traverse((child) => {
        //   if (child.isMesh) {
        //     child.material = child.material.clone();
        //     // Set shadow properties for the half fence
        //     child.castShadow = true;
        //     child.receiveShadow = true;
            
        //     // Assign the clipping plane (adjust the normal and constant as needed)
        //     const clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 18.478);
        //     child.material.clippingPlanes = [clippingPlane];
        //     child.material.clipShadows = true;
            
        //     // Optionally, convert material if it's MeshBasicMaterial
        //     if (child.material.type === 'MeshBasicMaterial') {
        //       const oldMaterial = child.material;
        //       child.material = new THREE.MeshStandardMaterial({
        //         map: oldMaterial.map,
        //         color: oldMaterial.color,
        //         roughness: 0.8,
        //         metalness: 0.1
        //       });
        //     }
        //   }
        // });
        
        // halfbleacher.position.x += 60;
        // scene.add(halfbleacher);
    });
    
    // And don't forget to enable local clipping on the renderer
    renderer.localClippingEnabled = true;

}

export default createBleacher;