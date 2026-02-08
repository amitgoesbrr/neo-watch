"use client";

/**
 * Impact Corridor Visualization
 * Shows potential impact paths and risk zones for hazardous asteroids
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { NEO } from "@/lib/api";

interface ImpactCorridorProps {
  asteroid: NEO;
  earthPosition?: THREE.Vector3;
  visible?: boolean;
}

// {{{ Impact Corridor Cone
export function ImpactCorridor({
  asteroid,
  earthPosition = new THREE.Vector3(10, 0, 0),
  visible = true
}: ImpactCorridorProps) {
  const coneRef = useRef<THREE.Mesh>(null);
  
  // Only show for hazardous asteroids
  if (!asteroid.isPotentiallyHazardous || !visible) {
    return null;
  }
  
  // Calculate corridor properties based on asteroid data
  const corridorParams = useMemo(() => {
    const missDistance = asteroid.closeApproachData[0]?.missDistance.kilometers || 1000000;
    const velocity = asteroid.closeApproachData[0]?.velocity?.kmPerSecond || 20;
    
    // Corridor width based on uncertainty (simplified)
    const width = Math.min(0.5, Number(missDistance) / 10000000);
    
    // Length based on approach velocity
    const length = Math.min(15, Number(velocity) / 5);
    
    return { width, length };
  }, [asteroid]);
  
  useFrame((state) => {
    if (!coneRef.current) return;
    
    // Pulsing opacity animation
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.2;
    const material = coneRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = pulse;
  });
  
  return (
    <group position={earthPosition}>
      <mesh ref={coneRef} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[corridorParams.width, corridorParams.length, 32, 1, true]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
// }}}

// {{{ Risk Zone Indicator - Pulsing sphere showing uncertainty region
interface RiskZoneProps {
  position: THREE.Vector3;
  radius?: number;
  riskLevel?: "low" | "medium" | "high" | "critical";
}

export function RiskZone({
  position,
  radius = 1,
  riskLevel = "medium"
}: RiskZoneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    switch (riskLevel) {
      case "critical": return "#dc2626";
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#22c55e";
      default: return "#f59e0b";
    }
  }, [riskLevel]);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Pulsing scale animation
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    meshRef.current.scale.setScalar(scale);
    
    // Rotating slowly
    meshRef.current.rotation.y += 0.005;
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        wireframe
      />
    </mesh>
  );
}
// }}}

// {{{ Approach Vector Line - Shows asteroid trajectory toward Earth
interface ApproachVectorProps {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  color?: string;
  opacity?: number;
}

export function ApproachVector({
  startPosition,
  endPosition,
  color = "#ef4444",
  opacity = 0.5
}: ApproachVectorProps) {
  const points = useMemo(() => [startPosition, endPosition], [startPosition, endPosition]);
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={opacity}
      dashed
      dashScale={5}
      dashSize={0.5}
      gapSize={0.2}
    />
  );
}
// }}}

// {{{ Close Approach Marker - Shows point of closest approach
interface CloseApproachMarkerProps {
  position: THREE.Vector3;
  label?: string;
  distance?: number;
}

export function CloseApproachMarker({
  position
}: CloseApproachMarkerProps) {
  const markerRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!markerRef.current) return;
    
    // Rotate marker rings
    markerRef.current.rotation.y += 0.02;
    markerRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
  });
  
  return (
    <group ref={markerRef} position={position}>
      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Center point */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
// }}}

export default ImpactCorridor;
