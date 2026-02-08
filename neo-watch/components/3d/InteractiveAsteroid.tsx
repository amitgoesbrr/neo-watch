"use client";

/**
 * Interactive Asteroid Component
 * Features: Click to navigate, hover effects, info tooltips
 */

import { useRef, useState, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Trail } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { NEO } from "@/lib/api";

interface InteractiveAsteroidProps {
  neo: NEO;
  texture?: THREE.Texture;
  enableInteraction?: boolean;
  showTrail?: boolean;
  showTooltip?: boolean;
}

// {{{ Single Interactive Asteroid
export function InteractiveAsteroid({
  neo,
  texture,
  enableInteraction = true,
  showTrail = false,
  showTooltip = true
}: InteractiveAsteroidProps) {
  const router = useRouter();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Generate stable random orbit parameters based on NEO ID
  const orbitParams = useMemo(() => {
    const idNum = neo.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pseudoRandom = (offset: number) => Math.sin(idNum + offset) * 0.5 + 0.5;

    return {
      distance: 12 + (pseudoRandom(1) * 15),
      speed: 0.08 + (pseudoRandom(2) * 0.15),
      offset: pseudoRandom(3) * Math.PI * 2,
      inclination: (pseudoRandom(4) - 0.5) * 0.4,
      eccentricity: pseudoRandom(5) * 0.25,
      size: Math.max(0.2, Math.min(neo.estimatedDiameter.maxM / 100, 0.6)),
      color: neo.isPotentiallyHazardous ? "#ef4444" : "#a8a29e",
      rotationSpeed: 0.5 + pseudoRandom(6) * 0.5
    };
  }, [neo.id, neo.estimatedDiameter.maxM, neo.isPotentiallyHazardous]);

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * orbitParams.speed + orbitParams.offset;
      
      // Elliptical orbit calculation
      const r = orbitParams.distance;
      const x = Math.cos(t) * r * (1 + Math.sin(t) * orbitParams.eccentricity);
      const z = Math.sin(t) * r;
      const y = Math.sin(t * 2) * (r * orbitParams.inclination);
      
      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.x += 0.01 * orbitParams.rotationSpeed;
      meshRef.current.rotation.y += 0.015 * orbitParams.rotationSpeed;
      
      // Scale up on hover
      const targetScale = hovered ? 1.4 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = useCallback(() => {
    if (enableInteraction) {
      setClicked(true);
      router.push(`/asteroids/${neo.id}`);
    }
  }, [enableInteraction, router, neo.id]);

  const handlePointerOver = useCallback(() => {
    if (enableInteraction) {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  }, [enableInteraction]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "default";
  }, []);

  const asteroidMesh = (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <dodecahedronGeometry args={[orbitParams.size, 1]} />
      <meshStandardMaterial
        map={texture}
        color={hovered ? "#ffffff" : (orbitParams.color === "#ef4444" ? "#ff8888" : "#d4d0c8")}
        roughness={0.85}
        metalness={0.15}
        emissive={hovered ? orbitParams.color : (neo.isPotentiallyHazardous ? "#ef4444" : "#000000")}
        emissiveIntensity={hovered ? 0.5 : (neo.isPotentiallyHazardous ? 0.15 : 0)}
      />

      {/* Persistent mini-label — always visible so asteroids are distinguishable */}
      <Html
        position={[0, orbitParams.size + 0.35, 0]}
        center
        distanceFactor={18}
        zIndexRange={[40, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="flex flex-col items-center gap-0 select-none">
          <div
            className={`text-[8px] font-mono tracking-wide whitespace-nowrap px-1.5 py-0.5 rounded-sm backdrop-blur-sm border ${
              neo.isPotentiallyHazardous
                ? "text-red-300 border-red-500/40 bg-red-950/60 shadow-[0_0_6px_rgba(239,68,68,0.3)]"
                : "text-stone-400 border-stone-500/30 bg-stone-950/50"
            }`}
          >
            <span className="flex items-center gap-1">
              {neo.isPotentiallyHazardous && (
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse inline-block" />
              )}
              <span className="opacity-60">◆</span> {neo.name.length > 12 ? neo.name.slice(0, 12) + '…' : neo.name}
            </span>
          </div>
        </div>
      </Html>
      
      {/* Detailed Hover Tooltip (on top of persistent label) */}
      {showTooltip && hovered && (
        <Html
          position={[0, orbitParams.size + 1.0, 0]}
          center
          distanceFactor={15}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="glass p-3 rounded-lg border border-white/20 min-w-40 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              {neo.isPotentiallyHazardous && (
                <span className="w-2 h-2 rounded-full bg-danger-red animate-pulse" />
              )}
              <h4 className="text-sm font-bold text-white truncate max-w-35">
                {neo.name}
              </h4>
            </div>
            <div className="space-y-1 text-[10px] text-text-muted font-mono">
              <p>
                <span className="text-text-secondary">Size:</span>{" "}
                {neo.estimatedDiameter.maxM.toFixed(0)}m
              </p>
              <p>
                <span className="text-text-secondary">Risk:</span>{" "}
                <span className={neo.isPotentiallyHazardous ? "text-danger-red" : "text-safe-green"}>
                  {neo.isPotentiallyHazardous ? "Hazardous" : "Safe"}
                </span>
              </p>
              {neo.closeApproachData[0] && (
                <p>
                  <span className="text-text-secondary">Miss:</span>{" "}
                  {(Number(neo.closeApproachData[0].missDistance.kilometers) / 1000000).toFixed(2)}M km
                </p>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-plasma-cyan">
              Click to view details →
            </div>
          </div>
        </Html>
      )}
      
      {/* Click feedback */}
      {clicked && (
        <mesh scale={[2, 2, 2]}>
          <ringGeometry args={[orbitParams.size, orbitParams.size + 0.1, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Glow halo for hazardous asteroids — makes them stand out */}
      {neo.isPotentiallyHazardous && (
        <mesh scale={[1.6, 1.6, 1.6]}>
          <sphereGeometry args={[orbitParams.size, 16, 16]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </mesh>
  );

  // Wrap with trail if enabled
  if (showTrail) {
    return (
      <Trail
        width={1.5}
        length={12}
        color={orbitParams.color}
        attenuation={(t) => t * t}
      >
        {asteroidMesh}
      </Trail>
    );
  }

  return asteroidMesh;
}
// }}}

// {{{ Asteroid Group - Renders multiple interactive asteroids
export function InteractiveAsteroidGroup({
  neos,
  texture,
  enableInteraction = true,
  showTrails = false,
  maxVisible = 50
}: {
  neos: NEO[];
  texture?: THREE.Texture;
  enableInteraction?: boolean;
  showTrails?: boolean;
  maxVisible?: number;
}) {
  // Limit number of rendered asteroids for performance
  const visibleNeos = useMemo(() => {
    // Sort by hazardous first, then by closest approach
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
        <InteractiveAsteroid
          key={neo.id}
          neo={neo}
          texture={texture}
          enableInteraction={enableInteraction}
          showTrail={showTrails && visibleNeos.length < 10}
          showTooltip={true}
        />
      ))}
    </group>
  );
}
// }}}

export default InteractiveAsteroid;
