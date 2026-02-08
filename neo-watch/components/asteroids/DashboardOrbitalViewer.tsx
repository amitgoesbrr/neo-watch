"use client";

/**
 * Enhanced Dashboard Orbital Viewer
 * Features: Post-processing, interactive asteroids, danger zones
 * Upgraded with professional 3D pipeline
 */

import { Canvas, useThree } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { useRef, Suspense, useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import * as THREE from "three";

import { NEO } from "@/lib/api";
import { 
  DangerZoneRings,
  OrbitPath,
  AnimatedGrid 
} from "@/components/3d/SceneElements";
import { InteractiveAsteroidGroup } from "@/components/3d/InteractiveAsteroid";

// New professional 3D components
import { QualityManager } from "@/components/3d/systems/QualityManager";
import { VolumetricSun } from "@/components/3d/celestial/VolumetricSun";
import { PhotorealisticEarth } from "@/components/3d/celestial/PhotorealisticEarth";
import { DeepSpaceSkybox } from "@/components/3d/environment/DeepSpaceSkybox";
import { CinematicPipeline } from "@/components/3d/postprocessing/CinematicPipeline";
import { CameraRig } from "@/components/3d/camera/CameraRig";
import { CosmicDust } from "@/components/3d/particles/GPUParticles";

// {{{ Textured Sun (upgraded to VolumetricSun)
function TexturedSun({ sunRef }: { sunRef: React.RefObject<THREE.Mesh | null> }) {
  let sunMap: THREE.Texture | undefined;
  try {
    sunMap = useTexture("/textures/sun_texture.png");
  } catch {
    // Fallback to procedural surface
  }
  return <VolumetricSun texture={sunMap} intensity={4} size={2} sunMeshRef={sunRef} />;
}
// }}}

// {{{ Textured Earth (upgraded to PhotorealisticEarth)
function TexturedEarth() {
  return (
    <PhotorealisticEarth
      orbitRadius={10}
      orbitSpeed={0.1}
      size={0.5}
      sunPosition={[0, 0, 0]}
    />
  );
}
// }}}

// {{{ Textured Asteroids
function TexturedAsteroids({ neos }: { neos: NEO[] }) {
  const asteroidMap = useTexture("/textures/asteroid_texture.png");
  
  return (
    <InteractiveAsteroidGroup
      neos={neos}
      texture={asteroidMap}
      enableInteraction={true}
      showTrails={false}
      maxVisible={50}
    />
  );
}
// }}}

// Camera Controller replaced by CameraRig component

// {{{ Loading Fallback
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-plasma-cyan border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-white/50 animate-pulse font-mono">
          Loading Assets...
        </span>
      </div>
    </Html>
  );
}
// }}}

// {{{ Main Component
export default function DashboardOrbitalViewer({
  neos,
  viewMode = "3D",
  error,
  isLoading,
  showDangerZones = true,
  enablePostProcessing = true,
}: {
  neos: NEO[];
  viewMode?: "2D" | "3D";
  error: string | null;
  isLoading: boolean;
  showDangerZones?: boolean;
  enablePostProcessing?: boolean;
}) {
  const sunRef = useRef<THREE.Mesh>(null);

  return (
    <div className="w-full h-full bg-cosmic-black rounded-xl overflow-hidden relative">
      <Canvas
        gl={{
          antialias: false,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 25, 35], fov: 45 }}
      >
        <color attach="background" args={["#050508"]} />
        <fog attach="fog" args={["#050508", 30, 100]} />

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
          <OrbitPath radius={10} color="#3b82f6" opacity={0.1} />
          <TexturedEarth />
          
          {/* Danger Zone Visualization */}
          {showDangerZones && (
            <group position={[0, 0, 0]}>
              <DangerZoneRings earthRadius={0.5} />
            </group>
          )}
          
          {/* Interactive Asteroids */}
          <TexturedAsteroids neos={neos} />
        </Suspense>

        {/* Grid */}
        <AnimatedGrid size={60} divisions={60} />

        {/* Camera Rig (replaces CameraController) */}
        <CameraRig
          viewMode={viewMode}
          defaultPosition={[0, 25, 35]}
          enableEntrance={true}
          enableAutoOrbit={true}
          enableShake={true}
        />

        {/* Cinematic Post-Processing Pipeline */}
        {enablePostProcessing && (
          <CinematicPipeline />
        )}
      </Canvas>

      {/* Loading/Error Overlay */}
      {(isLoading || error) && (
        <div className="absolute inset-0 flex h-full w-full items-center justify-center min-h-[50vh] bg-cosmic-black/80 z-20">
          <div className="text-center space-y-4">
            {error ? (
              <div className="text-red-400 p-4 border border-red-500/20 rounded bg-red-500/10">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs hover:underline mt-2"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <>
                <div className="h-px w-32 bg-linear-to-r from-transparent via-plasma-cyan to-transparent mx-auto animate-pulse" />
                <p className="text-sm font-mono text-text-secondary tracking-widest uppercase flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing Telemetry...
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="glass px-3 py-2 rounded-lg border border-white/10">
          <h4 className="text-xs font-bold font-display text-white">
            Live System Monitor
          </h4>
          <p className="text-[10px] text-white/50 font-mono mt-1">
            Tracking {neos.length} Objects • {viewMode} Mode
          </p>
        </div>
      </div>

      {/* Legend */}
      {showDangerZones && (
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="glass px-3 py-2 rounded-lg border border-white/10 space-y-1.5">
            <p className="text-[9px] font-bold text-white/70 uppercase tracking-wider mb-1">Legend</p>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.6)]" />
              <span className="text-white/60">🌍 Earth</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rotate-45 bg-stone-400" />
              <span className="text-white/60">◆ Asteroid (Safe)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rotate-45 bg-danger-red animate-pulse" />
              <span className="text-white/60">◆ Asteroid (Hazardous)</span>
            </div>
            <div className="h-px w-full bg-white/10 my-1" />
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-safe-green" />
              <span className="text-white/50">1 LD Safe Zone</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-warning-amber" />
              <span className="text-white/50">Close Approach</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-danger-red" />
              <span className="text-white/50">Critical Zone</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// }}}
