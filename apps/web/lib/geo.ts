import * as THREE from "three";
/** Matches three.js SphereGeometry UV layout with an equirectangular texture. */
export function latLngToVec3(lat: number, lng: number, r = 1, out = new THREE.Vector3()) {
  const phi = ((lng + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) * Math.PI) / 180;
  return out.set(-r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi));
}
export function vec3ToLatLng(v: THREE.Vector3) {
  const n = v.clone().normalize();
  const lat = 90 - (Math.acos(n.y) * 180) / Math.PI;
  let phi = Math.atan2(n.z, -n.x);
  if (phi < 0) phi += Math.PI * 2;
  const lng = (phi / (Math.PI * 2)) * 360 - 180;
  return { lat, lng };
}
