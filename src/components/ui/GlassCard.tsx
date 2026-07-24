import React from "react";
import { clsx } from "clsx";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "violet" | "cyan" | "none";
}

export function GlassCard({
  children,
  className,
  glow = "none",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        "glass-panel rounded-xl p-6 transition-all duration-300",
        glow === "violet" && "hover:shadow-glow-violet",
        glow === "cyan" && "hover:shadow-glow-cyan",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
