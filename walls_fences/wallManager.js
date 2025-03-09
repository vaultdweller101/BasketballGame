import loadWall from '../models/prisonWall/prisonWall.js';
import * as THREE from 'three';

function createWall(scene, renderer) {
    // prison wall load
    loadWall((wall) => {
        // Set base positions
        wall.position.y = -.1;
        let zPos = wall.position.z = 30;
        
        const wallArray = [];
        const numberOfWalls = 3;
        const offsetX = 19.5;
        const startingX = -20.5;
    
        // Duplicate fence segments with shadow settings
        for (let i = 0; i < numberOfWalls; i++) {
        const wallClone = wall.clone();
        wallClone.position.set(startingX + i * offsetX, wall.position.y, zPos);
        
        wallClone.traverse((child) => {
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
        
        scene.add(wallClone);
        wallArray.push(wallClone);
        }

        let zPos2 = wall.position.z = -30;
        
        // Duplicate wall segments with shadow settings
        for (let i = 0; i < numberOfWalls; i++) {
            const wallClone = wall.clone();
            wallClone.position.set(startingX + i * offsetX, wall.position.y, zPos2);
            
            wallClone.traverse((child) => {
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
            
            scene.add(wallClone);
            wallArray.push(wallClone);
        }

        let xPos = wall.position.x = 29.8;
        
        const wallArray2 = [];
        // const numberOfWalls2 = 4;
        const offsetZ = 20;
        const startingZ = -18.8;

        for (let i = 0; i < numberOfWalls; i++) {
            const wallClone = wall.clone();
            wallClone.position.set(xPos, wall.position.y, startingZ + i * offsetZ);
            wallClone.rotation.y = Math.PI / 2;
            wallClone.traverse((child) => {
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
            
            scene.add(wallClone);
            wallArray2.push(wallClone);
        }

        let xPos2 = wall.position.x = -29.8;

        for (let i = 0; i < numberOfWalls; i++) {
            const wallClone = wall.clone();
            wallClone.position.set(xPos2, wall.position.y, startingZ + i * offsetZ);
            wallClone.rotation.y = Math.PI / 2;
            wallClone.traverse((child) => {
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
            
            scene.add(wallClone);
            wallArray2.push(wallClone);
        }

        // Create a half fence with clipping and shadow settings
        // const halfWall = wall.clone();
        // halfWall.traverse((child) => {
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
        
        // halfWall.position.x += 60;
        // scene.add(halfWall);
    });
    
    // And don't forget to enable local clipping on the renderer
    renderer.localClippingEnabled = true;

}

export default createWall;