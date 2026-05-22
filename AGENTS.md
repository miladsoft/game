# AGENTS.md

## Project Overview

This project is a professional 3D web game built with Next.js.  
The target is to create a high-quality browser-based 3D game inspired by Rocket League, with cars, ball physics, arena gameplay, smooth camera, realistic controls, and future multiplayer support.

## Main Goal

Build a production-ready 3D game using:

- Next.js
- React
- TypeScript
- React Three Fiber
- Drei
- Rapier Physics
- Zustand
- Tailwind CSS
- shadcn/ui when needed

The game should feel smooth, modern, responsive, and professional.

---

## Architecture Rules

Use this structure:

```txt
app/
  page.tsx
  layout.tsx

components/
  game/
    GameCanvas.tsx
    Arena.tsx
    Car.tsx
    Ball.tsx
    CameraController.tsx
    Lights.tsx
    PhysicsWorld.tsx
    Controls.tsx
    HUD.tsx

lib/
  game/
    constants.ts
    physics.ts
    controls.ts
    types.ts

stores/
  game-store.ts
```

If folders do not exist, create them.

---

## Core Libraries

Use these packages:

```bash
pnpm add three @react-three/fiber @react-three/drei @react-three/rapier zustand
pnpm add -D @types/three
```

---

## Coding Standards

* Use TypeScript everywhere.
* Use functional React components.
* Keep game logic separated from UI logic.
* Do not put all logic inside one component.
* Use reusable components.
* Use clear names.
* Avoid unnecessary complexity.
* Keep files small and focused.
* Use `useFrame` only where real-time updates are required.
* Use Zustand for shared game state.
* Use constants instead of magic numbers.
* Do not use `any` unless absolutely necessary.

---

## Rendering Rules

* Use `Canvas` from `@react-three/fiber`.
* Use `Suspense` for loading 3D assets.
* Use `@react-three/drei` helpers when useful.
* Use proper lighting:

  * ambient light
  * directional light
  * spot lights if needed
* Add shadows where possible.
* Optimize performance for browser gameplay.
* Avoid heavy models at the beginning.
* Use simple geometry first, then replace with GLB models later.

---

## Physics Rules

Use `@react-three/rapier`.

The game must include:

* Rigid body car
* Rigid body ball
* Arena floor
* Arena walls
* Collision detection
* Ball bounce
* Car movement
* Jump
* Boost
* Reset position when needed

Physics must feel arcade-style, not fully realistic simulation.

---

## Controls

Implement keyboard controls first:

```txt
W / ArrowUp       accelerate
S / ArrowDown     brake / reverse
A / ArrowLeft     steer left
D / ArrowRight    steer right
Space             jump
Shift             boost
R                 reset car
```

Later support:

* gamepad
* mobile joystick
* touch controls

---

## Camera

Create a third-person follow camera.

Camera behavior:

* Follow the car smoothly
* Stay behind the car
* Slightly above the car
* Look toward the car and ball
* Avoid sudden movement
* Use interpolation/lerp for smoothness

---

## Game Feel

The game should feel:

* fast
* smooth
* responsive
* polished
* arcade-style
* fun to control

Prioritize gameplay feel over visual complexity.

---

## UI / HUD

Create a clean HUD with:

* speed
* boost amount
* score
* timer
* reset button
* simple start screen

Use normal React UI outside the 3D canvas when possible.

---

## Styling

Use Tailwind CSS.

Design style:

* dark background
* modern game UI
* glassmorphism panels
* rounded corners
* smooth transitions
* professional visual quality

---

## Performance Rules

* Keep frame rate stable.
* Avoid unnecessary React re-renders inside game loop.
* Use refs for frame-based movement.
* Use Zustand carefully.
* Do not store every frame value in React state.
* Use low-poly placeholder models first.
* Load heavy assets lazily.

---

## Development Plan

### Phase 1 — Basic Prototype

* Create 3D canvas
* Add arena floor
* Add walls
* Add simple car box
* Add ball sphere
* Add physics
* Add keyboard movement
* Add follow camera

### Phase 2 — Gameplay

* Add boost
* Add jump
* Add goal areas
* Add score system
* Add timer
* Add ball reset
* Add car reset

### Phase 3 — Polish

* Improve camera
* Improve car handling
* Add better lighting
* Add shadows
* Add particles for boost
* Add simple sound effects
* Add better UI

### Phase 4 — Multiplayer

* Add Socket.IO or Colyseus
* Add authoritative server logic
* Sync player positions
* Sync ball position
* Add rooms
* Add matchmaking

---

## Important Rules for AI Agents

When modifying this project:

1. Do not rewrite the entire project unless required.
2. Make small, safe, incremental changes.
3. Keep the project runnable after every change.
4. Explain what files were changed.
5. Prefer clean architecture over quick hacks.
6. Do not add unnecessary libraries.
7. Do not break Next.js App Router structure.
8. Do not place browser-only 3D code inside server components.
9. Use `"use client"` for components using Three.js, hooks, browser APIs, or game controls.
10. Always keep TypeScript errors clean.

---

## Next.js Rules

* Use App Router.
* Components using React Three Fiber must be client components.
* `page.tsx` should stay simple.
* Put the main game inside `components/game/GameCanvas.tsx`.
* Avoid server-side rendering for 3D canvas components.
* Use dynamic import if needed to disable SSR.

Example:

```tsx
"use client";

import dynamic from "next/dynamic";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
});

export default function Page() {
  return <GameCanvas />;
}
```

---

## Recommended First Task

Start by creating the basic playable prototype:

* full-screen canvas
* arena floor
* four walls
* controllable car
* physics ball
* smooth follow camera
* basic HUD

The first version does not need multiplayer or advanced models.
Focus on gameplay first.
