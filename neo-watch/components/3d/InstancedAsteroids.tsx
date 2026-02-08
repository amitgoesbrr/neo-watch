"use client";

/**
 * Instanced Asteroids for Performance
 * Uses Three.js InstancedMesh for rendering many asteroids efficiently
 */

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NEO } from "@/lib/api";

// Seeded random for deterministic values
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Generate orbit parameters from NEO ID
function generateOrbitParams(neo: NEO, index: number) {
  const idNum = neo.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pr = (offset: number) => seededRandom(idNum + offset + index);
  
  return {
    distance: 12 + pr(1) * 15,
    speed: 0.05 + pr(2) * 0.1,
    offset: pr(3) * Math.PI * 2,
    inclination: (pr(4) - 0.5) * 0.3,
    eccentricity: pr(5) * 0.2,
    rotationSeed: pr(6) * Math.PI * 2,
    size: Math.max(0.15, Math.min(neo.estimatedDiameter.maxM / 150, 0.5)),
    isHazardous: neo.isPotentiallyHazardous
  };
}

interface InstancedAsteroidsProps {
  neos: NEO[];
  baseColor?: string;
  hazardousColor?: string;
}

export function InstancedAsteroids({
  neos,
  baseColor = "#888888",
  hazardousColor = "#ef4444"
}: InstancedAsteroidsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorArray = useRef<Float32Array | null>(null);
  
  // Pre-calculate orbit parameters
  const orbitData = useMemo(() => {
    return neos.map((neo, index) => generateOrbitParams(neo, index));
  }, [neos]);
  
  // Temporary objects for matrix calculations
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  // Initialize colors
  useEffect(() => {
    if (!meshRef.current || neos.length === 0) return;
    
    const colors = new Float32Array(neos.length * 3);
    
    neos.forEach((neo, i) => {
      const color = neo.isPotentiallyHazardous 
        ? tempColor.set(hazardousColor)
        : tempColor.set(baseColor);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    
    colorArray.current = colors;
    
    // Set instance colors
    const geometry = meshRef.current.geometry;
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    
    // Initialize transforms
    orbitData.forEach((params, i) => {
      tempObject.position.set(params.distance, 0, 0);
      tempObject.scale.setScalar(params.size);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [neos, orbitData, baseColor, hazardousColor, tempColor, tempObject]);
  
  // Animation loop
  useFrame((state) => {
    if (!meshRef.current || neos.length === 0) return;
    
    const time = state.clock.elapsedTime;
    
    orbitData.forEach((params, i) => {
      const t = time * params.speed + params.offset;
      
      // Elliptical orbit
      const r = params.distance;
      const x = Math.cos(t) * r * (1 + Math.sin(t * 0.5) * params.eccentricity);
      const z = Math.sin(t) * r;
      const y = Math.sin(t * 2) * (r * params.inclination);
      
      tempObject.position.set(x, y, z);
      
      // Rotation
      const rotSpeed = 0.5 + params.rotationSeed * 0.5;
      tempObject.rotation.x = time * rotSpeed + params.rotationSeed;
      tempObject.rotation.y = time * rotSpeed * 0.7;
      
      tempObject.scale.setScalar(params.size);
      tempObject.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  
  if (neos.length === 0) return null;
  
  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, neos.length]}
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial 
        vertexColors 
        roughness={0.8}
        metalness={0.1}
      />
    </instancedMesh>
  );
}

export default InstancedAsteroids;
