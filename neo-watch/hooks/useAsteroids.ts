"use client";

import { useState, useEffect, useCallback } from "react";
import { neoApi, type NEO } from "@/lib/api";

interface UseAsteroidsOptions {
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

interface UseAsteroidsReturn {
  asteroids: NEO[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    hazardous: number;
    closest: NEO | null;
  };
  refetch: () => Promise<void>;
  fetchByDateRange: (start: string, end: string) => Promise<void>;
}

/**
 * Hook to fetch and manage asteroid data
 */
export function useAsteroids(options: UseAsteroidsOptions = {}): UseAsteroidsReturn {
  const { startDate, endDate, autoFetch = true } = options;

  const [asteroids, setAsteroids] = useState<NEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsteroids = useCallback(async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await neoApi.getFeed(start, end);

      if (res.success && res.data) {
        setAsteroids(res.data.asteroids);
      } else {
        setError(res.error || "Failed to fetch asteroids");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch asteroids");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchAsteroids(startDate, endDate);
    }
  }, [autoFetch, startDate, endDate, fetchAsteroids]);

  const refetch = useCallback(() => fetchAsteroids(startDate, endDate), [fetchAsteroids, startDate, endDate]);

  const fetchByDateRange = useCallback(
    (start: string, end: string) => fetchAsteroids(start, end),
    [fetchAsteroids]
  );

  // Calculate stats
  const stats = {
    total: asteroids.length,
    hazardous: asteroids.filter((a) => a.isPotentiallyHazardous).length,
    closest: asteroids.length > 0
      ? asteroids.reduce((closest, current) => {
          const closestDist = closest.closeApproachData[0]?.missDistance.kilometers || Infinity;
          const currentDist = current.closeApproachData[0]?.missDistance.kilometers || Infinity;
          return currentDist < closestDist ? current : closest;
        })
      : null,
  };

  return {
    asteroids,
    loading,
    error,
    stats,
    refetch,
    fetchByDateRange,
  };
}

export default useAsteroids;
