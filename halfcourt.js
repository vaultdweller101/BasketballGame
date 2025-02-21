import * as THREE from 'three';


export function createHalfCourtFloor(texturePath) {
    // Load the texture
    const loader = new THREE.TextureLoader();
    const courtTexture = loader.load(texturePath);


    // Improve texture quality
    courtTexture.wrapS = THREE.RepeatWrapping;
    courtTexture.wrapT = THREE.RepeatWrapping;
    courtTexture.anisotropy = 16;


    // Create material with texture
    const floorMaterial = new THREE.MeshStandardMaterial({ map: courtTexture });


    // Create geometry for the floor
    const floorGeometry = new THREE.PlaneGeometry(15.24, 14.330);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);


    // Rotate to lie flat
    floor.rotation.x = -Math.PI / 2;


    return floor; // Return the mesh so it can be added to the scene
}
