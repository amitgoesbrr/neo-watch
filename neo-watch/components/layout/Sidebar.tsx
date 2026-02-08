"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Rocket,
  Star,
  Bell,
  Settings,
  MessageCircle,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// {{{ Navigation Items
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/asteroids", label: "Asteroids", icon: Rocket },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/chat", label: "Comms", icon: MessageCircle },
];
// }}}

// {{{ Sidebar Component
export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "w-64 flex flex-col border-r border-white/10 shrink-0 h-screen transition-all duration-300 fixed lg:static z-50",
          "bg-[#1a1220]/95 backdrop-blur-xl lg:bg-[#1a1220]/60 lg:backdrop-blur-xl", // Mobile: High opacity, Desktop: Standard glass
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-nebula-purple to-stellar-blue rounded-lg flex items-center justify-center shadow-lg shadow-nebula-purple/20">
            <Rocket className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/60 font-display">
            NEO-WATCH
          </span>
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                  isActive
                    ? "bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={clsx("w-6 h-6", isActive ? "fill-current" : "")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Settings link */}
           <Link
             href="/settings"
             onClick={onClose}
             className={clsx(
               "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
               pathname === "/settings"
                 ? "bg-nebula-purple/20 text-nebula-purple border border-nebula-purple/30"
                 : "text-white/60 hover:text-white hover:bg-white/5"
             )}
           >
             <Settings className="w-6 h-6" />
             <span className="font-medium">Settings</span>
           </Link>
        </nav>

        {user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-nebula-purple/20 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/70">{user.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{user.name}</p>
                <p className="text-[10px] text-white/30 font-mono truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); onClose(); }}
              className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full text-white/60 hover:text-danger-red hover:bg-danger-red/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
// }}}
