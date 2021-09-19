import { Canvas } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import * as Matter from "matter-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { init } from "../utils/init";

export const useSensor = (callback) => {
  let sensor = null;
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
    sensor.addEventListener("reading", callback);
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
};

export default function Demo() {
  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div id="stat" />
      <canvas className="webgl" />
    </>
  );
}
