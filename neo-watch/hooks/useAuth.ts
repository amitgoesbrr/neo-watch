"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

/**
 * Hook to access authentication state and actions
 * Wrapper around AuthContext for convenience
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default useAuth;
