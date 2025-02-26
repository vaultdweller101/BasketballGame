uniform float uTime;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;

    // Wind effect using sine waves
    float windStrength = 0.2;
    float windSpeed = 2.0;
    float wave = sin(pos.x * 2.0 + uTime * windSpeed) * 0.1;
    wave += cos(pos.z * 2.0 + uTime * windSpeed * 1.2) * 0.1;

    pos.y += wave * windStrength;
    pos.x += wave * 0.05;
    pos.z += wave * 0.05;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
