"use client";

/**
 * LOD (Level of Detail) Asteroid Component
 * Reduces geometry complexity based on camera distance
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Detailed, Html } from "@react-three/drei";
import * as THREE from "three";
import { NEO } from "@/lib/api";

interface LODAsteroidProps {
  neo: NEO;
  orbitRadius?: number;
  orbitSpeed?: number;
  showLabel?: boolean;
  onClick?: () => void;
}

// Simple seeded random
function seededRandom(seed: number): number {
  return Math.sin(seed * 9999) * 0.5 + 0.5;
}

export function LODAsteroid({
  neo,
  orbitRadius,
  orbitSpeed,
  showLabel = false,
  onClick
}: LODAsteroidProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate stable parameters from NEO ID
  const params = useMemo(() => {
    const idNum = neo.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pr = (offset: number) => seededRandom(idNum + offset);
    
    return {
      distance: orbitRadius ?? 12 + pr(1) * 15,
      speed: orbitSpeed ?? 0.05 + pr(2) * 0.1,
      offset: pr(3) * Math.PI * 2,
      inclination: (pr(4) - 0.5) * 0.3,
      eccentricity: pr(5) * 0.2,
      size: Math.max(0.2, Math.min(neo.estimatedDiameter.maxM / 100, 0.6)),
      color: neo.isPotentiallyHazardous ? "#ef4444" : "#888888"
    };
  }, [neo, orbitRadius, orbitSpeed]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.elapsedTime * params.speed + params.offset;
    const r = params.distance;
    
    const x = Math.cos(t) * r * (1 + Math.sin(t * 0.5) * params.eccentricity);
    const z = Math.sin(t) * r;
    const y = Math.sin(t * 2) * (r * params.inclination);
    
    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.x += 0.01;
    groupRef.current.rotation.y += 0.015;
  });
  
  return (
    <group ref={groupRef} onClick={onClick}>
      <Detailed distances={[0, 20, 40, 60]}>
        {/* High detail - very close (0-20 units) */}
        <mesh>
          <dodecahedronGeometry args={[params.size, 2]} />
          <meshStandardMaterial 
            color={params.color}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Medium detail - close (20-40 units) */}
        <mesh>
          <dodecahedronGeometry args={[params.size, 1]} />
          <meshStandardMaterial 
            color={params.color}
            roughness={0.8}
          />
        </mesh>
        
        {/* Low detail - medium distance (40-60 units) */}
        <mesh>
          <dodecahedronGeometry args={[params.size, 0]} />
          <meshBasicMaterial color={params.color} />
        </mesh>
        
        {/* Very low detail - far (60+ units) */}
        <mesh>
          <boxGeometry args={[params.size * 0.8, params.size * 0.8, params.size * 0.8]} />
          <meshBasicMaterial color={params.color} />
        </mesh>
      </Detailed>
      
      {/* Label */}
      {showLabel && (
        <Html
          position={[0, params.size + 0.5, 0]}
          center
          distanceFactor={20}
          occlude
          style={{ pointerEvents: "none" }}
        >
          <div className={`
            text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm border font-mono whitespace-nowrap
            ${neo.isPotentiallyHazardous 
              ? "text-red-300 border-red-500/30 bg-red-500/10" 
              : "text-white/70 border-white/20 bg-black/30"
            }
          `}>
            {neo.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Group component for multiple LOD asteroids
interface LODAsteroidGroupProps {
  neos: NEO[];
  showLabels?: boolean;
  maxVisible?: number;
  onAsteroidClick?: (neo: NEO) => void;
}

export function LODAsteroidGroup({
  neos,
  showLabels = false,
  maxVisible = 100,
  onAsteroidClick
}: LODAsteroidGroupProps) {
  // Limit and prioritize hazardous asteroids
  const visibleNeos = useMemo(() => {
    return [...neos]
      .sort((a, b) => {
        if (a.isPotentiallyHazardous !== b.isPotentiallyHazardous) {
          return a.isPotentiallyHazardous ? -1 : 1;
        }
        return 0;
      })
      .slice(0, maxVisible);
  }, [neos, maxVisible]);
  
  return (
    <group>
      {visibleNeos.map((neo) => (
        <LODAsteroid
          key={neo.id}
          neo={neo}
          showLabel={showLabels}
          onClick={() => onAsteroidClick?.(neo)}
        />
      ))}
    </group>
  );
}

export default LODAsteroid;
