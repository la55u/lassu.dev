import { Bodies, Composite, World } from "matter-js";
import { world } from "../utils/init";
import { normalize } from "../utils/helpers";

var options = {
  friction: 0.1,
  restitution: 1,
  render: {
    fillStyle: "#121212",
  },
};

export class Circle {
  constructor(x, y, r) {
    // physics
    this.body = Bodies.circle(x, y, r, options);
    World.add(world, this.body);

    console.log("new cirlce:", this.body);
  }

  draw() {
    const worldCoord = normalize(this.body.position.x, this.body.position.y);
    this.mesh.position.set(worldCoord.x, worldCoord.y, 0);
    this.mesh.rotation.z = -this.body.angle;
  }
}
