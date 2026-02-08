"use client";

/**
 * Hero Scene for Landing Page
 * Dramatic 3D visualization with Earth and flying asteroid
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { useRef, Suspense, useMemo, useSyncExternalStore } from "react";
import * as THREE from "three";
import { LightPostProcessing } from "./PostProcessing";
import { 
  atmosphereVertexShader, 
  atmosphereFragmentShader 
} from "./SceneElements";

// Simple seeded random for deterministic particle positions
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// {{{ Hero Earth - Large Earth with atmosphere
function HeroEarth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  const atmosphereUniforms = useMemo(() => ({
    glowColor: { value: new THREE.Color("#4da6ff") },
    intensity: { value: 1.0 }
  }), []);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={[-2, -1, -5]}>
      {/* Earth Core */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshStandardMaterial 
          color="#1e40af"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Atmosphere Layer 1 */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[4, 32, 32]} />
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
      
      {/* Atmosphere Layer 2 - Outer glow */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[4, 16, 16]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
// }}}

// {{{ Flying Asteroid - Dramatic fly-by animation
function FlyingAsteroid() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * 0.15;
      
      // Figure-8 / infinity path for continuous motion
      const scale = 12;
      meshRef.current.position.x = Math.sin(t) * scale;
      meshRef.current.position.z = Math.sin(t) * Math.cos(t) * scale * 0.5 - 8;
      meshRef.current.position.y = Math.cos(t * 2) * 3 + 2;
      
      // Tumbling rotation
      meshRef.current.rotation.x += 0.008;
      meshRef.current.rotation.y += 0.012;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <Float 
      speed={1.5} 
      rotationIntensity={0.3} 
      floatIntensity={0.3}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial
          color="#8B7355"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}
// }}}

// {{{ Small Debris - Floating space debris for atmosphere
function SpaceDebris({ count = 30 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate particles with seeded random for deterministic results
  const particles = useMemo(() => {
    return Array.from({ length: count }, (__, index) => ({
      position: new THREE.Vector3(
        (seededRandom(index * 3 + 1) - 0.5) * 40,
        (seededRandom(index * 3 + 2) - 0.5) * 20,
        (seededRandom(index * 3 + 3) - 0.5) * 30 - 10
      ),
      scale: seededRandom(index * 4 + 1) * 0.15 + 0.05,
      speed: seededRandom(index * 4 + 2) * 0.5 + 0.2,
      offset: seededRandom(index * 4 + 3) * Math.PI * 2
    }));
  }, [count]);

  // Cache the tempObject to avoid GC pressure
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  useFrame((state) => {
    if (meshRef.current) {
      particles.forEach((particle, i) => {
        const t = state.clock.elapsedTime * particle.speed + particle.offset;
        
        tempObject.position.copy(particle.position);
        tempObject.position.x += Math.sin(t) * 0.5;
        tempObject.position.y += Math.cos(t * 0.7) * 0.3;
        
        tempObject.rotation.x = t;
        tempObject.rotation.y = t * 0.7;
        
        tempObject.scale.setScalar(particle.scale);
        tempObject.updateMatrix();
        
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#666666" roughness={0.9} />
    </instancedMesh>
  );
}
// }}}

// {{{ Orbit Rings - Decorative orbital paths
function OrbitRings() {
  return (
    <group position={[-2, -1, -5]}>
      {[6, 8, 10].map((radius, i) => (
        <mesh 
          key={radius} 
          rotation={[Math.PI / 2 + i * 0.1, i * 0.2, 0]}
        >
          <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
          <meshBasicMaterial 
            color="#ffffff" 
            opacity={0.05 - i * 0.01} 
            transparent 
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
// }}}

// {{{ Camera Animation - Using position.set instead of direct property assignment
function CameraAnimation() {
  const { camera } = useThree();
  const basePosition = useRef(camera.position.clone());
  
  useFrame((state) => {
    // Subtle camera sway using additive offset
    const t = state.clock.elapsedTime * 0.1;
    const newX = basePosition.current.x + Math.sin(t) * 0.5;
    const newY = basePosition.current.y + Math.cos(t * 0.5) * 0.3;
    camera.position.set(newX, newY, basePosition.current.z);
  });
  
  return null;
}
// }}}

// {{{ Main Hero Scene Component
// Client-only detection using useSyncExternalStore
function useIsClient() {
  const subscribe = () => () => {};
  const getSnapshot = () => true;
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function HeroScene({ className = "" }: { className?: string }) {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <div className={`absolute inset-0 z-0 bg-cosmic-black ${className}`} />;
  }
  
  return (
    <div className={`absolute inset-0 z-0 ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={["#050508", 15, 40]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={0.8} 
          color="#ffffff"
        />
        <pointLight 
          position={[-10, 5, -10]} 
          intensity={0.3} 
          color="#4da6ff"
        />
        
        {/* Stars Background - reduced count for performance */}
        <Stars 
          radius={100} 
          depth={50} 
          count={1500} 
          factor={4} 
          saturation={0} 
          fade 
          speed={0.3}
        />
        
        {/* Scene Elements */}
        <Suspense fallback={null}>
          <HeroEarth />
          <FlyingAsteroid />
          <SpaceDebris count={15} />
          <OrbitRings />
        </Suspense>
        
        {/* Camera Animation */}
        <CameraAnimation />
        
        {/* Light post-processing - just bloom */}
        <LightPostProcessing />
      </Canvas>
    </div>
  );
}
// }}}
