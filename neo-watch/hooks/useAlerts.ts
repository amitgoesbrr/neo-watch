"use client";

import { useState, useEffect, useCallback } from "react";
import { alertsApi, type Alert } from "@/lib/api";

interface UseAlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage user alerts
 */
export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await alertsApi.getAll();

      if (res.success && res.data) {
        setAlerts(res.data.alerts);
      } else {
        setError(res.error || "Failed to fetch alerts");
        setAlerts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch alerts");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    const prevAlerts = [...alerts];
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)));

    try {
      const res = await alertsApi.markAsRead(id);
      if (!res.success) {
        setAlerts(prevAlerts);
      }
    } catch {
      setAlerts(prevAlerts);
    }
  }, [alerts]);

  const markAllAsRead = useCallback(async () => {
    const prevAlerts = [...alerts];
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));

    try {
      const res = await alertsApi.markAllAsRead();
      if (!res.success) {
        setAlerts(prevAlerts);
      }
    } catch {
      setAlerts(prevAlerts);
    }
  }, [alerts]);

  const deleteAlert = useCallback(async (id: string) => {
    const prevAlerts = [...alerts];
    setAlerts(alerts.filter((a) => a.id !== id));

    try {
      const res = await alertsApi.delete(id);
      if (!res.success) {
        setAlerts(prevAlerts);
      }
    } catch {
      setAlerts(prevAlerts);
    }
  }, [alerts]);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return {
    alerts,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    refetch: fetchAlerts,
  };
}

export default useAlerts;
