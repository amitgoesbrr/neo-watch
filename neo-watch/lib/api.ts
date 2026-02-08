// {{{ API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
// }}}

// {{{ API Request Helper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: "Network error - please try again",
    };
  }
}
// }}}

// {{{ Auth API
export const authApi = {
  register: (email: string, password: string, name: string) =>
    apiRequest<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiRequest<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiRequest<{ user: User }>("/auth/me"),

  logout: () => apiRequest("/auth/logout", { method: "POST" }),

  refresh: () =>
    apiRequest<{ token: string }>("/auth/refresh", { method: "POST" }),
};
// }}}

// {{{ NEO API
export const neoApi = {
  getFeed: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<NeoFeedResponse>(`/neo/feed${query}`);
  },

  getStats: () => apiRequest<NeoStatsResponse>("/neo/stats"),

  browse: (page = 0, size = 20) =>
    apiRequest<NeoBrowseResponse>(`/neo/browse?page=${page}&size=${size}`),

  lookup: (id: string) => apiRequest<{ asteroid: NEO }>(`/neo/lookup/${id}`),
};
// }}}

// {{{ User API
export const userApi = {
  getProfile: () => apiRequest<{ user: User }>("/user/profile"),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiRequest<{ user: User }>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getWatchlist: () => apiRequest<WatchlistResponse>("/user/watchlist"),

  addToWatchlist: (data: {
    asteroidId: string;
    nickname?: string;
    notes?: string;
    alertEnabled?: boolean;
    alertThresholdKm?: number;
  }) =>
    apiRequest<{ item: WatchlistItem; asteroid: NEO }>("/user/watchlist", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateWatchlistItem: (
    asteroidId: string,
    data: {
      nickname?: string;
      notes?: string;
      alertEnabled?: boolean;
      alertThresholdKm?: number;
    }
  ) =>
    apiRequest<{ item: WatchlistItem }>(`/user/watchlist/${asteroidId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  removeFromWatchlist: (asteroidId: string) =>
    apiRequest(`/user/watchlist/${asteroidId}`, { method: "DELETE" }),
};
// }}}

// {{{ Alerts API
export const alertsApi = {
  getAll: (limit = 50) => apiRequest<AlertsResponse>(`/alerts?limit=${limit}`),

  getUnreadCount: () => apiRequest<{ unreadCount: number }>("/alerts/unread"),

  markAsRead: (id: string) =>
    apiRequest<{ alert: Alert }>(`/alerts/${id}/read`, { method: "PUT" }),

  markAllAsRead: () =>
    apiRequest<{ markedCount: number }>("/alerts/read-all", { method: "PUT" }),

  delete: (id: string) => apiRequest(`/alerts/${id}`, { method: "DELETE" }),

  updateSettings: (settings: { alertEnabled?: boolean; alertThresholdKm?: number }) =>
    apiRequest<{ updatedCount: number }>("/alerts/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
};
// }}}

// {{{ Chat API
export const chatApi = {
  getMessages: (asteroidId: string, limit = 50) =>
    apiRequest<{ asteroidId: string; count: number; messages: ChatMessage[] }>(
      `/chat/${asteroidId}/messages?limit=${limit}`
    ),

  sendMessage: (asteroidId: string, content: string) =>
    apiRequest<{ message: ChatMessage }>(`/chat/${asteroidId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};
// }}}

// {{{ Type Definitions
export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "researcher" | "admin";
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface NEO {
  id: string;
  name: string;
  nasaJplUrl: string;
  absoluteMagnitude: number;
  estimatedDiameter: {
    minKm: number;
    maxKm: number;
    minM: number;
    maxM: number;
  };
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  closeApproachData: CloseApproach[];
  orbitalData?: OrbitalData;
  riskScore: number;
  riskLevel: RiskLevel;
  riskAssessment: RiskAssessment;
}

export interface CloseApproach {
  date: string;
  dateFull: string;
  epochDate: number;
  velocity: {
    kmPerSecond: number;
    kmPerHour: number;
  };
  missDistance: {
    astronomical: number;
    lunar: number;
    kilometers: number;
  };
  orbitingBody: string;
}

export interface OrbitalData {
  orbitId: string;
  orbitDeterminationDate: string;
  eccentricity: string;
  inclination: string;
  semiMajorAxis: string;
}

export type RiskLevel = "MINIMAL" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: {
    hazardousScore: number;
    distanceScore: number;
    sizeScore: number;
    velocityScore: number;
  };
}

export interface WatchlistItem {
  id: string;
  userId: string;
  asteroidId: string;
  nickname: string | null;
  notes: string | null;
  alertEnabled: boolean;
  alertThresholdKm: number;
  createdAt: string;
  asteroid?: NEO;
}

export interface Alert {
  id: string;
  userId: string;
  asteroidId: string | null;
  type: "close_approach" | "hazard_update" | "watchlist_update" | "system";
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
}

// Response Types
export interface NeoFeedResponse {
  count: number;
  dateRange: { start: string; end: string };
  asteroids: NEO[];
}

export interface NeoStatsResponse {
  totalCount: number;
  hazardousCount: number;
  closestApproach: { asteroid: NEO; distanceKm: number };
  largestAsteroid: NEO;
  fastestAsteroid: NEO;
  riskDistribution: Record<RiskLevel, number>;
}

export interface NeoBrowseResponse {
  asteroids: NEO[];
  page: {
    size: number;
    total_elements: number;
    total_pages: number;
    number: number;
  };
}

export interface WatchlistResponse {
  count: number;
  items: WatchlistItem[];
}

export interface AlertsResponse {
  count: number;
  alerts: Alert[];
}
// }}}
