import { Bodies, Composite, World } from "matter-js";
import { scene, world } from "../utils/init";
import * as THREE from "three";
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

    // three
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0x808080 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);

    console.log("new boundary:", this.body);
  }

  draw() {
    const worldCoord = normalize(this.body.position.x, this.body.position.y);
    this.mesh.position.set(0, 0.5, 0);
  }
}
