import {
  Bodies,
  Body,
  Common,
  Engine,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from "matter-js";
import { useEffect, useRef } from "react";
import { Boundary } from "~components/Boundary";
import { Circle } from "~components/Circle";
import { RoundedPoly } from "~components/RoundedPoly";
import { getRandomInt } from "~utils/helpers";
import { colorPresets } from "./constants";
import { Cross } from "~components/Cross";

export var engine: Matter.Engine, world: Matter.World, renderer: Matter.Render;

export function usePhysics() {
  const isDone = useRef(false);

  useEffect(() => {
    if (!isDone.current) init();
    isDone.current = true;
  }, []);

  const init = () => {
    engine = Engine.create({
      enableSleeping: true,
      positionIterations: 10,
      constraintIterations: 10,
    });
    world = engine.world;
    const WALL_THICHNESS = 50;
    const ground = new Boundary(
      window.innerWidth / 2,
      window.innerHeight + WALL_THICHNESS / 2,
      window.innerWidth,
      WALL_THICHNESS
    );

    const leftWall = new Boundary(
      0 - WALL_THICHNESS / 2,
      window.innerHeight / 2,
      WALL_THICHNESS,
      window.innerHeight
    );
    const rightWall = new Boundary(
      window.innerWidth + WALL_THICHNESS / 2,
      window.innerHeight / 2,
      WALL_THICHNESS,
      window.innerHeight
    );

    ground.addToWorld();
    leftWall.addToWorld();
    rightWall.addToWorld();

    const canvas = document.querySelector("canvas");

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

    const HEXAGON_SIZE = Math.max(150, canvas.clientWidth / 7);
    const hexagon = Bodies.polygon(
      canvas.clientWidth - HEXAGON_SIZE,
      HEXAGON_SIZE,
      6,
      HEXAGON_SIZE,
      {
        isStatic: true,
        friction: 0.2,
        restitution: 0.1,
        render: {
          fillStyle: colorPresets[0],
        },
        chamfer: {
          radius: HEXAGON_SIZE / 4,
          qualityMin: 5,
        },
        inertia: Infinity,

        density: 1,
        slop: 0.1,
      }
    );

    const TRIANGLE_SIZE = Math.max(110, canvas.clientWidth / 9);
    const triangle = Bodies.polygon(
      TRIANGLE_SIZE,
      canvas.clientHeight - TRIANGLE_SIZE,
      3,
      TRIANGLE_SIZE,
      {
        isStatic: true,
        friction: 0.2,
        restitution: 0.1,
        render: {
          fillStyle: colorPresets[3],
        },
        chamfer: {
          radius: TRIANGLE_SIZE / 4,
          quality: 12,
        },
        inertia: Infinity,
        angle: 0.8,
      }
    );

    // rotate objects continuously
    function updateRotation() {
      Body.rotate(hexagon, 0.005);
      Body.rotate(triangle, -0.0015);
      requestAnimationFrame(updateRotation);
    }
    window.requestAnimationFrame(updateRotation);

    World.add(world, [hexagon, triangle, mouseConstraint]);

    renderer = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        wireframes: false,
        showSleeping: process.env.NODE_ENV === "development",
        height: canvas.clientHeight,
        width: canvas.clientWidth,
        showAngleIndicator: false,
        showAxes: false,
        showBounds: false,
        showDebug: process.env.NODE_ENV === "development",
        background: "#111111",
      },
    });

    Render.run(renderer);
    Runner.run(engine);

    function onWindowResize() {
      console.log("Resizing canvas (W,H):", canvas.clientWidth, canvas.clientHeight);
      renderer.canvas.width = canvas.clientWidth;
      renderer.canvas.height = canvas.clientHeight;
    }

    function onWindowClick(e: MouseEvent) {
      const shape = Common.choose(["circle", "poly", "cross"]);

      switch (shape) {
        case "circle": {
          const obj = new Circle(e.clientX, e.clientY, getRandomInt(20, 100));
          obj.addToWorld();
          break;
        }
        case "poly": {
          const obj = new RoundedPoly(
            e.clientX,
            e.clientY,
            getRandomInt(3, 6),
            getRandomInt(20, 110),
            10
          );
          obj.addToWorld();
          break;
        }
        case "cross": {
          const size = getRandomInt(20, 100);
          const obj = new Cross(e.clientX, e.clientY, size);
          obj.addToWorld();
          break;
        }
        default:
          console.warn("Shape creation not implemented for:", shape);
      }
    }

    window.addEventListener("resize", onWindowResize);
    canvas.addEventListener("click", onWindowClick);
  };
}
