export const ARENA = {
  // Rocket League standard dimensions, scaled from Unreal Units at 100 uu = 1 world unit.
  width: 81.92,
  length: 102.4,
  backNetLength: 120,
  ceilingHeight: 20.44,
  wallHeight: 20.44,
  wallThickness: 1,
  cornerCut: 11.52,
  goalWidth: 17.8551,
  goalHeight: 6.42775,
} as const;

export const CAR = {
  spawn: [0, 1.2, 32] as const,
  halfExtents: [1.1, 0.38, 1.75] as const,
  acceleration: 26,
  reverseAcceleration: 15,
  maxForwardSpeed: 34,
  maxReverseSpeed: 11,
  steerSpeed: 2.9,
  lateralGrip: 52,
  coastDrag: 9,
  steerTorque: 0.22,
  airSteerTorque: 0.08,
  jumpImpulse: 7.8,
  boostImpulse: 1.65,
  maxBoost: 100,
  boostDrainPerSecond: 34,
  boostRecoverPerSecond: 11,
  resetHeight: -8,
} as const;

export const BALL = {
  spawn: [0, 2.5, 0] as const,
  radius: 1.35,
  resetHeight: -10,
} as const;

export const CAMERA = {
  fov: 76,
  distance: 10.8,
  height: 4.0,
  angleDegrees: -4,
  stiffness: 0.45,
  swivelSpeed: 5.2,
  transitionSpeed: 1.25,
  carCamLookAhead: 8.5,
  ballCamLookBlend: 0.88,
} as const;

export const MATCH = {
  durationSeconds: 180,
} as const;
