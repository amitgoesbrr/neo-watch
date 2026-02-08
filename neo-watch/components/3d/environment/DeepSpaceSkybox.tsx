"use client";

/**
 * Deep Space Skybox
 * Procedural nebula + star field rendered on an inverted sphere
 * Replaces drei/Stars with a GPU-driven background
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQuality } from "../systems/QualityManager";

// ─── Vertex Shader ───────────────────────────────────────────────────────────

const skyboxVertexShader = /* glsl */ `
  varying vec3 vWorldDirection;
  
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldDirection = normalize(worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Fragment Shader ─────────────────────────────────────────────────────────

const skyboxFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform int uOctaves;
  varying vec3 vWorldDirection;

  // ── Simplex-style hash noise ──
  vec3 hash33(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float snoise(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    
    vec3 d1 = d0 - i1 + K2;
    vec3 d2 = d0 - i2 + 2.0 * K2;
    vec3 d3 = d0 - 1.0 + 3.0 * K2;
    
    vec4 h = max(0.6 - vec4(dot(d0,d0), dot(d1,d1), dot(d2,d2), dot(d3,d3)), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    
    return dot(n, vec4(52.0));
  }

  // ── Fractal Brownian Motion ──
  float fbm(vec3 p, int octaves) {
    float f = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      f += amp * snoise(p * freq);
      freq *= 2.03;
      amp *= 0.48;
    }
    return f;
  }

  // ── Star field via cell noise (Voronoi-like) ──
  float starField(vec3 dir, float scale, float threshold) {
    vec3 p = dir * scale;
    vec3 f = fract(p);
    vec3 i = floor(p);
    
    float minDist = 1.0;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        for (int z = -1; z <= 1; z++) {
          vec3 neighbor = vec3(float(x), float(y), float(z));
          vec3 cellCenter = hash33(i + neighbor) * 0.5 + 0.5;
          float dist = length(f - neighbor - cellCenter);
          minDist = min(minDist, dist);
        }
      }
    }
    
    // Sharp points for stars
    float star = 1.0 - smoothstep(0.0, threshold, minDist);
    return star * star;
  }

  void main() {
    vec3 dir = normalize(vWorldDirection);
    
    // ── Layer 1: Background gradient ──
    float verticalGrad = dir.y * 0.5 + 0.5;
    vec3 bgColor = mix(
      vec3(0.01, 0.005, 0.02),   // near-black deep space
      vec3(0.015, 0.01, 0.03),   // very subtle purple tint at top
      verticalGrad
    );
    
    // ── Layer 2: Nebula clouds ──
    vec3 nebulaPos = dir * 2.5 + uTime * 0.0005;
    float nebula1 = fbm(nebulaPos, uOctaves);
    float nebula2 = fbm(nebulaPos * 1.5 + vec3(5.2, 1.3, 2.8), uOctaves);
    
    // Map to color
    float nebulaIntensity1 = smoothstep(0.1, 0.7, nebula1 * 0.5 + 0.5) * 0.08;
    float nebulaIntensity2 = smoothstep(0.2, 0.8, nebula2 * 0.5 + 0.5) * 0.05;
    
    vec3 nebulaColor1 = vec3(0.15, 0.05, 0.35) * nebulaIntensity1; // purple
    vec3 nebulaColor2 = vec3(0.05, 0.15, 0.3)  * nebulaIntensity2; // blue
    
    // ── Layer 3: Milky Way band ──
    // Dense star region along a slightly tilted galactic plane
    float galacticPlane = exp(-pow(dir.y + 0.1, 2.0) * 8.0);
    float milkyNoise = fbm(dir * 8.0, max(uOctaves - 1, 1)) * 0.5 + 0.5;
    float milkyWay = galacticPlane * milkyNoise * 0.06;
    vec3 milkyColor = vec3(0.7, 0.65, 0.8) * milkyWay;
    
    // ── Layer 4: Star fields at different scales ──
    // Bright stars (sparse)
    float brightStars = starField(dir, 80.0, 0.02);
    // Dim stars (dense)
    float dimStars = starField(dir, 200.0, 0.015) * 0.4;
    // Tiny stars in Milky Way band
    float tinyStars = starField(dir, 400.0, 0.012) * 0.2 * galacticPlane;
    
    // Star color temperature variation (blue-white-orange)
    vec3 starSeed = hash33(dir * 80.0);
    float temp = starSeed.x * 0.5 + 0.5;
    vec3 starColor = mix(
      mix(vec3(0.6, 0.7, 1.0), vec3(1.0, 1.0, 1.0), temp),
      vec3(1.0, 0.8, 0.5),
      smoothstep(0.7, 1.0, temp)
    );
    
    float totalStars = brightStars + dimStars + tinyStars;
    
    // ── Combine ──
    vec3 color = bgColor + nebulaColor1 + nebulaColor2 + milkyColor + starColor * totalStars;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export function DeepSpaceSkybox() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { settings } = useQuality();

  // Uniforms are created once and updated in useFrame every frame
  // Do not add settings to deps array - it would recreate uniforms objects unnecessarily
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOctaves: { value: settings.nebulaOctaves },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uOctaves.value = settings.nebulaOctaves;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[500, 16, 16]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={skyboxVertexShader}
        fragmentShader={skyboxFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default DeepSpaceSkybox;
