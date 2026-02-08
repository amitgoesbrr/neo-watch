/**
 * Quality Store
 * Zustand store for managing rendering quality state across all 3D components
 */

import { create } from "zustand";
import {
  type QualityTier,
  type QualitySettings,
  QUALITY_TIERS,
  TIER_ORDER,
} from "./QualityPresets";

interface QualityState {
  /** Current quality tier */
  tier: QualityTier;
  /** Current resolved settings */
  settings: QualitySettings;
  /** Whether user has manually overridden auto detection */
  isManualOverride: boolean;
  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
  /** View mode: realistic or holographic */
  viewMode: "realistic" | "holographic";
  /** Simulation time offset (for time scrubbing) */
  simulationTimeOffset: number;
  /** Simulation speed multiplier */
  simulationSpeed: number;
  /** Currently selected asteroid ID */
  selectedAsteroidId: string | null;
  /** Whether camera is in cinematic entrance */
  isCinematicEntrance: boolean;

  // Actions
  setTier: (tier: QualityTier) => void;
  upgradeTier: () => void;
  downgradeTier: () => void;
  setManualOverride: (manual: boolean) => void;
  setViewMode: (mode: "realistic" | "holographic") => void;
  toggleViewMode: () => void;
  setSimulationTimeOffset: (offset: number) => void;
  setSimulationSpeed: (speed: number) => void;
  selectAsteroid: (id: string | null) => void;
  setCinematicEntrance: (active: boolean) => void;
  initialize: () => void;
}

const STORAGE_KEY = "neo-watch-quality-tier";

function loadPersistedTier(): QualityTier | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && TIER_ORDER.includes(stored as QualityTier)) {
      return stored as QualityTier;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

function persistTier(tier: QualityTier) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, tier);
  } catch {
    // localStorage not available
  }
}

function detectReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useQualityStore = create<QualityState>((set, get) => ({
  tier: "medium",
  settings: QUALITY_TIERS.medium,
  isManualOverride: false,
  prefersReducedMotion: false,
  viewMode: "realistic",
  simulationTimeOffset: 0,
  simulationSpeed: 1,
  selectedAsteroidId: null,
  isCinematicEntrance: true,

  setTier: (tier) => {
    set({ tier, settings: QUALITY_TIERS[tier] });
    if (get().isManualOverride) {
      persistTier(tier);
    }
  },

  upgradeTier: () => {
    const { tier, isManualOverride } = get();
    if (isManualOverride) return;
    const currentIndex = TIER_ORDER.indexOf(tier);
    if (currentIndex < TIER_ORDER.length - 1) {
      const newTier = TIER_ORDER[currentIndex + 1];
      set({ tier: newTier, settings: QUALITY_TIERS[newTier] });
    }
  },

  downgradeTier: () => {
    const { tier, isManualOverride } = get();
    if (isManualOverride) return;
    const currentIndex = TIER_ORDER.indexOf(tier);
    if (currentIndex > 0) {
      const newTier = TIER_ORDER[currentIndex - 1];
      set({ tier: newTier, settings: QUALITY_TIERS[newTier] });
    }
  },

  setManualOverride: (manual) => {
    set({ isManualOverride: manual });
    if (manual) {
      persistTier(get().tier);
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleViewMode: () =>
    set((state) => ({
      viewMode: state.viewMode === "realistic" ? "holographic" : "realistic",
    })),

  setSimulationTimeOffset: (offset) => set({ simulationTimeOffset: offset }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  selectAsteroid: (id) => set({ selectedAsteroidId: id }),
  setCinematicEntrance: (active) => set({ isCinematicEntrance: active }),

  initialize: () => {
    const persisted = loadPersistedTier();
    const reducedMotion = detectReducedMotion();

    if (persisted) {
      set({
        tier: persisted,
        settings: QUALITY_TIERS[persisted],
        isManualOverride: true,
        prefersReducedMotion: reducedMotion,
      });
    } else {
      // Auto-detect: start at medium, let PerformanceMonitor adjust
      set({
        tier: "medium",
        settings: QUALITY_TIERS.medium,
        prefersReducedMotion: reducedMotion,
      });
    }
  },
}));
