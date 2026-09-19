import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn } from "lucide-react";

export interface ParallaxCardItem {
  mediaUrl: string;
  title?: string;
  event?: string;
  statLabel?: string;
  statValue?: string;
  highlightText?: string;
}

export interface ParallaxCardsProps {
  images?: string[];
  items?: ParallaxCardItem[];
  cardCount?: number;
  perspective?: number;
  mouseSensitivity?: number;
  animationDuration?: number;
  enableDepthFog?: boolean;
  fogIntensity?: number;
  enableMagneticAttraction?: boolean;
  magneticStrength?: number;
  onCardClick?: (index: number) => void;
  className?: string;
}

// Spatial placement coordinates mimicking the React Bits Pro 3D scatter layout
const CARD_POSITIONS = [
  // 0: Top-Left Prominent Foreground Card
  { top: "6%", left: "4%", width: "32%", height: "43%", depth: 55, rotateZ: -1.2 },
  // 1: Top Mid-Left (Midground)
  { top: "8%", left: "39%", width: "21%", height: "30%", depth: 15, rotateZ: 0.8 },
  // 2: Top Right Prominent Foreground Card
  { top: "5%", left: "64%", width: "30%", height: "42%", depth: 50, rotateZ: 1.0 },
  // 3: Deep Background Card (Behind left)
  { top: "31%", left: "35%", width: "12%", height: "18%", depth: -35, rotateZ: -1.5 },
  // 4: Deep Background Card (Center-Right)
  { top: "32%", left: "60%", width: "12%", height: "17%", depth: -30, rotateZ: 1.2 },
  // 5: Mid-Right Midground Card
  { top: "45%", left: "74%", width: "20%", height: "28%", depth: 25, rotateZ: -0.6 },
  // 6: Bottom Left Prominent Foreground Card
  { top: "54%", left: "3%", width: "28%", height: "40%", depth: 45, rotateZ: 0.8 },
  // 7: Deep Background Card (Bottom Mid-Left)
  { top: "56%", left: "29%", width: "13%", height: "19%", depth: -20, rotateZ: -0.8 },
  // 8: Bottom Center Midground Card
  { top: "66%", left: "42%", width: "16%", height: "24%", depth: 20, rotateZ: 1.0 },
  // 9: Bottom Right Prominent Foreground Card
  { top: "60%", left: "69%", width: "26%", height: "36%", depth: 40, rotateZ: -0.5 },
];

export const ParallaxCards: React.FC<ParallaxCardsProps> = ({
  images = [],
  items,
  cardCount,
  perspective = 1400,
  mouseSensitivity = 2.5,
  animationDuration = 0.8,
  onCardClick,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // -1 to 1
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // Normalize all items (guaranteeing all 10 images are loaded in order)
  const cardList: ParallaxCardItem[] = React.useMemo(() => {
    if (items && items.length > 0) {
      const maxCount = cardCount ? Math.min(cardCount, items.length) : items.length;
      return items.slice(0, maxCount);
    }
    const maxCount = cardCount ? Math.min(cardCount, images.length) : images.length;
    return images.slice(0, maxCount).map((img, i) => ({
      mediaUrl: img,
      title: `Archive Record #${i + 1}`,
      event: "Tech Yuva Event",
      statLabel: "LOG",
      statValue: "VERIFIED",
      highlightText: "Authentic photographic capture from community archives."
    }));
  }, [images, items, cardCount]);

  // RequestAnimationFrame lerp mouse damping
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

  const updateMousePhysics = useCallback(() => {
    setMousePos((prev) => {
      const newX = lerp(prev.x, targetMouseRef.current.x, 0.08);
      const newY = lerp(prev.y, targetMouseRef.current.y, 0.08);
      if (Math.abs(newX - prev.x) < 0.0005 && Math.abs(newY - prev.y) < 0.0005) {
        return prev;
      }
      return { x: newX, y: newY };
    });
    animFrameRef.current = requestAnimationFrame(updateMousePhysics);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(updateMousePhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateMousePhysics]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || activeCardIndex !== null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetMouseRef.current = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    };
  };

  const handleMouseLeave = () => {
    targetMouseRef.current = { x: 0, y: 0 };
    setHoveredCardIndex(null);
  };

  const handleCardSelect = (index: number) => {
    if (activeCardIndex === index) {
      setActiveCardIndex(null);
    } else {
      setActiveCardIndex(index);
      if (onCardClick) onCardClick(index);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveCardIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[620px] sm:h-[720px] md:h-[840px] lg:h-[900px] overflow-hidden rounded-3xl bg-[#030509] border border-white/10 select-none shadow-[0_20px_60px_rgba(0,0,0,0.8)] ${className}`}
      style={{
        perspective: `${perspective}px`
      }}
    >
      {/* Background ambient lighting */}
      <div 
        className="pointer-events-none absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-black"
        style={{
          transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * -15}px, 0)`
        }}
      />

      {/* Grid Guide Overlay (Subtle Awwwards aesthetic) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Stage Hint & Controls */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-3 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/50 border border-cyan-500/20 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          3D PARALLAX CANVAS • {cardList.length} CAPTURES
        </span>
        <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400">
          Move cursor to steer parallax • Click image to elevate
        </span>
      </div>

      {/* Backdrop Dimmer when a card is elevated */}
      <div
        onClick={() => setActiveCardIndex(null)}
        className={`absolute inset-0 z-30 transition-all duration-500 backdrop-blur-sm ${
          activeCardIndex !== null
            ? "bg-black/75 opacity-100 pointer-events-auto cursor-pointer"
            : "bg-transparent opacity-0 pointer-events-none"
        }`}
      />

      {/* 3D Spatial Canvas Layer */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${-mousePos.y * mouseSensitivity * 2}deg) rotateY(${mousePos.x * mouseSensitivity * 2.5}deg)`,
          transition: "transform 0.1s ease-out"
        }}
      >
        {cardList.map((card, index) => {
          const pos = CARD_POSITIONS[index % CARD_POSITIONS.length];
          const isElevated = activeCardIndex === index;
          const isHovered = hoveredCardIndex === index;

          // Multi-layer parallax depth displacement based on mouse movement
          const parallaxX = mousePos.x * (pos.depth * 0.45);
          const parallaxY = mousePos.y * (pos.depth * 0.45);

          // Dynamic Z depth: background (-30px) to foreground (+50px)
          const currentZ = isElevated ? 260 : isHovered ? pos.depth + 30 : pos.depth;
          const currentScale = isElevated ? 1 : isHovered ? 1.05 : 1;
          const zIndex = isElevated ? 50 : isHovered ? 40 : pos.depth > 30 ? 25 : pos.depth > 0 ? 15 : 5;

          return (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleCardSelect(index);
              }}
              onMouseEnter={() => setHoveredCardIndex(index)}
              onMouseLeave={() => setHoveredCardIndex(null)}
              className={`absolute transition-all ${
                isElevated
                  ? "cursor-default duration-500"
                  : "cursor-pointer duration-300"
              }`}
              style={{
                top: isElevated ? "50%" : pos.top,
                left: isElevated ? "50%" : pos.left,
                width: isElevated ? "min(88vw, 760px)" : pos.width,
                height: isElevated ? "min(78vh, 560px)" : pos.height,
                transformStyle: "preserve-3d",
                transform: isElevated
                  ? "translate(-50%, -50%) translateZ(280px) scale(1)"
                  : `translate3d(${parallaxX}px, ${parallaxY}px, ${currentZ}px) rotateZ(${pos.rotateZ}deg) scale(${currentScale})`,
                zIndex,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)"
              }}
            >
              {/* Card Container (Double-bezel hardware styling) */}
              <div
                className={`relative w-full h-full rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isElevated
                    ? "border-cyan-400/80 shadow-[0_25px_70px_rgba(0,210,255,0.35)] ring-2 ring-cyan-400/40"
                    : isHovered
                    ? "border-white/40 shadow-[0_15px_35px_rgba(30,144,255,0.25)] ring-1 ring-cyan-400/20"
                    : "border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                } bg-[#0b0f19]`}
              >
                {/* Photo Image */}
                <img
                  src={card.mediaUrl}
                  alt={card.title || `Archive Photo ${index + 1}`}
                  className={`w-full h-full object-cover select-none transition-all duration-500 ${
                    isElevated
                      ? "filter brightness-105 contrast-105"
                      : isHovered
                      ? "filter brightness-100 contrast-100 scale-105"
                      : "filter brightness-90 contrast-[1.05]"
                  }`}
                  loading="lazy"
                />

                {/* Ambient dynamic sheen glare */}
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
                  style={{
                    opacity: isElevated ? 0.2 : isHovered ? 0.35 : 0.05,
                    background: `radial-gradient(circle at ${50 + mousePos.x * 30}% ${50 + mousePos.y * 30}%, rgba(255,255,255,0.7) 0%, transparent 60%)`
                  }}
                />

                {/* Gradient vignette */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 ${
                    isElevated ? "opacity-100" : isHovered ? "opacity-80" : "opacity-60"
                  }`}
                />

                {/* Floating Badge (Top Left) */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-cyan-300">
                    {card.event || "Tech Yuva"}
                  </span>
                  {card.statValue && (
                    <span className="hidden sm:inline-block font-mono text-[9px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30">
                      {card.statValue}
                    </span>
                  )}
                </div>

                {/* Elevated Close / Minimize Button */}
                {isElevated ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCardIndex(null);
                    }}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white hover:text-cyan-400 transition-colors shadow-lg"
                    aria-label="Minimize image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="absolute top-3 right-3 z-10 p-1 rounded-full bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Metadata Details at Bottom */}
                <div
                  className={`absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1 transition-all duration-300 ${
                    isElevated
                      ? "opacity-100 translate-y-0"
                      : isHovered
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  <h4 className="font-display text-sm sm:text-base font-bold text-white uppercase tracking-tight line-clamp-1">
                    {card.title}
                  </h4>
                  {card.highlightText && (
                    <p className="text-[11px] sm:text-xs text-gray-300 font-sans leading-relaxed line-clamp-2">
                      {card.highlightText}
                    </p>
                  )}
                  {isElevated && (
                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                      <span>Click background or close to return</span>
                      <span>Capture {index + 1} / {cardList.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
