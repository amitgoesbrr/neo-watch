"use client";

import { clsx } from "clsx";
import type { RiskLevel } from "@/lib/api";

// {{{ Risk Badge Props
interface RiskBadgeProps {
  level: RiskLevel;
  showScore?: boolean;
  score?: number;
  size?: "sm" | "md" | "lg";
}
// }}}

// {{{ Risk Level Config
const riskConfig: Record<
  RiskLevel,
  { bg: string; text: string; glow: string }
> = {
  MINIMAL: {
    bg: "bg-gradient-to-r from-safe-green to-green-600",
    text: "MINIMAL",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.4)]",
  },
  LOW: {
    bg: "bg-gradient-to-r from-stellar-blue to-blue-600",
    text: "LOW",
    glow: "shadow-[0_0_15px_rgba(14,165,233,0.4)]",
  },
  MODERATE: {
    bg: "bg-gradient-to-r from-warning-amber to-amber-600",
    text: "MODERATE",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.4)]",
  },
  HIGH: {
    bg: "bg-gradient-to-r from-orange-500 to-orange-600",
    text: "HIGH",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.4)]",
  },
  CRITICAL: {
    bg: "bg-gradient-to-r from-danger-red to-red-600",
    text: "CRITICAL",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
  },
};
// }}}

// {{{ Risk Badge Component
function RiskBadge({
  level,
  showScore = false,
  score,
  size = "md",
}: RiskBadgeProps) {
  const config = riskConfig[level];

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-semibold text-white rounded-full",
        config.bg,
        config.glow,
        sizes[size]
      )}
    >
      {config.text}
      {showScore && score !== undefined && (
        <span className="opacity-80">({score})</span>
      )}
    </span>
  );
}
// }}}

export { RiskBadge };
