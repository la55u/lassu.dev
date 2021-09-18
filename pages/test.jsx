import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import * as Matter from "matter-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { init } from "../utils/init";

let sensor = null;

function Box(props) {
  // This reference will give us direct access to the THREE.Mesh object
  const ref = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    try {
      sensor = new AbsoluteOrientationSensor({ frequency: 60 });
      sensor.addEventListener("error", (event) => {
        // Handle runtime errors.
        if (event.error.name === "NotAllowedError") {
          // Need to request permissions
          Promise.all([
            navigator.permissions.query({ name: "accelerometer" }),
            navigator.permissions.query({ name: "magnetometer" }),
            navigator.permissions.query({ name: "gyroscope" }),
          ]).then((results) => {
            if (results.every((result) => result.state === "granted")) {
              console.log("Permission granted.");
              //alert("Permission granted.");
            } else {
              //console.log("No permissions to use AbsoluteOrientationSensor.");
              alert("No permissions to use AbsoluteOrientationSensor.");
            }
          });
        } else if (event.error.name === "NotReadableError") {
          //console.log("Cannot connect to the sensor.");
          alert("Cannot connect to the sensor.");
        }
      });
      sensor.addEventListener("reading", handleSensor);
      sensor.start();
    } catch (error) {
      // Handle construction errors.
      if (error.name === "SecurityError") {
        //console.log("Sensor construction was blocked by a feature policy.");
        alert("Sensor construction was blocked by a feature policy.");
      } else if (error.name === "ReferenceError") {
        //console.log("Sensor is not supported by the User Agent.");
        alert("Sensor is not supported by the User Agent.");
      } else {
        throw error;
      }
    }
  }, []);

  function handleSensor(e) {
    const { quaternion } = e.target;
    ref.current.quaternion.fromArray(quaternion).invert();
  }

  return (
    <mesh
      {...props}
      ref={ref}
      scale={2}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={"seagreen"} />
    </mesh>
  );
}

export default function Demo() {
  useEffect(() => {
    init();
  }, []);

  return <canvas className="webgl">{/* <Box position={[0, 0, 0]} /> */}</canvas>;
}
