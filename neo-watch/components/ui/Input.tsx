"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

// {{{ Input Props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
// }}}

// {{{ Input Component
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={clsx(
              "w-full bg-glass-bg border border-glass-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted transition-all duration-200",
              "focus:outline-none focus:border-stellar-blue focus:shadow-[0_0_10px_rgba(14,165,233,0.2)]",
              icon && "pl-10",
              error && "border-danger-red focus:border-danger-red",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-danger-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
// }}}

export { Input };
