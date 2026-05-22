import { BALL, CAR } from "./constants";

export const CAR_PHYSICS = {
  colliders: "cuboid",
  mass: 3.2,
  linearDamping: 0.55,
  angularDamping: 1.65,
  restitution: 0.12,
  friction: 1.35,
} as const;

export const BALL_PHYSICS = {
  mass: 1.1,
  linearDamping: 0.12,
  angularDamping: 0.18,
  restitution: 0.82,
  friction: 0.45,
} as const;

export const CAR_RESET = {
  translation: { x: CAR.spawn[0], y: CAR.spawn[1], z: CAR.spawn[2] },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
  velocity: { x: 0, y: 0, z: 0 },
};

export const BALL_RESET = {
  translation: { x: BALL.spawn[0], y: BALL.spawn[1], z: BALL.spawn[2] },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
  velocity: { x: 0, y: 0, z: 0 },
};
