"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  className?: string;
}

export function BeforeAfterSlider({ originalUrl, processedUrl, className = "" }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl glass-panel border border-white/10 ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Background Grid Pattern simulating transparent DTF canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] bg-surface-container-lowest" />

      {/* Original Image (Full Background) */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalUrl}
          alt="Original Design"
          className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-xl"
        />
        <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-wider uppercase bg-surface-container-high/90 text-on-surface px-2.5 py-1 rounded-full border border-white/10 shadow-md">
          Original
        </span>
      </div>

      {/* Processed Image (Clipped Overlay) */}
      <div
        className="absolute inset-0 overflow-hidden flex items-center justify-center p-4"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={processedUrl}
          alt="Processed Design"
          className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-xl"
        />
        <span className="absolute bottom-3 right-3 text-[10px] font-bold tracking-wider uppercase bg-secondary-dark/90 text-secondary px-2.5 py-1 rounded-full border border-secondary/30 shadow-md">
          Procesado DTF
        </span>
      </div>

      {/* Divider Bar */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-primary to-secondary shadow-glow-cyan z-20 cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-container-high border-2 border-secondary shadow-lg flex items-center justify-center text-secondary">
          <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
