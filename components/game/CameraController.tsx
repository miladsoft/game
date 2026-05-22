"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { MathUtils, Quaternion, Vector3 } from "three";
import { CAMERA } from "@/lib/game/constants";
import { useGameStore } from "@/stores/game-store";

const carPosition = new Vector3();
const ballPosition = new Vector3();
const forward = new Vector3();
const ballDirection = new Vector3();
const cameraDirection = new Vector3();
const desiredPosition = new Vector3();
const desiredLookAt = new Vector3();
const angleOffset = new Vector3();
const rotationQuaternion = new Quaternion();

function smoothing(speed: number, delta: number) {
  return 1 - Math.exp(-speed * delta);
}

type CameraControllerProps = {
  ballRef: RefObject<RapierRigidBody | null>;
  carRef: RefObject<RapierRigidBody | null>;
};

export default function CameraController({ ballRef, carRef }: CameraControllerProps) {
  const { camera } = useThree();
  const lookTargetRef = useRef(new Vector3(0, 1, 0));
  const modeBlendRef = useRef(1);

  useFrame((_, delta) => {
    const car = carRef.current;

    if (!car) {
      return;
    }

    const carTranslation = car.translation();
    carPosition.set(carTranslation.x, carTranslation.y, carTranslation.z);

    const carRotation = car.rotation();
    rotationQuaternion.set(carRotation.x, carRotation.y, carRotation.z, carRotation.w);
    forward.set(0, 0, -1).applyQuaternion(rotationQuaternion);
    forward.y = 0;
    if (forward.lengthSq() < 0.0001) {
      forward.set(0, 0, -1);
    } else {
      forward.normalize();
    }

    const ball = ballRef.current;
    const ballCam = useGameStore.getState().ballCam;
    const targetModeBlend = ball && ballCam ? 1 : 0;
    modeBlendRef.current = MathUtils.damp(
      modeBlendRef.current,
      targetModeBlend,
      CAMERA.transitionSpeed * 6,
      delta,
    );

    if (ball) {
      const ballTranslation = ball.translation();
      ballPosition.set(ballTranslation.x, ballTranslation.y, ballTranslation.z);
      ballDirection.copy(ballPosition).sub(carPosition);
      ballDirection.y = 0;

      if (ballDirection.lengthSq() < 0.0001) {
        ballDirection.copy(forward);
      } else {
        ballDirection.normalize();
      }
    } else {
      ballPosition.copy(carPosition).addScaledVector(forward, CAMERA.carCamLookAhead);
      ballDirection.copy(forward);
    }

    cameraDirection.copy(forward).lerp(ballDirection, modeBlendRef.current);

    if (cameraDirection.lengthSq() < 0.0001) {
      cameraDirection.copy(forward);
    } else {
      cameraDirection.normalize();
    }

    angleOffset
      .copy(cameraDirection)
      .multiplyScalar(Math.tan(MathUtils.degToRad(Math.abs(CAMERA.angleDegrees))) * CAMERA.distance);

    desiredPosition
      .copy(carPosition)
      .addScaledVector(cameraDirection, -CAMERA.distance)
      .add({ x: 0, y: CAMERA.height, z: 0 })
      .add(angleOffset);

    desiredLookAt
      .copy(carPosition)
      .addScaledVector(forward, CAMERA.carCamLookAhead * (1 - modeBlendRef.current))
      .lerp(ballPosition, CAMERA.ballCamLookBlend * modeBlendRef.current);
    desiredLookAt.y += 1.05;

    const positionSpeed = MathUtils.lerp(4.5, 18, CAMERA.stiffness);
    const lookSpeed = ballCam ? CAMERA.swivelSpeed * 3.5 : 12;

    camera.position.lerp(desiredPosition, smoothing(positionSpeed, delta));
    lookTargetRef.current.lerp(desiredLookAt, smoothing(lookSpeed, delta));
    camera.lookAt(lookTargetRef.current);
  });

  return null;
}
