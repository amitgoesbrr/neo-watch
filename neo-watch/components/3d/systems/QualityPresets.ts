/**
 * Quality Tier Presets
 * Defines rendering quality levels for adaptive performance scaling
 */

export type QualityTier = "ultra" | "high" | "medium" | "low";

export interface QualitySettings {
  /** Shadow map resolution (0 = disabled) */
  shadowMapSize: number;
  /** Use mipmap blur for bloom (higher quality, more expensive) */
  bloomMipmapBlur: boolean;
  /** Bloom intensity multiplier */
  bloomIntensity: number;
  /** Maximum GPU particles */
  maxParticles: number;
  /** Dodecahedron detail level for asteroids */
  asteroidSegments: number;
  /** Which post-processing effects to enable */
  postProcessing: readonly string[];
  /** Number of stars in the skybox */
  starCount: number;
  /** Enable trail effects on orbiting bodies */
  enableTrails: boolean;
  /** Enable volumetric effects (god rays etc.) */
  enableVolumetrics: boolean;
  /** Enable SSAO */
  enableSSAO: boolean;
  /** Enable chromatic aberration */
  enableChromaticAberration: boolean;
  /** Earth texture resolution suffix */
  earthTextureSize: "2k" | "4k" | "8k";
  /** Skybox nebula noise octaves */
  nebulaOctaves: number;
  /** Enable cloud layer on Earth */
  enableClouds: boolean;
  /** Enable night lights on Earth */
  enableNightLights: boolean;
}

export const QUALITY_TIERS: Record<QualityTier, QualitySettings> = {
  ultra: {
    shadowMapSize: 2048,
    bloomMipmapBlur: true,
    bloomIntensity: 0.6,
    maxParticles: 15000,
    asteroidSegments: 3,
    postProcessing: [
      "bloom",
      "godrays",
      "chromaticAberration",
      "vignette",
      "ssao",
    ],
    starCount: 5000,
    enableTrails: true,
    enableVolumetrics: true,
    enableSSAO: true,
    enableChromaticAberration: true,
    earthTextureSize: "8k",
    nebulaOctaves: 4,
    enableClouds: true,
    enableNightLights: true,
  },
  high: {
    shadowMapSize: 1024,
    bloomMipmapBlur: true,
    bloomIntensity: 0.5,
    maxParticles: 8000,
    asteroidSegments: 2,
    postProcessing: ["bloom", "vignette"],
    starCount: 3000,
    enableTrails: true,
    enableVolumetrics: false,
    enableSSAO: false,
    enableChromaticAberration: false,
    earthTextureSize: "4k",
    nebulaOctaves: 3,
    enableClouds: true,
    enableNightLights: true,
  },
  medium: {
    shadowMapSize: 512,
    bloomMipmapBlur: false,
    bloomIntensity: 0.4,
    maxParticles: 3000,
    asteroidSegments: 1,
    postProcessing: ["bloom"],
    starCount: 2000,
    enableTrails: false,
    enableVolumetrics: false,
    enableSSAO: false,
    enableChromaticAberration: false,
    earthTextureSize: "2k",
    nebulaOctaves: 2,
    enableClouds: false,
    enableNightLights: true,
  },
  low: {
    shadowMapSize: 0,
    bloomMipmapBlur: false,
    bloomIntensity: 0.2,
    maxParticles: 500,
    asteroidSegments: 0,
    postProcessing: [],
    starCount: 1000,
    enableTrails: false,
    enableVolumetrics: false,
    enableSSAO: false,
    enableChromaticAberration: false,
    earthTextureSize: "2k",
    nebulaOctaves: 1,
    enableClouds: false,
    enableNightLights: false,
  },
} as const;

/** FPS thresholds for automatic tier switching */
export const FPS_THRESHOLDS = {
  /** Below this FPS, downgrade quality */
  downgrade: 35,
  /** Above this FPS for sustained period, upgrade quality */
  upgrade: 55,
  /** Duration (seconds) of sustained FPS before tier change */
  stabilityWindow: 3,
} as const;

/** Order of tiers from lowest to highest */
export const TIER_ORDER: QualityTier[] = ["low", "medium", "high", "ultra"];
