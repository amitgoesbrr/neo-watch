"use client";

/**
 * Shared 3D utility components and shaders for the orbital viewers
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// {{{ Corona Shader - For sun glow effect
export const coronaVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const coronaFragmentShader = `
  uniform float time;
  uniform vec3 glowColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Simple noise function
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    
    // Add pulsing effect
    float pulse = sin(time * 2.0) * 0.1 + 0.9;
    
    // Add some noise-based variation
    float noiseVal = noise(vPosition + time * 0.5) * 0.2;
    
    vec3 color = glowColor * (intensity + noiseVal) * pulse;
    float alpha = intensity * 0.8;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
// }}}

// {{{ Atmosphere Shader - For Earth glow
export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    rim = pow(rim, 3.0);
    
    vec3 color = glowColor * rim * intensity;
    float alpha = rim * 0.6;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
// }}}

// {{{ Enhanced Sun Component
export function EnhancedSun({ 
  intensity = 4,
  size = 2,
  texture 
}: { 
  intensity?: number;
  size?: number;
  texture?: THREE.Texture;
}) {
  const coronaMaterialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    glowColor: { value: new THREE.Color("#ffaa44") }
  }), []);
  
  useFrame((state) => {
    if (coronaMaterialRef.current) {
      coronaMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* Core Sun */}
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          map={texture}
          emissiveMap={texture}
          emissiveIntensity={intensity} 
          emissive="#fbbf24" 
          color="#ffffff"
        />
      </mesh>
      
      {/* Inner Corona */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[size, 32, 32]} />
        <shaderMaterial
          ref={coronaMaterialRef}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={coronaVertexShader}
          fragmentShader={coronaFragmentShader}
        />
      </mesh>
      
      {/* Outer Glow */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial 
          color="#ff8800" 
          transparent 
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Point light from sun */}
      <pointLight intensity={intensity * 1.5} distance={100} decay={2} color="#fbbf24" />
    </group>
  );
}
// }}}

// {{{ Earth with Atmosphere
export function EarthWithAtmosphere({
  texture,
  orbitRadius = 10,
  orbitSpeed = 0.1,
  size = 0.5,
  showLabel = true
}: {
  texture?: THREE.Texture;
  orbitRadius?: number;
  orbitSpeed?: number;
  size?: number;
  showLabel?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  
  const atmosphereUniforms = useMemo(() => ({
    glowColor: { value: new THREE.Color("#4da6ff") },
    intensity: { value: 0.8 }
  }), []);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * orbitSpeed;
      groupRef.current.position.x = Math.sin(t) * orbitRadius;
      groupRef.current.position.z = Math.cos(t) * orbitRadius;
    }
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth Core */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial 
          map={texture}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>
      
      {/* Atmosphere Glow */}
      <mesh scale={[1.15, 1.15, 1.15]}>
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
      
      {/* Second layer for deeper glow */}
      <mesh scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
// }}}

// {{{ Danger Zone Rings - Visual indicator of approach distances
export function DangerZoneRings({ 
  earthRadius = 0.5,
  showLabels = false 
}: { 
  earthRadius?: number;
  showLabels?: boolean;
}) {
  // Scale factors (1 LD ≈ 384,400 km, shown as relative units)
  const lunarDistance = earthRadius * 5;
  const closeApproachZone = earthRadius * 3;
  const criticalZone = earthRadius * 1.5;
  
  return (
    <group>
      {/* Lunar Distance Ring - Green (Safe) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[lunarDistance - 0.05, lunarDistance + 0.05, 128]} />
        <meshBasicMaterial 
          color="#22c55e" 
          opacity={0.15} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Close Approach Zone - Amber (Warning) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[closeApproachZone - 0.03, closeApproachZone + 0.03, 128]} />
        <meshBasicMaterial 
          color="#f59e0b" 
          opacity={0.2} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Critical Zone - Red (Danger) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[criticalZone - 0.02, criticalZone + 0.02, 128]} />
        <meshBasicMaterial 
          color="#ef4444" 
          opacity={0.25} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
// }}}

// {{{ Orbit Path - Enhanced with gradient
export function OrbitPath({ 
  radius, 
  color = "#ffffff",
  opacity = 0.08,
  segments = 128 
}: { 
  radius: number;
  color?: string;
  opacity?: number;
  segments?: number;
}) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.03, radius + 0.03, segments]} />
      <meshBasicMaterial 
        color={color} 
        opacity={opacity} 
        transparent 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
// }}}

// {{{ Animated Grid Helper
export function AnimatedGrid({ 
  size = 60, 
  divisions = 60 
}: { 
  size?: number;
  divisions?: number;
}) {
  return (
    <gridHelper 
      args={[size, divisions, 0x222222, 0x111111]} 
      position={[0, -2, 0]}
    />
  );
}
// }}}
