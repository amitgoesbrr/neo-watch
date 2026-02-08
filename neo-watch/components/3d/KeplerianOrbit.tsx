"use client";

/**
 * Keplerian Orbit Visualization
 * Renders accurate orbital paths based on real orbital elements
 */

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { 
  OrbitalElements, 
  generateOrbitPath, 
  AU_TO_SCENE_SCALE,
  EARTH_ORBITAL_ELEMENTS 
} from "@/lib/orbital";

interface KeplerianOrbitProps {
  elements: OrbitalElements;
  color?: string;
  opacity?: number;
  segments?: number;
  scale?: number;
  lineWidth?: number;
  dashed?: boolean;
}

// {{{ Keplerian Orbit Path
export function KeplerianOrbit({
  elements,
  color = "#ffffff",
  opacity = 0.3,
  segments = 128,
  scale = AU_TO_SCENE_SCALE,
  lineWidth = 1,
  dashed = false
}: KeplerianOrbitProps) {
  const points = useMemo(() => {
    return generateOrbitPath(elements, segments, scale);
  }, [elements, segments, scale]);
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      dashed={dashed}
      dashScale={dashed ? 10 : 1}
      dashSize={dashed ? 0.5 : 1}
      gapSize={dashed ? 0.3 : 0}
    />
  );
}
// }}}

// {{{ Earth Orbit - Reference orbit
export function EarthOrbit({
  color = "#3b82f6",
  opacity = 0.2,
  scale = AU_TO_SCENE_SCALE
}: {
  color?: string;
  opacity?: number;
  scale?: number;
}) {
  return (
    <KeplerianOrbit
      elements={EARTH_ORBITAL_ELEMENTS}
      color={color}
      opacity={opacity}
      scale={scale}
      segments={128}
    />
  );
}
// }}}

// {{{ Multi-Orbit Display - Shows multiple orbital paths
interface MultiOrbitDisplayProps {
  orbits: Array<{
    elements: OrbitalElements;
    color?: string;
    label?: string;
    isHazardous?: boolean;
  }>;
  showEarthOrbit?: boolean;
  scale?: number;
}

export function MultiOrbitDisplay({
  orbits,
  showEarthOrbit = true,
  scale = AU_TO_SCENE_SCALE
}: MultiOrbitDisplayProps) {
  return (
    <group>
      {showEarthOrbit && (
        <EarthOrbit scale={scale} />
      )}
      
      {orbits.map((orbit, index) => (
        <KeplerianOrbit
          key={index}
          elements={orbit.elements}
          color={orbit.color || (orbit.isHazardous ? "#ef4444" : "#888888")}
          opacity={orbit.isHazardous ? 0.4 : 0.2}
          scale={scale}
          dashed={!orbit.isHazardous}
        />
      ))}
    </group>
  );
}
// }}}

// {{{ Orbital Node Markers - Shows ascending/descending nodes
interface OrbitalNodeMarkersProps {
  elements: OrbitalElements;
  scale?: number;
  showAscending?: boolean;
  showDescending?: boolean;
}

export function OrbitalNodeMarkers({
  elements,
  scale = AU_TO_SCENE_SCALE,
  showAscending = true,
  showDescending = true
}: OrbitalNodeMarkersProps) {
  const nodes = useMemo(() => {
    const { semiMajorAxis: a, eccentricity: e, longitudeOfAscendingNode: omega } = elements;
    
    // Calculate node positions (simplified)
    const r = a * (1 - e * e); // Semi-latus rectum approximation
    
    // Ascending node at true anomaly = 0 - argument of perihelion
    const ascendingX = Math.cos(omega) * r * scale;
    const ascendingZ = -Math.sin(omega) * r * scale;
    
    // Descending node is 180° away
    const descendingX = -ascendingX;
    const descendingZ = -ascendingZ;
    
    return {
      ascending: new THREE.Vector3(ascendingX, 0, ascendingZ),
      descending: new THREE.Vector3(descendingX, 0, descendingZ)
    };
  }, [elements, scale]);
  
  return (
    <group>
      {showAscending && (
        <mesh position={nodes.ascending}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      )}
      
      {showDescending && (
        <mesh position={nodes.descending}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}
    </group>
  );
}
// }}}

// {{{ Perihelion/Aphelion Markers
interface ApsisMarkersProps {
  elements: OrbitalElements;
  scale?: number;
}

export function ApsisMarkers({
  elements,
  scale = AU_TO_SCENE_SCALE
}: ApsisMarkersProps) {
  const apsides = useMemo(() => {
    const { semiMajorAxis: a, eccentricity: e, argumentOfPerihelion: w, longitudeOfAscendingNode: omega } = elements;
    
    // Perihelion distance
    const rPeri = a * (1 - e) * scale;
    // Aphelion distance
    const rAph = a * (1 + e) * scale;
    
    // Perihelion direction (in ecliptic plane, simplified)
    const periAngle = omega + w;
    const aphAngle = periAngle + Math.PI;
    
    return {
      perihelion: new THREE.Vector3(
        Math.cos(periAngle) * rPeri,
        0,
        -Math.sin(periAngle) * rPeri
      ),
      aphelion: new THREE.Vector3(
        Math.cos(aphAngle) * rAph,
        0,
        -Math.sin(aphAngle) * rAph
      )
    };
  }, [elements, scale]);
  
  return (
    <group>
      {/* Perihelion - closest to Sun */}
      <mesh position={apsides.perihelion}>
        <octahedronGeometry args={[0.08]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      
      {/* Aphelion - farthest from Sun */}
      <mesh position={apsides.aphelion}>
        <octahedronGeometry args={[0.08]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
}
// }}}

export default KeplerianOrbit;
