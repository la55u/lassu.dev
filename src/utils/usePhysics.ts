import { Engine, Mouse, MouseConstraint, Render, Runner, World } from "matter-js";
import { useEffect, useRef } from "react";
import { Boundary } from "~components/Boundary";
import { Circle } from "~components/Circle";
import { NewtonsCradle } from "~components/NewtonsCradle";
import { RoundedPoly } from "~components/RoundedPoly";
import { getRandomInt } from "~utils/helpers";

export var engine: Matter.Engine, world: Matter.World, renderer: Matter.Render;

export function usePhysics() {
  const isDone = useRef(false);

  useEffect(() => {
    if (!isDone.current) init();
    isDone.current = true;
  }, []);

  const init = () => {
    engine = Engine.create();
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

    // const newtonsCradle = new NewtonsCradle(200, 100, 5, 30, 200);
    // newtonsCradle.addToWorld();

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

    World.add(world, [mouseConstraint]);

    renderer = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        wireframes: false,
        // wireframeBackground: true,
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
      const obj =
        Math.random() > 0.5
          ? new Circle(e.clientX, e.clientY, getRandomInt(30, 120))
          : new RoundedPoly(
              e.clientX,
              e.clientY,
              getRandomInt(3, 6),
              getRandomInt(30, 150),
              10
            );

      obj.addToWorld();
    }

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("click", onWindowClick);
  };
}
