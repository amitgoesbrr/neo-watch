"use client";

/**
 * Keplerian Orbital Mechanics
 * Provides accurate orbital calculations based on real orbital elements
 */

import * as THREE from "three";

// {{{ Types
export interface OrbitalElements {
  semiMajorAxis: number;      // a - in AU
  eccentricity: number;       // e
  inclination: number;        // i - in radians
  longitudeOfAscendingNode: number;  // Ω - in radians
  argumentOfPerihelion: number;       // ω - in radians
  meanAnomaly: number;        // M - in radians
  period?: number;            // Orbital period in days
}

export interface CartesianPosition {
  x: number;
  y: number;
  z: number;
}
// }}}

// {{{ Constants
export const AU_TO_SCENE_SCALE = 10; // 1 AU = 10 scene units
export const EARTH_ORBIT_AU = 1.0;
export const LUNAR_DISTANCE_KM = 384400;
export const KM_TO_AU = 1 / 149597870.7;
// }}}

// {{{ Solve Kepler's Equation using Newton-Raphson method
export function solveKeplersEquation(
  meanAnomaly: number, 
  eccentricity: number, 
  tolerance: number = 1e-8,
  maxIterations: number = 50
): number {
  // For nearly circular orbits, mean anomaly is a good starting point
  let E = meanAnomaly;
  
  // For highly eccentric orbits, use a better initial guess
  if (eccentricity > 0.8) {
    E = Math.PI;
  }
  
  for (let i = 0; i < maxIterations; i++) {
    const f = E - eccentricity * Math.sin(E) - meanAnomaly;
    const fPrime = 1 - eccentricity * Math.cos(E);
    
    const delta = f / fPrime;
    E = E - delta;
    
    if (Math.abs(delta) < tolerance) {
      break;
    }
  }
  
  return E;
}
// }}}

// {{{ Calculate True Anomaly from Eccentric Anomaly
export function eccentricToTrueAnomaly(
  eccentricAnomaly: number, 
  eccentricity: number
): number {
  const cosE = Math.cos(eccentricAnomaly);
  const sinE = Math.sin(eccentricAnomaly);
  
  const cosV = (cosE - eccentricity) / (1 - eccentricity * cosE);
  const sinV = (Math.sqrt(1 - eccentricity * eccentricity) * sinE) / (1 - eccentricity * cosE);
  
  return Math.atan2(sinV, cosV);
}
// }}}

// {{{ Convert Orbital Elements to Cartesian Coordinates
export function keplerianToCartesian(
  elements: OrbitalElements,
  time: number = 0,
  scale: number = AU_TO_SCENE_SCALE
): THREE.Vector3 {
  const {
    semiMajorAxis: a,
    eccentricity: e,
    inclination: i,
    longitudeOfAscendingNode: omega,
    argumentOfPerihelion: w,
    meanAnomaly: M0,
    period = 365.25 // Default to 1 Earth year
  } = elements;
  
  // Calculate current mean anomaly (M0 + motion over time)
  // Mean motion n = 2π / period
  const n = (2 * Math.PI) / period;
  const M = M0 + n * time;
  
  // Solve Kepler's equation for Eccentric Anomaly
  const E = solveKeplersEquation(M, e);
  
  // Calculate True Anomaly
  const v = eccentricToTrueAnomaly(E, e);
  
  // Calculate distance from focus (heliocentric distance)
  const r = a * (1 - e * Math.cos(E));
  
  // Position in orbital plane
  const xOrbital = r * Math.cos(v);
  const yOrbital = r * Math.sin(v);
  
  // Rotation matrices to convert to ecliptic coordinates
  // First rotate by argument of perihelion (w)
  // Then rotate by inclination (i) around the line of nodes
  // Finally rotate by longitude of ascending node (Ω)
  
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosO = Math.cos(omega);
  const sinO = Math.sin(omega);
  
  // Combined rotation
  const x = scale * (
    xOrbital * (cosO * cosW - sinO * sinW * cosI) -
    yOrbital * (cosO * sinW + sinO * cosW * cosI)
  );
  
  const y = scale * (
    xOrbital * (sinO * cosW + cosO * sinW * cosI) -
    yOrbital * (sinO * sinW - cosO * cosW * cosI)
  );
  
  const z = scale * (
    xOrbital * sinW * sinI +
    yOrbital * cosW * sinI
  );
  
  // Three.js uses Y-up, so swap Y and Z
  return new THREE.Vector3(x, z, -y);
}
// }}}

// {{{ Generate Orbit Path Points
export function generateOrbitPath(
  elements: OrbitalElements,
  segments: number = 128,
  scale: number = AU_TO_SCENE_SCALE
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const period = elements.period || 365.25;
  
  for (let i = 0; i <= segments; i++) {
    const time = (i / segments) * period;
    const position = keplerianToCartesian(elements, time, scale);
    points.push(position);
  }
  
  return points;
}
// }}}

// {{{ Parse NASA Orbital Data to OrbitalElements
export function parseNasaOrbitalData(orbitalData: {
  semi_major_axis?: string;
  eccentricity?: string;
  inclination?: string;
  ascending_node_longitude?: string;
  perihelion_argument?: string;
  mean_anomaly?: string;
  orbital_period?: string;
}): OrbitalElements | null {
  if (!orbitalData.semi_major_axis || !orbitalData.eccentricity) {
    return null;
  }
  
  const degToRad = Math.PI / 180;
  
  return {
    semiMajorAxis: parseFloat(orbitalData.semi_major_axis),
    eccentricity: parseFloat(orbitalData.eccentricity),
    inclination: parseFloat(orbitalData.inclination || "0") * degToRad,
    longitudeOfAscendingNode: parseFloat(orbitalData.ascending_node_longitude || "0") * degToRad,
    argumentOfPerihelion: parseFloat(orbitalData.perihelion_argument || "0") * degToRad,
    meanAnomaly: parseFloat(orbitalData.mean_anomaly || "0") * degToRad,
    period: parseFloat(orbitalData.orbital_period || "365.25")
  };
}
// }}}

// {{{ Earth Orbital Elements (for reference)
export const EARTH_ORBITAL_ELEMENTS: OrbitalElements = {
  semiMajorAxis: 1.0,        // 1 AU
  eccentricity: 0.0167,      // Nearly circular
  inclination: 0,            // Reference plane
  longitudeOfAscendingNode: 0,
  argumentOfPerihelion: 1.796, // ~102.9°
  meanAnomaly: 0,
  period: 365.25
};
// }}}

// {{{ Calculate Close Approach Distance
export function calculateApproachDistance(
  asteroidElements: OrbitalElements,
  earthElements: OrbitalElements = EARTH_ORBITAL_ELEMENTS,
  time: number,
  scale: number = AU_TO_SCENE_SCALE
): number {
  const asteroidPos = keplerianToCartesian(asteroidElements, time, scale);
  const earthPos = keplerianToCartesian(earthElements, time, scale);
  
  return asteroidPos.distanceTo(earthPos);
}
// }}}

export default {
  keplerianToCartesian,
  generateOrbitPath,
  parseNasaOrbitalData,
  solveKeplersEquation,
  eccentricToTrueAnomaly,
  calculateApproachDistance,
  EARTH_ORBITAL_ELEMENTS,
  AU_TO_SCENE_SCALE
};
