import { Bodies, Common, World } from "matter-js";
import { world } from "src/utils/usePhysics";
import { colorPresets } from "src/utils/constants";

export class RoundedPoly {
  private body: Matter.Body;

  constructor(x: number, y: number, sides: number, size: number, radius: number) {
    const polyBase = Bodies.polygon(x, y, sides, size, {
      friction: 0.2,
      restitution: 0.6,
      render: {
        fillStyle: Common.choose(colorPresets),
      },
      chamfer: {
        radius: size / 4,
        qualityMin: 3,
      },
      density: 1,
      slop: 0.1,
      angle: Math.random() * Math.PI,

      // angularVelocity: 2,
      // velocity: {
      //   x: Common.random(-10, 10),
      //   y: Common.random(-10, 10),
      // },
    });

    this.body = polyBase;
  }

  public addToWorld() {
    World.add(world, this.body);
  }
}
