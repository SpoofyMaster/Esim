export const earthVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const earthFragment = /* glsl */ `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform sampler2D waterMap;
uniform sampler2D idMap;
uniform sampler2D coverageMap;
uniform vec3 sunDir;
uniform float hoverId;
uniform float selectedId;
uniform float selectPulse;
uniform float coverageStrength;
uniform float time;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vPosW;

const vec3 BLUE = vec3(0.0, 0.341, 1.0);
const vec3 CYAN = vec3(0.224, 0.776, 1.0);
const vec3 NAVY = vec3(0.008, 0.043, 0.122);

void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(cameraPosition - vPosW);
  vec3 l = normalize(sunDir);
  float ndl = dot(n, l);

  vec3 day = texture2D(dayMap, vUv).rgb;
  vec3 night = texture2D(nightMap, vUv).rgb;
  float water = texture2D(waterMap, vUv).r;

  // Brand-graded oceans: deeper, bluer water without altering land geography.
  day = mix(day, day * vec3(0.55, 0.72, 1.05) + NAVY * 0.35, water * 0.55);

  float dayMix = smoothstep(-0.18, 0.22, ndl);
  vec3 lit = day * (0.06 + 1.05 * max(ndl, 0.0));
  vec3 lights = pow(night, vec3(1.6)) * vec3(1.0, 0.78, 0.52) * 2.4 * (1.0 - water);
  vec3 col = mix(lights + day * 0.015, lit, dayMix);

  // Ocean specular glint.
  vec3 h = normalize(l + v);
  float spec = pow(max(dot(n, h), 0.0), 140.0) * water * dayMix;
  col += vec3(0.55, 0.75, 1.0) * spec * 0.35;

  // Country shading from the id-map.
  float id = floor(texture2D(idMap, vUv).r * 255.0 + 0.5);
  float covered = id > 0.5 ? texture2D(coverageMap, vec2((id + 0.5) / 256.0, 0.5)).r : 0.0;
  float isHover = id > 0.5 && abs(id - hoverId) < 0.5 ? 1.0 : 0.0;
  float isSel = id > 0.5 && abs(id - selectedId) < 0.5 ? 1.0 : 0.0;
  float lum = 0.35 + 0.65 * dayMix;
  col = mix(col, col * 0.85 + BLUE * 0.22 * lum + CYAN * 0.06, clamp(covered * coverageStrength, 0.0, 1.0));
  col = mix(col, col * 0.6 + BLUE * 0.55 * lum + CYAN * 0.12, isHover * 0.55);
  col = mix(col, col * 0.45 + BLUE * 0.75 * lum + CYAN * (0.22 + 0.12 * selectPulse), isSel * 0.8);

  // Inner atmospheric rim.
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float rimLight = smoothstep(-0.35, 0.6, ndl);
  col += mix(BLUE, CYAN, 0.45) * fres * (0.25 + 0.9 * rimLight);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export const atmosphereVertex = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const atmosphereFragment = /* glsl */ `
uniform vec3 sunDir;
uniform float limb; // |dot(n,v)| on the halo shell where it meets the planet limb
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(cameraPosition - vPosW);
  float d = clamp(-dot(n, v) / limb, 0.0, 1.0); // 1 at the planet limb, 0 at the halo edge
  float glow = pow(d, 3.2);
  float lit = smoothstep(-0.55, 0.65, dot(n, normalize(sunDir)));
  vec3 c = mix(vec3(0.0, 0.22, 0.8), vec3(0.35, 0.82, 1.0), lit);
  float a = glow * (0.25 + 0.95 * lit);
  gl_FragColor = vec4(c * a * 1.3, a);
}`;

export const cloudFragment = /* glsl */ `
uniform sampler2D cloudMap;
uniform vec3 sunDir;
uniform float opacity;
varying vec2 vUv;
varying vec3 vNormalW;
void main() {
  float c = texture2D(cloudMap, vUv).r;
  float ndl = dot(normalize(vNormalW), normalize(sunDir));
  float lit = smoothstep(-0.2, 0.35, ndl);
  vec3 col = mix(vec3(0.02, 0.05, 0.12), vec3(0.95, 0.97, 1.0), lit);
  gl_FragColor = vec4(col, c * opacity * (0.25 + 0.75 * lit));
}`;

export const arcVertex = /* glsl */ `
attribute float t;
varying float vT;
void main() {
  vT = t;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const arcFragment = /* glsl */ `
uniform float time;
uniform float offset;
uniform float speed;
varying float vT;
void main() {
  float head = fract(time * speed + offset);
  float d = head - vT;
  float tail = smoothstep(0.35, 0.0, d) * step(0.0, d);
  float base = 0.10;
  float a = base + tail * 0.9;
  vec3 c = mix(vec3(0.0, 0.34, 1.0), vec3(0.6, 0.9, 1.0), tail);
  gl_FragColor = vec4(c * a, a);
}`;
