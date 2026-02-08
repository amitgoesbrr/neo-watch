"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

// {{{ Dropdown Types
interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}
// }}}

// {{{ Dropdown Component
export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled = false,
  size = "md",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  return (
    <div ref={dropdownRef} className={clsx("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "w-full flex items-center justify-between gap-2 rounded-lg",
          "glass-solid border border-glass-border",
          "text-left transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-cosmic-black",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "border-stellar-blue ring-1 ring-stellar-blue",
          sizeClasses[size]
        )}
      >
        <span className={selectedOption ? "text-text-primary" : "text-text-muted"}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-text-muted transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              "absolute z-50 w-full mt-2 py-1 rounded-lg",
              "glass-solid border border-glass-border shadow-xl",
              "max-h-60 overflow-auto"
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                disabled={option.disabled}
                className={clsx(
                  "w-full px-4 py-2 text-left flex items-center gap-2 transition-colors",
                  "hover:bg-glass-bg",
                  option.disabled && "opacity-50 cursor-not-allowed",
                  option.value === value
                    ? "text-stellar-blue bg-glass-bg"
                    : "text-text-primary"
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// }}}

// {{{ Menu Dropdown Component
interface MenuDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function MenuDropdown({
  trigger,
  children,
  align = "right",
  className,
}: MenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={clsx("relative inline-block", className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              "absolute z-50 mt-2 py-1 min-w-[180px] rounded-lg",
              "glass-solid border border-glass-border shadow-xl",
              align === "right" ? "right-0" : "left-0"
            )}
            onClick={() => setIsOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// }}}

// {{{ Menu Item Component
interface MenuItemProps {
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export function MenuItem({
  onClick,
  children,
  icon,
  variant = "default",
  disabled = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "w-full px-4 py-2 text-left flex items-center gap-2 transition-colors",
        "hover:bg-glass-bg disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "danger"
          ? "text-danger-red hover:bg-danger-red/10"
          : "text-text-primary"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
// }}}
