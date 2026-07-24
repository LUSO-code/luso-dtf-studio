"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center gap-1.5 text-xs text-on-surface-variant ${className}`}>
      <Link href="/" className="hover:text-on-surface transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Inicio</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-on-surface transition-colors font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="text-secondary font-semibold font-mono truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
