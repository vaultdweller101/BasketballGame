varying vec2 vUv;

void main() {
    // Grass color gradient
    vec3 topColor = vec3(0.05, 0.4, 0.05);   // Darker green for depth
    vec3 bottomColor = vec3(0.2, 0.8, 0.2);    // Lighter green for realism
    vec3 color = mix(bottomColor, topColor, vUv.y * 1.5);

    gl_FragColor = vec4(color, 1.0);
}
