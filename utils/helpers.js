import { camera } from "./init";
import * as THREE from "three";

export function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// converts 2d screen coordinates to Three.js world coordinates
export function normalize(x, y) {
  var vector = new THREE.Vector3();
  vector.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
  vector.unproject(camera);
  var dir = vector.sub(camera.position).normalize();
  var distance = -camera.position.z / dir.z;
  var position = camera.position.clone().add(dir.multiplyScalar(distance));
  return position;
}
