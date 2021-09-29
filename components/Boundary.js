import { Bodies, Composite, World } from "matter-js";
import { scene, world } from "../utils/init";
import { normalize } from "../utils/helpers";

const options = {
  isStatic: true,
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

  draw() {
    const worldCoord = normalize(this.body.position.x, this.body.position.y);
    this.mesh.position.set(0, 0.5, 0);
  }
}
