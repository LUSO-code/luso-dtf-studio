import React from "react";
import { clsx } from "clsx";

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  active?: boolean;
}

export function NeuButton({
  variant = "primary",
  size = "md",
  children,
  active = false,
  className,
  ...props
}: NeuButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
  };

  const variantStyles = {
    primary: active
      ? "neu-pressed bg-primary-dark/40 text-primary border border-primary/30 shadow-glow-violet"
      : "neu-raised bg-surface-container-high/70 text-primary hover:text-white hover:bg-surface-bright/80 border border-primary/20",
    secondary: active
      ? "neu-pressed bg-secondary-dark/40 text-secondary border border-secondary/30 shadow-glow-cyan"
      : "neu-raised bg-surface-container-high/70 text-secondary hover:text-white hover:bg-surface-bright/80 border border-secondary/20",
    glass:
      "bg-surface-container/40 backdrop-blur-md border border-white/10 text-on-surface hover:bg-white/10 hover:border-white/20",
    ghost:
      "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/5",
  };

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
