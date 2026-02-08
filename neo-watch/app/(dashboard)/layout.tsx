"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Loader2,
} from "lucide-react";
// Removed unused useSearchParams, usePathname
import { Sidebar } from "@/components/layout/Sidebar";

import { useAuth } from "@/context/AuthContext";

// {{{ Header Component
function Header({
  onMenuClick,
  unreadAlerts = 0,
}: {
  onMenuClick: () => void;
  unreadAlerts?: number;
}) {
  const { replace } = useRouter();
  const { user } = useAuth();

  function handleSearch(term: string) {
    // Redirect to asteroids page with search query for actual search functionality
    if (term.trim()) {
      replace(`/asteroids?q=${encodeURIComponent(term)}`);
    }
  }

  // Get initials
  const initials = user?.name 
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "OP";

  return (
    <header className="h-20 flex items-center justify-between px-8 glass border-b border-white/10 sticky top-0 z-30 shrink-0 bg-void-dark/80 backdrop-blur-md">
      <h1 className="text-2xl font-bold tracking-tight font-display hidden md:block">Mission Control</h1>
      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative hidden md:block pointer-events-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
          <input
            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-nebula-purple focus:border-nebula-purple transition-all text-xs text-white placeholder:text-white/20"
            placeholder="Search Deep Space... (Press Enter)"
            type="text"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/alerts" className="relative p-2 rounded-lg hover:bg-white/5 transition-all group">
            <Bell className="w-6 h-6 text-white/60 group-hover:text-nebula-purple transition-all" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-nebula-purple rounded-full glow-purple"></span>
            )}
          </Link>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          <Link href="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.name || "Officer"}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none font-mono">Senior Analyst</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-nebula-purple/40 p-0.5">
              <div className="w-full h-full rounded-full bg-linear-to-br from-nebula-purple to-stellar-blue flex items-center justify-center text-sm font-bold">
                 {initials}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
// }}}

// {{{ Loading Screen Component
function LoadingScreen() {
  return (
    <div className="h-screen w-full bg-cosmic-black flex items-center justify-center">
      <div className="nebula-bg z-0" />
      <div className="starfield z-0" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-t-2 border-plasma-cyan rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-nebula-purple rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white/40 animate-pulse" />
          </div>
        </div>
        <p className="text-text-secondary font-mono text-sm tracking-widest uppercase animate-pulse">
          Authenticating...
        </p>
      </div>
    </div>
  );
}
// }}}

// {{{ Dashboard Layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Prevent flash of content before redirect
  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full bg-cosmic-black text-text-primary font-body flex overflow-hidden relative">
      {/* Background Layers */}
      <div className="nebula-bg z-0" />
      <div className="starfield z-0" />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          unreadAlerts={3}
        />
        <main className="flex-1 overflow-y-auto w-full scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
// }}}

