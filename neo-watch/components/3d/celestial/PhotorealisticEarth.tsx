"use client";

/**
 * Photorealistic Earth
 * Multi-layered Earth with day/night shader, clouds, and atmosphere
 * Gracefully falls back when textures aren't available
 */

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, Html, Ring } from "@react-three/drei";
import * as THREE from "three";
import { useQuality } from "../systems/QualityManager";
import {
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from "../SceneElements";

// ─── Day/Night Shader ────────────────────────────────────────────────────────

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform vec3 uSunDirection;
  uniform float uHasNightMap;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 normal = normalize(vNormal);
    float sunDot = dot(normal, normalize(uSunDirection));

    vec3 dayColor = texture2D(uDayMap, vUv).rgb;

    // Smooth day/night transition at the terminator
    float blend = smoothstep(-0.15, 0.25, sunDot);

    vec3 color;
    if (uHasNightMap > 0.5) {
      vec3 nightColor = texture2D(uNightMap, vUv).rgb;
      color = mix(nightColor * 1.8, dayColor, blend);
    } else {
      // Fallback: darken the day texture for night side
      vec3 nightFallback = dayColor * 0.05 + vec3(0.002, 0.004, 0.01);
      color = mix(nightFallback, dayColor, blend);
    }

    // Subtle specular on the lit side (simulates ocean reflections)
    float spec = pow(max(sunDot, 0.0), 16.0) * 0.15 * blend;
    color += vec3(spec);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── Cloud Layer Shader ──────────────────────────────────────────────────────

const cloudFragmentShader = /* glsl */ `
  uniform sampler2D uCloudMap;
  uniform vec3 uSunDirection;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    float sunDot = dot(normal, normalize(uSunDirection));
    float light = smoothstep(-0.1, 0.3, sunDot);

    vec4 clouds = texture2D(uCloudMap, vUv);
    float alpha = clouds.a * 0.75; // semi-transparent clouds

    vec3 cloudColor = clouds.rgb * light;
    // Slight blue tint on shadow side
    cloudColor = mix(cloudColor * vec3(0.3, 0.35, 0.5), cloudColor, light);

    gl_FragColor = vec4(cloudColor, alpha);
  }
`;

const cloudVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

interface PhotorealisticEarthProps {
  /** Position in the scene */
  position?: [number, number, number];
  /** Radius of the earth sphere */
  size?: number;
  /** Sun position for lighting calculations */
  sunPosition?: [number, number, number];
  /** Orbit radius (0 = stationary) */
  orbitRadius?: number;
  /** Orbit speed */
  orbitSpeed?: number;
  /** Self-rotation speed */
  rotationSpeed?: number;
  /** Show label above Earth */
  showLabel?: boolean;
}

export function PhotorealisticEarth({
  position = [0, 0, 0],
  size = 0.5,
  sunPosition = [0, 0, 0],
  orbitRadius = 10,
  orbitSpeed = 0.1,
  rotationSpeed = 0.005,
  showLabel = true,
}: PhotorealisticEarthProps) {
  const groupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const earthMatRef = useRef<THREE.ShaderMaterial>(null);
  const cloudMatRef = useRef<THREE.ShaderMaterial>(null);

  const { settings } = useQuality();

  // Try to load textures, fallback gracefully
  let dayTexture: THREE.Texture | null = null;
  let nightTexture: THREE.Texture | null = null;
  let cloudTexture: THREE.Texture | null = null;

  try {
    dayTexture = useTexture("/textures/earth_texture.png");
  } catch {
    // Will use fallback color
  }

  // Sun direction uniform (normalized)
  const sunDir = useMemo(() => {
    return new THREE.Vector3(...sunPosition).normalize();
  }, [sunPosition]);

  // Earth surface uniforms
  const earthUniforms = useMemo(
    () => ({
      uDayMap: { value: dayTexture ?? new THREE.Texture() },
      uNightMap: { value: nightTexture ?? new THREE.Texture() },
      uSunDirection: { value: sunDir },
      uHasNightMap: { value: nightTexture ? 1.0 : 0.0 },
    }),
    [dayTexture, nightTexture, sunDir]
  );

  // Atmosphere uniforms
  const atmosphereUniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color("#4da6ff") },
      intensity: { value: 0.9 },
    }),
    []
  );

  // Cloud uniforms
  const cloudUniforms = useMemo(
    () => ({
      uCloudMap: { value: cloudTexture ?? new THREE.Texture() },
      uSunDirection: { value: sunDir },
    }),
    [cloudTexture, sunDir]
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Orbit around the sun
    if (groupRef.current && orbitRadius > 0) {
      const t = time * orbitSpeed;
      groupRef.current.position.x = Math.sin(t) * orbitRadius;
      groupRef.current.position.z = Math.cos(t) * orbitRadius;
    }

    // Self-rotation
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed;
    }

    // Cloud rotation (slightly faster for parallax)
    if (cloudRef.current) {
      cloudRef.current.rotation.y += rotationSpeed * 1.15;
    }

    // Update sun direction based on actual sun position relative to earth
    if (earthMatRef.current && groupRef.current) {
      const earthWorldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(earthWorldPos);
      const dir = new THREE.Vector3(...sunPosition)
        .sub(earthWorldPos)
        .normalize();
      earthMatRef.current.uniforms.uSunDirection.value.copy(dir);
      if (cloudMatRef.current) {
        cloudMatRef.current.uniforms.uSunDirection.value.copy(dir);
      }
    }
  });

  const hasDayTexture = dayTexture != null;

  return (
    <group ref={groupRef} position={position}>
      {/* Layer 1: Earth Surface */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[size, 64, 64]} />
        {hasDayTexture ? (
          <shaderMaterial
            ref={earthMatRef}
            vertexShader={earthVertexShader}
            fragmentShader={earthFragmentShader}
            uniforms={earthUniforms}
          />
        ) : (
          <meshStandardMaterial
            color="#1e40af"
            roughness={0.7}
            metalness={0.1}
          />
        )}
      </mesh>

      {/* Layer 2: Clouds (if enabled and texture available) */}
      {settings.enableClouds && cloudTexture && (
        <mesh ref={cloudRef} scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[size, 48, 48]} />
          <shaderMaterial
            ref={cloudMatRef}
            vertexShader={cloudVertexShader}
            fragmentShader={cloudFragmentShader}
            uniforms={cloudUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Layer 3: Inner Atmosphere (Fresnel rim glow) */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[size, 32, 32]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={atmosphereUniforms}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
        />
      </mesh>

      {/* Layer 4: Outer Atmosphere (wider glow) */}
      <mesh scale={[1.25, 1.25, 1.25]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Layer 5: Locator ring — thin orbit-style ring makes Earth easy to spot */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.6, size * 1.65, 64]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Persistent Earth Label */}
      {showLabel && (
        <Html
          position={[0, size + 0.55, 0]}
          center
          distanceFactor={20}
          zIndexRange={[50, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex flex-col items-center gap-0.5 select-none">
            <span className="text-[10px] font-bold font-mono tracking-widest text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)] uppercase">
              🌍 Earth
            </span>
            <span className="w-6 h-px bg-blue-400/50" />
          </div>
        </Html>
      )}
    </group>
  );
}

export default PhotorealisticEarth;
