"use client";

/**
 * Volumetric Sun
 * Multi-layered sun with animated corona, god rays support, and HDR emission
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQuality } from "../systems/QualityManager";

// ─── Corona Shader ───────────────────────────────────────────────────────────

const coronaVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coronaFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uGlowColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simplex hash
  vec3 hash33(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return fract(sin(p) * 43758.5453123);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = mix(
      mix(
        mix(dot(hash33(i), f), dot(hash33(i + vec3(1,0,0)), f - vec3(1,0,0)), f.x),
        mix(dot(hash33(i + vec3(0,1,0)), f - vec3(0,1,0)), dot(hash33(i + vec3(1,1,0)), f - vec3(1,1,0)), f.x),
        f.y
      ),
      mix(
        mix(dot(hash33(i + vec3(0,0,1)), f - vec3(0,0,1)), dot(hash33(i + vec3(1,0,1)), f - vec3(1,0,1)), f.x),
        mix(dot(hash33(i + vec3(0,1,1)), f - vec3(0,1,1)), dot(hash33(i + vec3(1,1,1)), f - vec3(1,1,1)), f.x),
        f.y
      ),
      f.z
    );
    return n * 0.5 + 0.5;
  }

  float fbm(vec3 p) {
    float f = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      f += amp * noise3D(p);
      p *= 2.05;
      amp *= 0.45;
    }
    return f;
  }

  void main() {
    float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float intensity = pow(rim, 1.8);

    // Animated noise for corona turbulence
    vec3 noisePos = vPosition * 3.0 + uTime * 0.3;
    float turb = fbm(noisePos) * 0.4;
    
    // Pulsing
    float pulse = sin(uTime * 1.5) * 0.08 + 0.92;

    // HDR color (values > 1.0 for bloom pickup)
    float power = (intensity + turb) * pulse * uIntensity;
    vec3 color = uGlowColor * power;
    
    // Core is brighter (white-hot)
    color = mix(color, vec3(power * 1.5), smoothstep(0.5, 0.0, rim) * 0.3);
    
    float alpha = intensity * 0.85;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Surface Granulation Shader ──────────────────────────────────────────────

const sunSurfaceVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunSurfaceFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;

  vec3 hash33(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return fract(sin(p) * 43758.5453123);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = mix(
      mix(
        mix(dot(hash33(i), f), dot(hash33(i + vec3(1,0,0)), f - vec3(1,0,0)), f.x),
        mix(dot(hash33(i + vec3(0,1,0)), f - vec3(0,1,0)), dot(hash33(i + vec3(1,1,0)), f - vec3(1,1,0)), f.x),
        f.y
      ),
      mix(
        mix(dot(hash33(i + vec3(0,0,1)), f - vec3(0,0,1)), dot(hash33(i + vec3(1,0,1)), f - vec3(1,0,1)), f.x),
        mix(dot(hash33(i + vec3(0,1,1)), f - vec3(0,1,1)), dot(hash33(i + vec3(1,1,1)), f - vec3(1,1,1)), f.x),
        f.y
      ),
      f.z
    );
    return n * 0.5 + 0.5;
  }

  void main() {
    // Animated surface granulation
    vec3 p = vPosition * 5.0;
    float n1 = noise3D(p + uTime * 0.2);
    float n2 = noise3D(p * 2.0 - uTime * 0.15);
    float pattern = n1 * 0.6 + n2 * 0.4;

    // Hot color palette: deep orange → yellow → white
    vec3 coolColor = vec3(0.9, 0.4, 0.1);  // deep orange
    vec3 warmColor = vec3(1.0, 0.8, 0.3);  // yellow
    vec3 hotColor  = vec3(1.5, 1.3, 0.9);  // HDR white-yellow (> 1.0 for bloom)

    vec3 color = mix(coolColor, warmColor, pattern);
    color = mix(color, hotColor, smoothstep(0.6, 0.9, pattern));

    // Emissive intensity > 1.0 ensures bloom catches it
    gl_FragColor = vec4(color * 1.3, 1.0);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

interface VolumetricSunProps {
  /** Size of the sun sphere */
  size?: number;
  /** Light intensity */
  intensity?: number;
  /** Position of the sun */
  position?: [number, number, number];
  /** Ref callback for the sun mesh (needed for god rays) */
  sunMeshRef?: React.RefObject<THREE.Mesh | null>;
  /** Optional existing texture (will use procedural if not provided) */
  texture?: THREE.Texture;
}

export function VolumetricSun({
  size = 2,
  intensity = 4,
  position = [0, 0, 0],
  sunMeshRef,
  texture,
}: VolumetricSunProps) {
  const internalRef = useRef<THREE.Mesh>(null);
  const coronaMatRef = useRef<THREE.ShaderMaterial>(null);
  const surfaceMatRef = useRef<THREE.ShaderMaterial>(null);

  const meshRef = sunMeshRef ?? internalRef;

  const coronaUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGlowColor: { value: new THREE.Color("#ffaa44") },
      uIntensity: { value: 1.2 },
    }),
    []
  );

  const surfaceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coronaMatRef.current) {
      coronaMatRef.current.uniforms.uTime.value = t;
    }
    if (surfaceMatRef.current) {
      surfaceMatRef.current.uniforms.uTime.value = t;
    }
  });

  return (
    <group position={position}>
      {/* Core Sun Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 64, 64]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture}
            emissiveIntensity={intensity}
            emissive="#fbbf24"
            color="#ffffff"
          />
        ) : (
          <shaderMaterial
            ref={surfaceMatRef}
            vertexShader={sunSurfaceVertexShader}
            fragmentShader={sunSurfaceFragmentShader}
            uniforms={surfaceUniforms}
          />
        )}
      </mesh>

      {/* Inner Corona */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[size, 32, 32]} />
        <shaderMaterial
          ref={coronaMatRef}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={coronaUniforms}
          vertexShader={coronaVertexShader}
          fragmentShader={coronaFragmentShader}
        />
      </mesh>

      {/* Outer Glow (billboard-like soft glow) */}
      <mesh scale={[1.6, 1.6, 1.6]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Wide ambient glow */}
      <mesh scale={[2.5, 2.5, 2.5]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Point Light */}
      <pointLight
        intensity={intensity * 1.5}
        distance={120}
        decay={2}
        color="#fbbf24"
      />
    </group>
  );
}

export default VolumetricSun;
