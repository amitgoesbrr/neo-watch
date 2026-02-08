// 3D Components barrel export

// ── Legacy Scene Elements (still used by components that import directly) ──
export { 
  EnhancedSun, 
  EarthWithAtmosphere, 
  DangerZoneRings, 
  OrbitPath, 
  AnimatedGrid,
  coronaVertexShader,
  coronaFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader
} from "./SceneElements";

// Legacy Post-Processing (kept for backward compat)
export { ScenePostProcessing, LightPostProcessing } from "./PostProcessing";

// Interactive Components
export { InteractiveAsteroid, InteractiveAsteroidGroup } from "./InteractiveAsteroid";

// Hero Scene
export { default as HeroScene } from "./HeroScene";

// Performance Components
export { InstancedAsteroids } from "./InstancedAsteroids";
export { LODAsteroid, LODAsteroidGroup } from "./LODAsteroid";

// Impact & Risk Visualization
export { 
  ImpactCorridor, 
  RiskZone, 
  ApproachVector, 
  CloseApproachMarker 
} from "./ImpactCorridor";

// Keplerian Orbits
export { 
  KeplerianOrbit, 
  EarthOrbit, 
  MultiOrbitDisplay, 
  OrbitalNodeMarkers,
  ApsisMarkers
} from "./KeplerianOrbit";

// ── New Professional 3D Pipeline ──

// Quality System
export { QualityManager, useQuality } from "./systems/QualityManager";
export { useQualityStore } from "./systems/QualityStore";
export type { QualityTier, QualitySettings } from "./systems/QualityPresets";

// Celestial Bodies
export { VolumetricSun } from "./celestial/VolumetricSun";
export { PhotorealisticEarth } from "./celestial/PhotorealisticEarth";

// Environment
export { DeepSpaceSkybox } from "./environment/DeepSpaceSkybox";

// Particles
export { GPUParticles, CosmicDust } from "./particles/GPUParticles";

// Camera
export { CameraRig } from "./camera/CameraRig";

// Materials
export { HolographicMaterial, ShieldMaterial } from "./materials/HolographicMaterial";

// Post-Processing Pipeline
export { CinematicPipeline, LightPipeline } from "./postprocessing/CinematicPipeline";
