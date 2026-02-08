"use client";

import { clsx } from "clsx";

// {{{ Skeleton Types
interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "text" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}
// }}}

// {{{ Base Skeleton Component
export function Skeleton({
  className,
  variant = "default",
  width,
  height,
  lines = 1,
  animate = true,
}: SkeletonProps) {
  const baseStyles = clsx(
    "bg-gradient-to-r from-glass-bg via-void-dark to-glass-bg bg-[length:200%_100%]",
    animate && "animate-[shimmer_1.5s_infinite]",
    "rounded-lg"
  );

  const variantStyles = {
    default: "",
    circular: "!rounded-full aspect-square",
    text: "h-4 rounded",
    card: "rounded-xl",
  };

  const style = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={clsx("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(baseStyles, variantStyles.text)}
            style={{
              ...style,
              width: i === lines - 1 ? "75%" : style.width || "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  );
}
// }}}

// {{{ Skeleton Card Component
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "glass rounded-xl p-4 border border-glass-border space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <Skeleton height={32} width={80} className="rounded-lg" />
        <Skeleton height={32} width={80} className="rounded-lg" />
      </div>
    </div>
  );
}
// }}}

// {{{ Skeleton Avatar Component
export function SkeletonAvatar({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}
// }}}

// {{{ Skeleton Table Component
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={clsx("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-glass-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={16} className="flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              height={14}
              className="flex-1"
              animate={true}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
// }}}

// {{{ Skeleton Stat Card Component
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "glass rounded-xl p-6 border border-glass-border",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton height={20} width={60} />
      </div>
      <Skeleton height={32} width="50%" className="mb-2" />
      <Skeleton height={14} width="70%" />
    </div>
  );
}
// }}}

// {{{ Add shimmer animation to globals.css if not present
// Add this to your globals.css:
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
// }}}
