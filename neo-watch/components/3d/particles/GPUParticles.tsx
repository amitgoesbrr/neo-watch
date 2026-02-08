"use client";

/**
 * GPU Particle System
 * Renders thousands of particles with zero CPU per-frame cost
 * All animation happens in the vertex shader
 */

import { useMemo, useRef  } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQuality } from "../systems/QualityManager";

// ─── Vertex Shader ───────────────────────────────────────────────────────────

const particleVertexShader = /* glsl */ `
  attribute float aLifetime;
  attribute float aSeed;
  attribute vec3 aVelocity;
  attribute float aSize;

  uniform float uTime;
  uniform float uBaseSize;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    float age = mod(uTime * 0.3 + aSeed * 100.0, aLifetime);
    float progress = age / aLifetime;

    // Animate position along velocity
    vec3 pos = position + aVelocity * age;
    
    // Subtle oscillation for organic feel
    pos.x += sin(age * 2.0 + aSeed * 6.28) * 0.3;
    pos.y += cos(age * 1.5 + aSeed * 3.14) * 0.2;

    // Fade in and out
    vAlpha = smoothstep(0.0, 0.1, progress) * (1.0 - smoothstep(0.7, 1.0, progress));
    vAlpha *= 0.4 + aSeed * 0.3; // Vary brightness

    vSeed = aSeed;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    
    // Perspective-scaled point size
    gl_PointSize = (uBaseSize * aSize) * (200.0 / -mvPos.z);
    gl_PointSize = max(gl_PointSize, 0.5); // minimum visible size
    
    gl_Position = projectionMatrix * mvPos;
  }
`;

// ─── Fragment Shader ─────────────────────────────────────────────────────────

const particleFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vSeed;
  
  uniform vec3 uColor;

  void main() {
    // Soft circle shape
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // Color temperature variation based on seed
    vec3 color = mix(uColor, uColor * vec3(1.2, 1.0, 0.8), vSeed);
    
    gl_FragColor = vec4(color, alpha * vAlpha);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

interface GPUParticlesProps {
  /** Bounding box radius for particle spawning */
  spread?: number;
  /** Base color of particles */
  color?: string;
  /** Base size multiplier */
  baseSize?: number;
  /** Override particle count (otherwise uses quality settings) */
  count?: number;
}

export function GPUParticles({
  spread = 80,
  color = "#aaaacc",
  baseSize = 2.0,
  count,
}: GPUParticlesProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { settings } = useQuality();

  const particleCount = count ?? Math.min(settings.maxParticles, 15000);

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const seeds = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random position in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * spread;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // Lifetime: 5–20 seconds
      lifetimes[i] = 5 + Math.random() * 15;

      // Unique seed
      seeds[i] = Math.random();

      // Very slow drift velocity
      velocities[i3] = (Math.random() - 0.5) * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;

      // Size variation
      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aLifetime", new THREE.BufferAttribute(lifetimes, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const unis = {
      uTime: { value: 0 },
      uBaseSize: { value: baseSize },
      uColor: { value: new THREE.Color(color) },
    };

    return { geometry: geo, uniforms: unis };
  }, [particleCount, spread, baseSize, color]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Cosmic Dust — ambient floating particles for depth
 * Lighter wrapper around GPUParticles with tuned defaults
 */
export function CosmicDust() {
  const { settings } = useQuality();
  const count = Math.min(settings.maxParticles, 8000);

  return (
    <GPUParticles
      spread={100}
      color="#8888bb"
      baseSize={1.5}
      count={count}
    />
  );
}

export default GPUParticles;
