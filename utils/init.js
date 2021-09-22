import {
  Bodies,
  Body,
  Common,
  Composites,
  Constraint,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";
import { Boundary } from "../components/Boundary";
import { Circle } from "../components/Circle";
import { copySign, getRandom, radToDeg, toEuler } from "./helpers";

export var engine, world, renderer;
export var objects = [];

let sensor;

function initSensor() {
  try {
    sensor = new RelativeOrientationSensor({ frequency: 60, referenceFrame: "screen" });
    sensor.addEventListener("error", (event) => {
      // Handle runtime errors.
      if (event.error.name === "NotAllowedError") {
        // Need to request permissions
        Promise.all([
          navigator.permissions.query({ name: "accelerometer" }),
          //navigator.permissions.query({ name: "magnetometer" }),
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
    sensor.addEventListener("reading", (event) => {
      const { quaternion } = event.target;
      const [yaw, roll, pitch] = toEuler(quaternion);
      console.log(yaw, roll, pitch);
      const Gx = (-1 * Common.clamp(yaw, -Math.PI / 2, Math.PI / 2)) / (Math.PI / 2);
      const Gy = roll * 1.2; // random scale
      const stat = `Yaw (Z): ${radToDeg(yaw).toFixed(2)}<br>
                      Roll (X, β): ${radToDeg(roll).toFixed(2)}<br>
                      Pitch (Y): ${radToDeg(pitch).toFixed(2)}<br>
                      Gx: ${Gx.toFixed(2)}<br>
                      Gy: ${Gy.toFixed(2)}`;

      document.getElementById("stat").innerHTML = stat;
      const gravity = engine.gravity;
      gravity.x = Gx;
      gravity.y = Gy;
    });
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
}

// set during calibration
var initialPos = null;

function setupPhysics() {
  engine = Engine.create();
  world = engine.world;
  objects.push(new Circle(400, 0, 40));
  const wallThickness = 50;
  const ground = new Boundary(
    window.innerWidth / 2,
    window.innerHeight + wallThickness / 2,
    window.innerWidth,
    wallThickness
  );
  const leftWall = new Boundary(
    0 - wallThickness / 2,
    window.innerHeight / 2,
    wallThickness,
    window.innerHeight
  );
  const rightWall = new Boundary(
    window.innerWidth + wallThickness / 2,
    window.innerHeight / 2,
    wallThickness,
    window.innerHeight
  );

  // add bridge
  var group = Body.nextGroup(true);
  var bridge = Composites.stack(160, 290, 15, 1, 0, 0, function (x, y) {
    return Bodies.rectangle(x - 20, y, 53, 20, {
      collisionFilter: { group: group },
      chamfer: 5,
      density: 0.005,
      frictionAir: 0.05,
      render: {
        fillStyle: "#060a19",
      },
    });
  });
  Composites.chain(bridge, 0.3, 0, -0.3, 0, {
    stiffness: 1,
    length: 0,
    render: {
      visible: true,
    },
  });
  const p1 = Constraint.create({
    pointA: { x: 140, y: 300 },
    bodyB: bridge.bodies[0],
    pointB: { x: -25, y: 0 },
    length: 2,
    stiffness: 0.9,
  });
  const p2 = Constraint.create({
    pointA: { x: 660, y: 300 },
    bodyB: bridge.bodies[bridge.bodies.length - 1],
    pointB: { x: 25, y: 0 },
    length: 2,
    stiffness: 0.9,
  });

  objects.push(ground, leftWall, rightWall, bridge, p1, p2);

  const canvas = document.querySelector("canvas.webgl");

  // add mouse control
  var mouse = Mouse.create(canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

  World.add(world, [...objects, mouseConstraint]);

  // sensor API
  //useSensor(handleSensor);
  // function handleSensor(event) {
  //   const { quaternion } = event.target;
  //   const [yaw, roll, pitch] = toEuler(quaternion);
  //   console.log(yaw, roll, pitch);

  //   if (!initialPos) initialPos = [yaw, roll];

  //   const Gx = (-1 * Common.clamp(yaw, -Math.PI / 2, Math.PI / 2)) / (Math.PI / 2);
  //   const Gy = Common.clamp(pitch, -Math.PI / 2, Math.PI / 2) / (Math.PI / 2);
  //   const stat = `Yaw (Z): ${radToDeg(yaw).toFixed(2)}<br>
  //                 Roll (X): ${radToDeg(roll).toFixed(2)}<br>
  //                 Pitch (Y): ${radToDeg(pitch).toFixed(2)}<br>
  //                 Gx:   ${Gx.toFixed(2)}<br>
  //                 Gy:   ${Gy.toFixed(2)}`;
  //   document.getElementById("stat").innerHTML = stat;

  //   const gravity = engine.gravity;
  //   gravity.x = Gx;
  //   //gravity.y = Common.clamp(roll, -Math.PI / 2, Math.PI / 2) / (Math.PI / 2);
  //   gravity.y = Gy;
  // }

  // add gyro control
  var updateGravity = function (event) {
    if (!window.orientation) return null;
    const orientation = window.orientation,
      gravity = engine.gravity;
    console.log("orientation event:", event);

    if (orientation === 0) {
      gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
      gravity.y = Common.clamp(event.beta, -90, 90) / 90;
    } else if (orientation === 180) {
      gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
      gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
    } else if (orientation === 90) {
      gravity.x = Common.clamp(event.beta, -90, 90) / 90;
      gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
    } else if (orientation === -90) {
      gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
      gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
    }
  };

  if (window.DeviceOrientationEvent) {
    //window.addEventListener("deviceorientation", updateGravity);
  } else {
    alert("DeviceOrientationEvent not available");
  }

  renderer = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      wireframes: false,
      //wireframeBackground: false,
      height: window.innerHeight,
      width: window.innerWidth,
      showAngleIndicator: true,
      showAxes: true,
      //showBounds: true,
      showDebug: true,
    },
  });

  Render.run(renderer);
  Runner.run(engine);

  // window.addEventListener("resize", () => {
  //   renderer.canvas.width = window.innerWidth;
  //   renderer.canvas.height = window.innerHeight;
  // });

  document.addEventListener("mousedown", (e) => {
    objects.push(new Circle(e.clientX, e.clientY, getRandom(10, 35)));
  });
}

export function init() {
  initSensor();
  setupPhysics();
}
