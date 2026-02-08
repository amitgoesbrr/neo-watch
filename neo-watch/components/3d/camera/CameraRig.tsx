"use client";

/**
 * Camera Rig
 * Managed camera system with cinematic entrance, focus transitions,
 * auto-orbit, and spring-physics movements
 */

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { useQualityStore } from "../systems/QualityStore";

// ─── Camera Store (simple state for camera) ──────────────────────────────────

interface CameraTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
}

// ─── Cinematic Entrance ──────────────────────────────────────────────────────

function CinematicEntrance({
  defaultPosition,
  defaultLookAt,
  duration = 3000,
}: {
  defaultPosition: [number, number, number];
  defaultLookAt: [number, number, number];
  duration?: number;
}) {
  const { camera } = useThree();
  const setCinematicEntrance = useQualityStore((s) => s.setCinematicEntrance);
  const isCinematic = useQualityStore((s) => s.isCinematicEntrance);
  const startTime = useRef(Date.now());
  const startPos = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Start camera far away
      const farPos = new THREE.Vector3(
        defaultPosition[0] * 6,
        defaultPosition[1] * 3,
        defaultPosition[2] * 6
      );
      camera.position.copy(farPos);
      startPos.current.copy(farPos);
      startTime.current = Date.now();
      initialized.current = true;
    }
  }, [camera, defaultPosition]);

  useFrame(() => {
    if (!isCinematic) return;

    const elapsed = Date.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);

    // Exponential ease-out for smooth deceleration
    const eased = 1 - Math.pow(1 - progress, 3);

    const target = new THREE.Vector3(...defaultPosition);
    const current = new THREE.Vector3().lerpVectors(
      startPos.current,
      target,
      eased
    );
    camera.position.copy(current);
    camera.lookAt(...defaultLookAt);

    if (progress >= 1) {
      setCinematicEntrance(false);
    }
  });

  return null;
}

// ─── Auto Orbit (idle camera rotation) ───────────────────────────────────────

function AutoOrbit({ idleTimeout = 10000 }: { idleTimeout?: number }) {
  const lastInteraction = useRef(Date.now());
  const isOrbiting = useRef(false);
  const { camera } = useThree();
  const isCinematic = useQualityStore((s) => s.isCinematicEntrance);

  const resetIdle = useCallback(() => {
    lastInteraction.current = Date.now();
    isOrbiting.current = false;
  }, []);

  useEffect(() => {
    const events = ["pointerdown", "pointermove", "wheel", "keydown"];
    events.forEach((e) => window.addEventListener(e, resetIdle));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
    };
  }, [resetIdle]);

  useFrame((state) => {
    if (isCinematic) return;

    const idle = Date.now() - lastInteraction.current;
    if (idle > idleTimeout) {
      isOrbiting.current = true;
      // Slow orbit around Y axis
      const speed = 0.0003;
      const radius = Math.sqrt(
        camera.position.x ** 2 + camera.position.z ** 2
      );
      const angle =
        Math.atan2(camera.position.z, camera.position.x) + speed;
      camera.position.x = Math.cos(angle) * radius;
      camera.position.z = Math.sin(angle) * radius;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

// ─── Screen Shake ────────────────────────────────────────────────────────────

function ScreenShake({ intensity = 0.02 }: { intensity?: number }) {
  const { camera } = useThree();
  const basePos = useRef(new THREE.Vector3());
  const isCinematic = useQualityStore((s) => s.isCinematicEntrance);
  const prefersReducedMotion = useQualityStore((s) => s.prefersReducedMotion);

  useFrame((state) => {
    if (isCinematic || prefersReducedMotion) return;

    const t = state.clock.elapsedTime;
    // Perlin-like noise offset using sin combination
    const shakeX =
      Math.sin(t * 1.1) * Math.cos(t * 2.3) * intensity;
    const shakeY =
      Math.cos(t * 0.9) * Math.sin(t * 1.7) * intensity * 0.7;

    camera.position.x += shakeX;
    camera.position.y += shakeY;
  });

  return null;
}

// ─── Main Camera Rig ─────────────────────────────────────────────────────────

interface CameraRigProps {
  /** Default camera position */
  defaultPosition?: [number, number, number];
  /** Default look-at target */
  defaultLookAt?: [number, number, number];
  /** Enable cinematic entrance animation */
  enableEntrance?: boolean;
  /** Enable auto-orbit on idle */
  enableAutoOrbit?: boolean;
  /** Enable subtle screen shake */
  enableShake?: boolean;
  /** View mode (2D locks rotation) */
  viewMode?: "2D" | "3D";
  /** Min orbit distance */
  minDistance?: number;
  /** Max orbit distance */
  maxDistance?: number;
  /** Camera field of view */
  fov?: number;
}

export function CameraRig({
  defaultPosition = [0, 25, 35],
  defaultLookAt = [0, 0, 0],
  enableEntrance = true,
  enableAutoOrbit = true,
  enableShake = true,
  viewMode = "3D",
  minDistance = 10,
  maxDistance = 80,
}: CameraRigProps) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  const isCinematic = useQualityStore((s) => s.isCinematicEntrance);
  const prefersReducedMotion = useQualityStore((s) => s.prefersReducedMotion);

  // Handle view mode changes
  useEffect(() => {
    if (isCinematic) return; // Don't interfere with entrance
    if (viewMode === "2D") {
      camera.position.set(0, 60, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(...defaultPosition);
      camera.lookAt(...defaultLookAt);
    }
  }, [viewMode, camera, defaultPosition, defaultLookAt, isCinematic]);

  return (
    <>
      {/* Cinematic entrance */}
      {enableEntrance && !prefersReducedMotion && (
        <CinematicEntrance
          defaultPosition={defaultPosition}
          defaultLookAt={defaultLookAt}
        />
      )}

      {/* Auto orbit */}
      {enableAutoOrbit && !prefersReducedMotion && <AutoOrbit />}

      {/* Screen shake */}
      {enableShake && !prefersReducedMotion && (
        <ScreenShake intensity={0.015} />
      )}

      {/* OrbitControls (disabled during cinematic entrance) */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!isCinematic}
        enableRotate={viewMode === "3D"}
        minDistance={minDistance}
        maxDistance={maxDistance}
        enablePan={true}
        dampingFactor={0.03}
        enableDamping
        rotateSpeed={0.5}
      />
    </>
  );
}

export default CameraRig;
