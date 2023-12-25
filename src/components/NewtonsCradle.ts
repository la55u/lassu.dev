import { Bodies, Composite, Constraint, World } from "matter-js";
import { world } from "~utils/usePhysics";

export class NewtonsCradle {
  private body: Matter.Composite;

  constructor(x: number, y: number, ballCnt: number, ballSize: number, length: number) {
    const newtonsCradle = Composite.create({ label: "Newtons Cradle" });

    for (let i = 0; i < ballCnt; i++) {
      const separation = 1.9;
      const circle = Bodies.circle(
        x + i * (ballSize * separation),
        y + length,
        ballSize,
        {
          inertia: Infinity,
          restitution: 1,
          friction: 0,
          frictionAir: 0,
          frictionStatic: 0,
          slop: 0,
          density: 100,
        }
      );
      const constraint = Constraint.create({
        pointA: { x: x + i * (ballSize * separation), y: y },
        bodyB: circle,
        damping: 0,
        stiffness: 1,
      });

      Composite.add(newtonsCradle, circle);
      Composite.add(newtonsCradle, constraint);
    }

    this.body = newtonsCradle;
  }

  addToWorld() {
    World.add(world, this.body);
  }
}
