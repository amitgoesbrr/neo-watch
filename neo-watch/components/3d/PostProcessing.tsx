"use client";

/**
 * Post-processing effects for 3D scenes
 * Adds bloom, vignette, and noise for cinematic look
 */

import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";

interface PostProcessingProps {
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  vignetteOffset?: number;
  vignetteDarkness?: number;
  noiseOpacity?: number;
  enabled?: boolean;
}

export function ScenePostProcessing({
  bloomIntensity = 0.6,
  bloomThreshold = 0.3,
  bloomSmoothing = 0.9,
  vignetteOffset = 0.3,
  vignetteDarkness = 0.5,
  noiseOpacity = 0.015,
  enabled = true
}: PostProcessingProps) {
  if (!enabled) return null;
  
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      <Vignette
        eskil={false}
        offset={vignetteOffset}
        darkness={vignetteDarkness}
      />
      <Noise
        opacity={noiseOpacity}
      />
    </EffectComposer>
  );
}

// Lighter version for performance-sensitive scenes
export function LightPostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}

export default ScenePostProcessing;
