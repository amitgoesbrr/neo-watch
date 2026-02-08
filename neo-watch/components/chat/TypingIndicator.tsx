"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

// {{{ Typing Indicator Props
interface TypingIndicatorProps {
  userName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}
// }}}

// {{{ Typing Indicator Component
export function TypingIndicator({
  userName,
  className,
  size = "md",
}: TypingIndicatorProps) {
  const sizeClasses = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-2 text-text-muted text-sm",
        className
      )}
    >
      {/* Dots container */}
      <div
        className={clsx(
          "flex items-center px-3 py-2 rounded-full glass border border-glass-border",
          sizeClasses[size]
        )}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ y: 0, opacity: 0.4 }}
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.6, 1],
            }}
            className={clsx(
              "rounded-full bg-stellar-blue",
              dotSizes[size]
            )}
          />
        ))}
      </div>

      {/* Optional user name */}
      {userName && (
        <span className="text-xs">
          <span className="font-medium text-text-secondary">{userName}</span>
          {" is typing..."}
        </span>
      )}
    </div>
  );
}
// }}}

// {{{ Multiple Users Typing Component
interface MultipleTypingProps {
  users: string[];
  className?: string;
}

export function MultipleTypingIndicator({
  users,
  className,
}: MultipleTypingProps) {
  if (users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users.length} people are typing...`;
    }
  };

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <TypingIndicator size="sm" />
      <span className="text-xs text-text-muted">{getText()}</span>
    </div>
  );
}
// }}}

// {{{ Inline Typing Indicator (For message bubbles)
export function InlineTypingIndicator({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-0.5", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: [0.4, 0, 0.6, 1],
          }}
          className="w-1 h-1 rounded-full bg-current"
        />
      ))}
    </span>
  );
}
// }}}
