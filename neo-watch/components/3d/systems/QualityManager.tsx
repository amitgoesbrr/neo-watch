"use client";

/**
 * Quality Manager
 * Integrates drei/PerformanceMonitor with the QualityStore
 * Drop this component inside any <Canvas> to enable adaptive quality
 */

import { PerformanceMonitor } from "@react-three/drei";
import { useEffect } from "react";
import { useQualityStore } from "./QualityStore";

export function QualityManager() {
  const { upgradeTier, downgradeTier, initialize, tier } = useQualityStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <PerformanceMonitor
      onIncline={() => {
        upgradeTier();
      }}
      onDecline={() => {
        downgradeTier();
      }}
      flipflops={3}  // After 3 flip-flops, stop trying to upgrade
      onFallback={() => {
        // If we keep bouncing, lock to current tier
        useQualityStore.getState().setManualOverride(true);
      }}
    />
  );
}

/**
 * Hook to get current quality settings
 * Use this in any 3D component to read quality-dependent parameters
 */
export function useQuality() {
  const settings = useQualityStore((s) => s.settings);
  const tier = useQualityStore((s) => s.tier);
  const viewMode = useQualityStore((s) => s.viewMode);
  const prefersReducedMotion = useQualityStore((s) => s.prefersReducedMotion);
  return { settings, tier, viewMode, prefersReducedMotion };
}

export default QualityManager;
