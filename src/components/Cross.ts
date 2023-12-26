import { Bodies, Body, Common, Vertices, World } from "matter-js";
import { colorPresets } from "~utils/constants";
import { world } from "~utils/usePhysics";

export class Cross {
  private body: Matter.Body;

  constructor(x: number, y: number, size: number) {
    const radius = size / 10;
    const width = size;
    const height = size / 5;

    const options: Matter.IChamferableBodyDefinition = {
      density: 1,
      angle: Math.random(),
      render: {
        fillStyle: Common.choose(colorPresets),
      },
    };

    const rect1 = Bodies.rectangle(x, y, width, height, options);
    const rect2 = Bodies.rectangle(x, y, height, width, options);

    // simply adding chamfer: {...} to the rectangle options doesn't work for some reason
    // https://github.com/liabru/matter-js/issues/1059
    const rect1RoundedVerts = Vertices.chamfer(rect1.vertices, radius, 10, 5, 100);
    const rect2RoundedVerts = Vertices.chamfer(rect2.vertices, radius, 10, 5, 100);

    Body.setVertices(rect1, rect1RoundedVerts);
    Body.setVertices(rect2, rect2RoundedVerts);

    const compoundBody = Body.create({ parts: [rect1, rect2] });

    this.body = compoundBody;
  }

  addToWorld() {
    World.add(world, this.body);
  }
}
