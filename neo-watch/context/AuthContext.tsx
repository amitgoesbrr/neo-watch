"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi, type User as ApiUser } from "@/lib/api";
import { useRouter } from "next/navigation";

// Extend or use User type
export type User = ApiUser;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");
      if (!token) {
         setLoading(false);
         return;
      }
      
      try {
         // Verify token is valid by fetching /me
         const res = await authApi.me();
         if (res.success && res.data) {
            setUser(res.data.user);
         } else {
            // Token invalid or expired
            localStorage.removeItem("token");
            setUser(null);
         }
      } catch (error) {
         console.error("Auth check failed:", error);
         localStorage.removeItem("token");
         setUser(null);
      } finally {
         setLoading(false);
      }
    }

    checkAuth();
  }, []);

  function login(token: string, newUser: User) {
     localStorage.setItem("token", token);
     setUser(newUser);
  }

  function logout() {
     localStorage.removeItem("token");
     setUser(null);
     router.push("/login");
  }
  
  async function refreshProfile() {
      try {
          const res = await authApi.me();
          if (res.success && res.data) setUser(res.data.user);
      } catch (error) {
          console.error("Failed to refresh profile:", error);
      }
  }

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading, 
        isAuthenticated: !!user,
        login: (token, u) => login(token, u), // Ensure stable reference or binding 
        logout, 
        refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
   const context = useContext(AuthContext);
   if (!context) throw new Error("useAuth must be used within AuthProvider");
   return context;
}
