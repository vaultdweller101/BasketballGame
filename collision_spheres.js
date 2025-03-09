import * as THREE from 'three';

export function create_spheres(num, center_og, size = 0.02, radius_og = 0.3, data_structure){
    let center = center_og.clone();
    let alpha = 0;
    let d_alpha = 2 * Math.PI / num;
    // sin(alpha) + cos(alpha)
    for (let i = 0; i < num; i ++){
        alpha += d_alpha;
        center.x = center_og.x + radius_og * Math.sin(alpha);
        center.z = center_og.z + radius_og * Math.cos(alpha);
        let sphereBB = new THREE.Sphere(center.clone(), size);
        data_structure.push(sphereBB);

        // // Create a visual representation of the sphere
        // let geometry = new THREE.SphereGeometry(size, 16, 16);
        // let material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        // let sphereMesh = new THREE.Mesh(geometry, material);

        // // Set position of the sphere
        // sphereMesh.position.copy(center);
        
        // // Add to the scene
        // scene.add(sphereMesh);
    }
    console.log("Done adding collision spheres for rim");
}

export function check_collision_against_spheres(ballBB, data_structure){
    for (let i = 0; i < data_structure.length; i++){
        if (ballBB.intersectsSphere(data_structure[i])){
            return i;
        }
    }
    return -1;
}