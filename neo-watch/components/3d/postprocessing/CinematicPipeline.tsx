"use client";

/**
 * Cinematic Post-Processing Pipeline
 * Quality-tier-aware effect chain with bloom
 */

import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { useQuality } from "../systems/QualityManager";

interface CinematicPipelineProps {
  /** Override enable state */
  enabled?: boolean;
  /** Override bloom intensity */
  bloomIntensity?: number;
}

export function CinematicPipeline({
  enabled = true,
  bloomIntensity,
}: CinematicPipelineProps) {
  const { settings, tier } = useQuality();

  if (!enabled || tier === "low") {
    return null;
  }

  const finalBloomIntensity = bloomIntensity ?? settings.bloomIntensity;

  // Ultra/High tier: bloom + vignette
  if (tier === "ultra" || tier === "high") {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={finalBloomIntensity}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.3} darkness={tier === "ultra" ? 0.5 : 0.4} />
      </EffectComposer>
    );
  }

  // Medium tier: just bloom
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={finalBloomIntensity * 0.8}
        luminanceThreshold={0.5}
        luminanceSmoothing={0.9}
        mipmapBlur={false}
      />
    </EffectComposer>
  );
}

/**
 * Lightweight pipeline for performance-sensitive scenes (hero, etc.)
 * Just bloom + vignette, no quality store dependency
 */
export function LightPipeline() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.4}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.35} darkness={0.5} />
    </EffectComposer>
  );
}

export default CinematicPipeline;
