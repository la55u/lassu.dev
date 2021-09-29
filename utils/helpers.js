export function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// converts quaternions to Euler degrees
// we are tracking in two dimensions so pitch is omitted
// export function toEuler(q) {
//   let sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
//   let cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
//   let roll = Math.atan2(sinr_cosp, cosr_cosp);

//   let siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
//   let cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
//   let yaw = Math.atan2(siny_cosp, cosy_cosp);

//   return [yaw, roll];
// }

export function toEuler(q) {
  let yaw, roll, pitch;
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];

  // roll (x-axis rotation)
  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  roll = Math.atan2(sinr_cosp, cosr_cosp);

  // pitch (y-axis rotation)
  const sinp = 2 * (w * y - z * x);
  if (Math.abs(sinp) >= 1) {
    pitch = copySign(Math.PI / 2, sinp); // use 90 degrees if out of range
  } else {
    pitch = Math.asin(sinp);
  }

  // yaw (z-axis rotation)
  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  yaw = Math.atan2(siny_cosp, cosy_cosp);

  return [yaw, roll, pitch];
}

// Returns the absolute value of the first number, but the sign of the second.
export const copySign = (x, y) => (Math.sign(x) === Math.sign(y) ? x : -x);

// converts radians to degrees
export const radToDeg = (rad) => (rad * 180) / Math.PI;
