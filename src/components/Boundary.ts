import { Bodies, World } from "matter-js";
import { world } from "~utils/usePhysics";

export class Boundary {
  private body: Matter.Body;

  constructor(x: number, y: number, w: number, h: number) {
    this.body = Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      friction: 0.9,
      frictionStatic: 5,
      restitution: 1,
      render: {
        fillStyle: "#121212",
      },
    });
  }

  addToWorld() {
    World.add(world, this.body);
  }
}
