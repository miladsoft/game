export type ControlKey =
  | "accelerate"
  | "brake"
  | "left"
  | "right"
  | "jump"
  | "boost"
  | "reset"
  | "ballCam";

export type ControlState = Record<ControlKey, boolean>;

export type GamepadInput = {
  connected: boolean;
  id: string;
  throttle: number;
  steer: number;
  jump: boolean;
  boost: boolean;
  reset: boolean;
};

export type Score = {
  blue: number;
  orange: number;
};
