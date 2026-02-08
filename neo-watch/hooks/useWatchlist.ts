"use client";

import { useState, useEffect, useCallback } from "react";
import { userApi, type WatchlistItem } from "@/lib/api";

interface UseWatchlistReturn {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
  addToWatchlist: (asteroidId: string, data?: { nickname?: string; notes?: string; alertEnabled?: boolean }) => Promise<boolean>;
  removeFromWatchlist: (asteroidId: string) => Promise<boolean>;
  updateItem: (asteroidId: string, data: { nickname?: string; notes?: string; alertEnabled?: boolean }) => Promise<boolean>;
  isWatching: (asteroidId: string) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage user's asteroid watchlist
 */
export function useWatchlist(): UseWatchlistReturn {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await userApi.getWatchlist();

      if (res.success && res.data) {
        setItems(res.data.items);
      } else {
        setError(res.error || "Failed to fetch watchlist");
        setItems([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch watchlist");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(async (
    asteroidId: string,
    data?: { nickname?: string; notes?: string; alertEnabled?: boolean }
  ): Promise<boolean> => {
    try {
      const res = await userApi.addToWatchlist({
        asteroidId,
        ...data,
      });
      if (res.success) {
        await fetchWatchlist();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (asteroidId: string): Promise<boolean> => {
    // Optimistic update
    const prevItems = [...items];
    setItems(items.filter((item) => item.asteroidId !== asteroidId));

    try {
      const res = await userApi.removeFromWatchlist(asteroidId);
      if (!res.success) {
        setItems(prevItems);
        return false;
      }
      return true;
    } catch {
      setItems(prevItems);
      return false;
    }
  }, [items]);

  const updateItem = useCallback(async (
    asteroidId: string,
    data: { nickname?: string; notes?: string; alertEnabled?: boolean }
  ): Promise<boolean> => {
    try {
      const res = await userApi.updateWatchlistItem(asteroidId, data);
      if (res.success) {
        await fetchWatchlist();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchWatchlist]);

  const isWatching = useCallback((asteroidId: string): boolean => {
    return items.some((item) => item.asteroidId === asteroidId);
  }, [items]);

  return {
    items,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    updateItem,
    isWatching,
    refetch: fetchWatchlist,
  };
}

export default useWatchlist;
