import {
  Engine,
  Bodies,
  Composite,
  Render,
  Runner,
  World,
  Mouse,
  MouseConstraint,
  Common,
} from "matter-js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Boundary } from "../components/Boundary";
import { Circle } from "../components/Circle";
import { getRandom } from "./helpers";

const MIN_CIRCLE_SIZE = 30;
const MAX_CIRCLE_SIZE = 120;

// physics
export var engine, world;
export var objects = [];

// THREE
export const scene = new THREE.Scene();
export var camera;
var canvas;

// use matter-js renderer if true
const DEBUG = true;

function addEventListener() {
  document.addEventListener("mousedown", (e) => {
    objects.push(new Circle(e.clientX, e.clientY, getRandom(10, 35)));
  });
}

function setupPhysics() {
  engine = Engine.create();
  world = engine.world;
  objects.push(new Circle(400, 0, 40));
  const ground = new Boundary(
    window.innerWidth / 2,
    window.innerHeight,
    window.innerWidth,
    50
  );
  objects.push(ground);

  World.add(world, [...objects]);

  canvas = document.querySelector("canvas.webgl");

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
  World.add(world, mouseConstraint);

  // add gyro control

  var updateGravity = function (event) {
    var orientation = typeof window.orientation !== "undefined" ? window.orientation : 0,
      gravity = engine.gravity;
    //alert("orientation:", orientation);

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
    window.addEventListener("deviceorientation", updateGravity);
  } else {
    alert("DeviceOrientationEvent not available");
  }

  if (DEBUG) {
    // demo renderer
    var render = Render.create({
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
    Render.run(render);
  }
  Runner.run(engine);

  addEventListener();
}

function setupTHREE() {
  // Lights
  const pointLight = new THREE.PointLight(0xffffff, 0.6);
  pointLight.position.x = 2;
  pointLight.position.y = 3;
  pointLight.position.z = 4;
  pointLight.castShadow = true;
  scene.add(pointLight);

  const light = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(light);

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Base camera
  camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 2;
  scene.add(camera);

  // Controls
  // const controls = new OrbitControls(camera, canvas)
  // controls.enableDamping = true

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /**
   * Animate
   */
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    //mesh.rotation.y = 0.5 * elapsedTime;
    //mesh.position.set(body.position.x, body.position.y / 1000, 1);
    //console.log(body.position);

    objects.forEach((obj) => {
      obj.draw();
    });

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
}

export function init() {
  setupPhysics();
  if (!DEBUG) {
    setupTHREE();
  }
}
