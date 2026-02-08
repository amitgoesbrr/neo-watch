"use client";

/**
 * Holographic Material
 * Wireframe/scanline shader for "Tactical" view mode
 * Creates a semi-transparent, glowing-edge, sci-fi aesthetic
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Vertex Shader ───────────────────────────────────────────────────────────

const holographicVertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── Fragment Shader ─────────────────────────────────────────────────────────

const holographicFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uScanSpeed;
  uniform float uScanDensity;
  uniform float uFresnelPower;
  uniform float uOpacity;
  uniform float uGlitchIntensity;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  // Simple hash for glitch
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // ── Fresnel edge glow ──
    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, uFresnelPower);

    // ── Horizontal scan lines ──
    float scanY = vWorldPos.y * uScanDensity + uTime * uScanSpeed;
    float scanLine = sin(scanY) * 0.5 + 0.5;
    scanLine = step(0.85, scanLine) * 0.3;

    // ── Vertical scan lines (grid effect) ──
    float scanX = vWorldPos.x * uScanDensity * 0.5;
    float vScanLine = sin(scanX) * 0.5 + 0.5;
    vScanLine = step(0.9, vScanLine) * 0.15;

    // ── Sweeping highlight ──
    float sweepPos = sin(vWorldPos.y * 1.5 - uTime * 2.0);
    float sweep = smoothstep(-0.03, 0.0, sweepPos) * smoothstep(0.03, 0.0, sweepPos);
    sweep *= 2.0;

    // ── Glitch (optional) ──
    float glitch = 0.0;
    if (uGlitchIntensity > 0.0) {
      float glitchTime = floor(uTime * 10.0);
      float glitchRand = hash(glitchTime);
      if (glitchRand > 0.95) {
        glitch = hash(vWorldPos.y * 100.0 + glitchTime) * uGlitchIntensity;
      }
    }

    // ── Combine ──
    float intensity = fresnel * 1.5 + scanLine + vScanLine + sweep + glitch;
    vec3 color = uColor * intensity;
    
    // Core fill (very faint)
    float coreFill = 0.03;
    color += uColor * coreFill;

    float alpha = fresnel * 0.6 + scanLine * 0.2 + sweep * 0.8 + coreFill + glitch;
    alpha = clamp(alpha * uOpacity, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

interface HolographicMaterialProps {
  /** Primary color (default: cyan) */
  color?: string;
  /** Scan line speed */
  scanSpeed?: number;
  /** Scan line density */
  scanDensity?: number;
  /** Fresnel edge power */
  fresnelPower?: number;
  /** Overall opacity multiplier */
  opacity?: number;
  /** Glitch effect intensity (0 = off) */
  glitchIntensity?: number;
  /** Whether to render as wireframe */
  wireframe?: boolean;
}

export function HolographicMaterial({
  color = "#00ffcc",
  scanSpeed = 3.0,
  scanDensity = 60.0,
  fresnelPower = 2.0,
  opacity = 1.0,
  glitchIntensity = 0.0,
  wireframe = false,
}: HolographicMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uScanSpeed: { value: scanSpeed },
      uScanDensity: { value: scanDensity },
      uFresnelPower: { value: fresnelPower },
      uOpacity: { value: opacity },
      uGlitchIntensity: { value: glitchIntensity },
    }),
    [color, scanSpeed, scanDensity, fresnelPower, opacity, glitchIntensity]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={holographicVertexShader}
      fragmentShader={holographicFragmentShader}
      uniforms={uniforms}
      transparent
      depthWrite={false}
      side={THREE.DoubleSide}
      wireframe={wireframe}
      blending={THREE.AdditiveBlending}
    />
  );
}

// ─── Shield Material (selection highlight) ───────────────────────────────────

const shieldFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    float fresnel = 1.0 - abs(dot(normal, viewDir));
    fresnel = pow(fresnel, 3.0);

    // Pulse
    float pulse = sin(uTime * 3.0) * 0.15 + 0.85;

    // Hexagonal pattern approximation
    float hex = sin(vNormal.x * 20.0) * sin(vNormal.y * 20.0) * sin(vNormal.z * 20.0);
    hex = smoothstep(0.3, 0.5, abs(hex)) * 0.2;

    vec3 color = uColor * (fresnel + hex) * pulse;
    float alpha = (fresnel * 0.7 + hex) * pulse;

    gl_FragColor = vec4(color, alpha);
  }
`;

const shieldVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

interface ShieldMaterialProps {
  color?: string;
}

export function ShieldMaterial({ color = "#00aaff" }: ShieldMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={shieldVertexShader}
      fragmentShader={shieldFragmentShader}
      uniforms={uniforms}
      transparent
      depthWrite={false}
      side={THREE.DoubleSide}
      blending={THREE.AdditiveBlending}
    />
  );
}

export default HolographicMaterial;
