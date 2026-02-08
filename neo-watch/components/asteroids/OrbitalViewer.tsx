"use client";

/**
 * Enhanced Orbital Viewer for Asteroid Detail Page
 * Features: Post-processing, enhanced visuals, danger zones
 * Upgraded with professional 3D pipeline
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Trail, useTexture } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

import { 
  DangerZoneRings,
  OrbitPath,
  AnimatedGrid 
} from "@/components/3d/SceneElements";

// New professional 3D components
import { QualityManager } from "@/components/3d/systems/QualityManager";
import { VolumetricSun } from "@/components/3d/celestial/VolumetricSun";
import { PhotorealisticEarth } from "@/components/3d/celestial/PhotorealisticEarth";
import { DeepSpaceSkybox } from "@/components/3d/environment/DeepSpaceSkybox";
import { CinematicPipeline } from "@/components/3d/postprocessing/CinematicPipeline";
import { CameraRig } from "@/components/3d/camera/CameraRig";
import { CosmicDust } from "@/components/3d/particles/GPUParticles";

// {{{ Textured Sun (VolumetricSun)
function TexturedSun({ sunRef }: { sunRef: React.RefObject<THREE.Mesh | null> }) {
  let sunMap: THREE.Texture | undefined;
  try {
    sunMap = useTexture("/textures/sun_texture.png");
  } catch {
    // Fallback to procedural
  }
  return <VolumetricSun texture={sunMap} intensity={3} size={2} sunMeshRef={sunRef} />;
}
// }}}

// {{{ Earth with Trail (PhotorealisticEarth)
function TexturedEarthWithTrail() {
  return (
    <PhotorealisticEarth
      orbitRadius={15}
      orbitSpeed={0.15}
      size={0.5}
      sunPosition={[0, 0, 0]}
    />
  );
}
// }}}

// {{{ Featured Asteroid - The main asteroid being viewed
function FeaturedAsteroid({
  name = "NEO",
  size = 0.5,
  isHazardous = false,
  distance = 22,
  velocity = 0.12,
  eccentricity = 0.3,
  inclination = 0.4
}: {
  name?: string;
  size?: number;
  isHazardous?: boolean;
  distance?: number;
  velocity?: number;
  eccentricity?: number;
  inclination?: number;
}) {
  const asteroidMap = useTexture("/textures/asteroid_texture.png");
  const meshRef = useRef<THREE.Mesh>(null);
  const color = isHazardous ? "#ef4444" : "#10b981";
  
  // Scale display size
  const displaySize = Math.min(Math.max(size / 100, 0.25), 0.9);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * velocity;
      
      // Elliptical orbit
      const x = Math.sin(t) * distance * (1 + eccentricity);
      const z = Math.cos(t) * distance;
      const y = Math.sin(t) * distance * inclination;

      meshRef.current.position.set(x, y, z);
      meshRef.current.rotation.x += 0.008;
      meshRef.current.rotation.y += 0.012;
    }
  });

  return (
    <Trail 
      width={2.5} 
      length={20} 
      color={color} 
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef} position={[distance, 0, 0]}>
        <dodecahedronGeometry args={[displaySize, 2]} />
        <meshStandardMaterial
          map={asteroidMap}
          color={isHazardous ? "#ff8888" : "#d4d0c8"}
          roughness={0.85}
          metalness={0.15}
          emissive={color}
          emissiveIntensity={isHazardous ? 0.25 : 0.1}
        />
        
        {/* Persistent Asteroid Label — always visible */}
        <Html position={[0, displaySize + 0.6, 0]} center zIndexRange={[100, 0]}
          distanceFactor={18}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex flex-col items-center gap-0.5 select-none">
            <div
              className={`text-[10px] font-bold font-mono tracking-wide px-2 py-1 rounded-sm backdrop-blur-sm border ${
                isHazardous
                  ? "text-red-300 border-red-500/40 bg-red-950/60 shadow-lg shadow-red-500/20"
                  : "text-emerald-300 border-emerald-500/30 bg-emerald-950/50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isHazardous && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
                <span className="opacity-60">◆</span> {name}
              </div>
            </div>
            <span className={`w-8 h-px ${isHazardous ? 'bg-red-400/40' : 'bg-emerald-400/40'}`} />
          </div>
        </Html>
        
        {/* Glow effect for hazardous */}
        {isHazardous && (
          <mesh scale={[1.6, 1.6, 1.6]}>
            <sphereGeometry args={[displaySize, 16, 16]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </mesh>
    </Trail>
  );
}
// }}}

// {{{ Loading Fallback
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-plasma-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-white/50 animate-pulse font-mono">
          Loading Scene...
        </span>
      </div>
    </Html>
  );
}
// }}}

// {{{ Main Component
export default function OrbitalViewer({
  asteroidName = "Unknown",
  asteroidSize = 0.5,
  isHazardous = false,
  showDangerZones = true,
  enablePostProcessing = true
}: {
  asteroidName?: string;
  asteroidSize?: number;
  isHazardous?: boolean;
  showDangerZones?: boolean;
  enablePostProcessing?: boolean;
}) {
  const sunRef = useRef<THREE.Mesh>(null);

  return (
    <div className="w-full h-full bg-cosmic-black rounded-xl overflow-hidden relative">
      <Canvas 
        camera={{ position: [0, 20, 30], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={["#050508"]} />
        <fog attach="fog" args={["#050508", 25, 70]} />

        {/* Adaptive Quality System */}
        <QualityManager />

        {/* Lighting */}
        <ambientLight intensity={0.12} />

        {/* Procedural Deep Space Background */}
        <DeepSpaceSkybox />

        {/* GPU Particle Dust */}
        <CosmicDust />

        {/* Scene Content */}
        <Suspense fallback={<LoadingFallback />}>
          <TexturedSun sunRef={sunRef} />
          <OrbitPath radius={15} color="#3b82f6" opacity={0.08} />
          <TexturedEarthWithTrail />
          
          {/* Asteroid Orbit Path */}
          <OrbitPath radius={22} color={isHazardous ? "#ef4444" : "#10b981"} opacity={0.06} />
          
          {/* Featured Asteroid */}
          <FeaturedAsteroid
            name={asteroidName}
            size={asteroidSize}
            isHazardous={isHazardous}
            distance={22}
            velocity={0.12}
            eccentricity={0.3}
            inclination={0.4}
          />
          
          {/* Danger Zones */}
          {showDangerZones && (
            <group position={[0, 0, 0]}>
              <DangerZoneRings earthRadius={0.5} />
            </group>
          )}
        </Suspense>

        {/* Grid */}
        <AnimatedGrid size={60} divisions={60} />

        {/* Camera Rig */}
        <CameraRig
          defaultPosition={[0, 20, 30]}
          enableEntrance={true}
          enableAutoOrbit={true}
          enableShake={true}
          minDistance={10}
          maxDistance={50}
        />

        {/* Cinematic Post-Processing */}
        {enablePostProcessing && (
          <CinematicPipeline />
        )}
      </Canvas>

      {/* Info Overlay */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="glass px-3 py-2 rounded-lg border border-white/10">
          <h4 className="text-xs font-bold font-display text-white">
            {asteroidName} Orbit
          </h4>
          <p className="text-[10px] text-white/50 font-mono mt-1">
            Ref Frame: Heliocentric Ecliptic
          </p>
        </div>
      </div>

      {/* Hazard Indicator */}
      {isHazardous && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="glass px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-400">
                HAZARDOUS OBJECT
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// }}}
