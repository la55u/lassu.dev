import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";

function Box(props) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // useFrame()

  useEffect(() => {
    const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
    Promise.all([
      navigator.permissions.query({ name: "accelerometer" }),
      navigator.permissions.query({ name: "magnetometer" }),
      navigator.permissions.query({ name: "gyroscope" }),
    ]).then((results) => {
      if (results.every((result) => result.state === "granted")) {
        sensor.addEventListener("reading", handleSensor);
        sensor.start();
      } else {
        console.log("No permissions to use AbsoluteOrientationSensor.");
      }
    });
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
      scale={active ? 1.5 : 1}
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
