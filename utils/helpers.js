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

// converts quaternions to Euler degrees
// we are tracking in two dimensions so pitch is omitted
export function toEuler(q) {
  let sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
  let cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
  let roll = Math.atan2(sinr_cosp, cosr_cosp);

  let siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
  let cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
  let yaw = Math.atan2(siny_cosp, cosy_cosp);

  return [yaw, roll];
}
