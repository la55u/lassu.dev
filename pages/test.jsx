import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

let sensor = null;

function Box(props) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // useFrame()

  useEffect(() => {
    try {
      sensor = new AbsoluteOrientationSensor({ frequency: 60 });
      sensor.addEventListener("error", (event) => {
        // Handle runtime errors.
        if (event.error.name === "NotAllowedError") {
          // Branch to code for requesting permission.
          Promise.all([
            navigator.permissions.query({ name: "accelerometer" }),
            navigator.permissions.query({ name: "magnetometer" }),
            navigator.permissions.query({ name: "gyroscope" }),
          ]).then((results) => {
            if (results.every((result) => result.state === "granted")) {
              console.log("Permission granted.");
            } else {
              console.log("No permissions to use AbsoluteOrientationSensor.");
            }
          });
        } else if (event.error.name === "NotReadableError") {
          console.log("Cannot connect to the sensor.");
        }
      });
      sensor.addEventListener("reading", handleSensor);
      sensor.start();
    } catch (error) {
      // Handle construction errors.
      if (error.name === "SecurityError") {
        // See the note above about feature policy.
        console.log("Sensor construction was blocked by a feature policy.");
      } else if (error.name === "ReferenceError") {
        console.log("Sensor is not supported by the User Agent.");
      } else {
        throw error;
      }
    }
  }, []);

  function handleSensor(e) {
    const { quaternion } = e.target;
    ref.current.quaternion.fromArray(quaternion).invert();
  }

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={active ? 2 : 1.5}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "tomato"} />
    </mesh>
  );
}

export default function Demo() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Box position={[0, 0, 0]} />
        </Canvas>
      </main>
    </div>
  );
}
