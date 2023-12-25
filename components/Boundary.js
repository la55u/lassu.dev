import { Bodies, Composite, World } from "matter-js";
import { scene, world } from "../utils/usePhysics";
import { normalize } from "../utils/helpers";

const options = {
  isStatic: true,
  friction: 0,
  restitution: 1,
  render: {
    fillStyle: "#121212",
  },
};

export class Boundary {
  constructor(x, y, w, h) {
    // physics
    this.body = Bodies.rectangle(x, y, w, h, options);
    World.add(world, this.body);

    console.log("new boundary:", this.body);
  }
}
