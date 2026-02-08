"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

// {{{ Card Props
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}
// }}}

// {{{ Card Component
function Card({ children, className, hover = true, glow = false }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-glass-bg backdrop-blur-xl border border-glass-border rounded-xl p-6",
        hover &&
          "transition-all duration-300 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(107,33,168,0.15)]",
        glow && "shadow-[0_0_20px_rgba(14,165,233,0.15)]",
        className
      )}
    >
      {children}
    </div>
  );
}
// }}}

// {{{ Card Header
function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mb-4 pb-4 border-b border-glass-border", className)}>
      {children}
    </div>
  );
}
// }}}

// {{{ Card Title
function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={clsx(
        "text-lg font-semibold text-text-primary font-display",
        className
      )}
    >
      {children}
    </h3>
  );
}
// }}}

// {{{ Card Content
function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={clsx(className)}>{children}</div>;
}
// }}}

export { Card, CardHeader, CardTitle, CardContent };
