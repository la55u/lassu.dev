import { Bodies, Common, Composite, World } from "matter-js";
import { world } from "../utils/usePhysics";
import { colorPresets } from "~utils/constants";

export class Circle {
  private body: Matter.Body;

  constructor(x: number, y: number, r: number) {
    this.body = Bodies.circle(x, y, r, {
      friction: 0.1,
      restitution: 0.7,
      render: {
        fillStyle: Common.choose(colorPresets),
      },
    });

    World.add(world, this.body);
  }

  public addToWorld() {
    World.add(world, this.body);
  }
}
