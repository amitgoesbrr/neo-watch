"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  Radar,
  Terminal,
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { Alert } from "@/lib/api";

// {{{ Alert Icon Component
interface AlertIconProps {
  type: Alert["type"];
  size?: "sm" | "md" | "lg";
}

export function AlertIcon({ type, size = "md" }: AlertIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const baseClass = `${sizeClasses[size]} rounded-full flex items-center justify-center`;

  switch (type) {
    case "close_approach":
      return (
        <div className={`${baseClass} bg-warning-amber/20 border border-warning-amber/30 text-warning-amber shadow-[0_0_15px_rgba(245,158,11,0.2)]`}>
          <Radar className={iconSizeClasses[size]} />
        </div>
      );
    case "hazard_update":
      return (
        <div className={`${baseClass} bg-danger-red/20 border border-danger-red/30 text-danger-red shadow-[0_0_15px_rgba(239,68,68,0.2)]`}>
          <AlertTriangle className={iconSizeClasses[size]} />
        </div>
      );
    case "watchlist_update":
      return (
        <div className={`${baseClass} bg-stellar-blue/20 border border-stellar-blue/30 text-stellar-blue shadow-[0_0_15px_rgba(56,189,248,0.2)]`}>
          <Bell className={iconSizeClasses[size]} />
        </div>
      );
    case "system":
      return (
        <div className={`${baseClass} bg-nebula-purple/20 border border-nebula-purple/30 text-nebula-purple shadow-[0_0_15px_rgba(168,85,247,0.2)]`}>
          <Terminal className={iconSizeClasses[size]} />
        </div>
      );
    default:
      return (
        <div className={`${baseClass} bg-white/10 border border-white/20 text-white/60`}>
          <Info className={iconSizeClasses[size]} />
        </div>
      );
  }
}
// }}}

// {{{ Alert Card Component
interface AlertCardProps {
  alert: Alert;
  index?: number;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function AlertCard({
  alert,
  index = 0,
  onMarkRead,
  onDelete,
  compact = false,
}: AlertCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <div
        className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
          !alert.isRead
            ? "bg-void-dark/60 border-plasma-cyan/30 shadow-[0_0_20px_rgba(14,165,233,0.05)]"
            : "bg-void-dark/30 border-white/5 opacity-80 hover:opacity-100 hover:border-white/10"
        }`}
      >
        {/* Unread Indicator Strip */}
        {!alert.isRead && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-plasma-cyan to-nebula-purple" />
        )}

        <div className={`${compact ? "p-3" : "p-4 sm:p-5"} flex gap-4 md:gap-6 items-start`}>
          <div className="shrink-0 mt-1">
            <AlertIcon type={alert.type} size={compact ? "sm" : "md"} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {!alert.isRead && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-plasma-cyan/20 text-plasma-cyan border border-plasma-cyan/20">
                      New
                    </span>
                  )}
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <h4
                  className={`${compact ? "text-sm" : "text-base md:text-lg"} font-bold font-display ${
                    !alert.isRead ? "text-white" : "text-text-secondary"
                  }`}
                >
                  {alert.title}
                </h4>
              </div>

              {/* Actions */}
              {(onMarkRead || onDelete) && (
                <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity self-end md:self-start">
                  {!alert.isRead && onMarkRead && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="p-2 rounded-lg bg-safe-green/10 text-safe-green hover:bg-safe-green/20 border border-safe-green/20 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(alert.id)}
                      className="p-2 rounded-lg bg-danger-red/10 text-danger-red hover:bg-danger-red/20 border border-danger-red/20 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {!compact && (
              <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                {alert.message}
              </p>
            )}

            {/* Link to asteroid if available */}
            {alert.asteroidId && !compact && (
              <Link
                href={`/asteroids/${alert.asteroidId}`}
                className="inline-flex items-center gap-1 mt-3 text-xs text-nebula-purple hover:text-stellar-blue transition-colors font-mono uppercase tracking-wider"
              >
                View Object <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
// }}}

export default AlertCard;
