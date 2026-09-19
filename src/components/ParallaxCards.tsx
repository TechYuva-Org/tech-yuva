import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles, Grid, Layers } from "lucide-react";

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
  className?: string;
}

export const ParallaxCards: React.FC<ParallaxCardsProps> = ({
  images = [],
  items,
  cardCount,
  perspective = 1200,
  mouseSensitivity = 2.5,
  className = ""
}) => {
  // Normalize items ensuring all 10 images are loaded in proper sequence
  const cardList: ParallaxCardItem[] = React.useMemo(() => {
    if (items && items.length > 0) {
      const count = cardCount ? Math.min(cardCount, items.length) : items.length;
      return items.slice(0, count);
    }
    const count = cardCount ? Math.min(cardCount, images.length) : images.length;
    return images.slice(0, count).map((img, i) => ({
      mediaUrl: img,
      title: `Event Capture #${i + 1}`,
      event: "Tech Yuva Archives",
      statLabel: "STATUS",
      statValue: "VERIFIED",
      highlightText: "Official visual milestone from the Tech Yuva community archives."
    }));
  }, [images, items, cardCount]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"3d-flow" | "grid">("3d-flow");
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 }); // -1 to 1

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Smooth mouse tilt tracking for active card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseTilt({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  // Carousel navigation
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % cardList.length);
  }, [cardList.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + cardList.length) % cardList.length);
  }, [cardList.length]);

  // Touch gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModalIndex !== null) {
        if (e.key === "Escape") setActiveModalIndex(null);
        if (e.key === "ArrowLeft") {
          setActiveModalIndex((prev) => (prev !== null ? (prev - 1 + cardList.length) % cardList.length : 0));
        }
        if (e.key === "ArrowRight") {
          setActiveModalIndex((prev) => (prev !== null ? (prev + 1) % cardList.length : 0));
        }
      } else {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex, nextSlide, prevSlide, cardList.length]);

  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* Top Controls Bar: Clean, User-Friendly Mode Switcher & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>3D VAULT • {cardList.length} ARCHIVES</span>
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-gray-400">
            {viewMode === "3d-flow" ? "Drag / click arrows to rotate • Click to zoom in crisp high-res" : "All 10 authentic captures"}
          </span>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-1.5 bg-[#0b0f19] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode("3d-flow")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              viewMode === "3d-flow"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              viewMode === "grid"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* 3D Flow Carousel View (Clean, Ergonomic, Non-Cluttered) */}
      {viewMode === "3d-flow" ? (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[460px] sm:h-[540px] md:h-[600px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#060810] via-[#04060a] to-[#020306] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)]"
          style={{ perspective: `${perspective}px` }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(30,144,255,0.12)_0%,transparent_70%)]" />

          {/* Floating Previous Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-cyan-950/80 border border-white/15 hover:border-cyan-400/40 text-white hover:text-cyan-300 backdrop-blur-md transition-all shadow-xl active:scale-95"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Floating Next Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 hover:bg-cyan-950/80 border border-white/15 hover:border-cyan-400/40 text-white hover:text-cyan-300 backdrop-blur-md transition-all shadow-xl active:scale-95"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 3D Curved Spatial Arc Stage */}
          <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {cardList.map((card, index) => {
              // Calculate circular offset distance from current active index
              const count = cardList.length;
              let offset = (index - currentIndex + count) % count;
              if (offset > count / 2) offset -= count;

              // Only render cards within active view window (-3 to +3) to guarantee 0 clutter
              if (Math.abs(offset) > 3) return null;

              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

              // 3D positioning parameters along curved arc
              const translateX = offset * 280; // Distance along X axis in pixels
              const translateZ = -absOffset * 140; // Push into depth
              const rotateY = offset * -25; // Curved tilt towards center
              const scale = 1 - absOffset * 0.12; // Scale down distant items
              const opacity = 1 - absOffset * 0.25; // Softly fade distant items
              const zIndex = 30 - absOffset * 5;

              // Mouse parallax tilt applied exclusively to the active center card
              const tiltX = isCenter ? -mouseTilt.y * mouseSensitivity * 2 : 0;
              const tiltY = isCenter ? mouseTilt.x * mouseSensitivity * 2.5 : 0;

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (isCenter) {
                      setActiveModalIndex(index);
                    } else {
                      setCurrentIndex(index);
                    }
                  }}
                  className={`absolute transition-transform duration-500 cursor-pointer ${
                    isCenter ? "group" : "hover:opacity-100"
                  }`}
                  style={{
                    width: "min(82vw, 540px)",
                    height: "min(68vh, 380px)",
                    transformStyle: "preserve-3d",
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY + tiltY}deg) rotateX(${tiltX}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
                  }}
                >
                  {/* Card Shell (Double-bezel hardware styling) */}
                  <div
                    className={`relative w-full h-full rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isCenter
                        ? "border-cyan-400/50 shadow-[0_20px_60px_rgba(0,180,255,0.25)] ring-1 ring-cyan-400/30"
                        : "border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:border-white/30"
                    } bg-[#0a0d16]`}
                  >
                    {/* Image Canvas */}
                    <img
                      src={card.mediaUrl}
                      alt={card.title || `Capture ${index + 1}`}
                      className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Glare Sheen Reflection on Center Card */}
                    {isCenter && (
                      <div
                        className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300 opacity-20 group-hover:opacity-40"
                        style={{
                          background: `radial-gradient(circle at ${50 + mouseTilt.x * 40}% ${50 + mouseTilt.y * 40}%, rgba(255,255,255,0.8) 0%, transparent 65%)`
                        }}
                      />
                    )}

                    {/* Gradient Darkening Mask at Bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-cyan-300">
                        {card.event || "Tech Yuva"}
                      </span>
                      {card.statValue && (
                        <span className="font-mono text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/30">
                          {card.statValue}
                        </span>
                      )}
                    </div>

                    {/* Zoom Icon Hint on Center Card */}
                    {isCenter && (
                      <div className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-cyan-300 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Content Details at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-1.5 z-10">
                      <h4 className="font-display text-base sm:text-lg font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {card.title}
                      </h4>
                      {card.highlightText && (
                        <p className="text-xs text-gray-300 font-sans leading-relaxed line-clamp-2">
                          {card.highlightText}
                        </p>
                      )}
                      {isCenter && (
                        <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-cyan-400">
                          <span>Click card to expand in high-res</span>
                          <span>Capture {index + 1} of {cardList.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Dot & Thumbnail Rail Indicator */}
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-1.5 px-4 overflow-x-auto py-2">
            {cardList.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`transition-all rounded-full ${
                  i === currentIndex
                    ? "w-8 h-2 bg-cyan-400 shadow-[0_0_10px_rgba(0,210,255,0.7)]"
                    : "w-2 h-2 bg-white/25 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Alternate Responsive Grid View (All 10 captures cleanly visible without clutter) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cardList.map((card, index) => (
            <div
              key={index}
              onClick={() => setActiveModalIndex(index)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-[#0a0d16] hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,180,255,0.2)] h-[280px]"
            >
              <img
                src={card.mediaUrl}
                alt={card.title || `Capture ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-cyan-300">
                  {card.event || "Tech Yuva"}
                </span>
              </div>
              <div className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 z-10">
                <h4 className="font-display text-sm font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {card.title}
                </h4>
                {card.highlightText && (
                  <p className="text-[11px] text-gray-300 font-sans line-clamp-2 mt-0.5">
                    {card.highlightText}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CRYSTAL-CLEAR HIGH-RES LIGHTBOX MODAL (ZERO BLUR, FULL FIDELITY) */}
      <AnimatePresence>
        {activeModalIndex !== null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveModalIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-[#080c14] border border-white/15 rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh]"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0b0f19]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                    {cardList[activeModalIndex].event || "Tech Yuva Milestone"}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    Capture {activeModalIndex + 1} of {cardList.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalIndex(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close high-res view"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pure High-Res Photo Container (Zero blur filter, crisp object-contain) */}
              <div className="relative w-full flex-1 min-h-[300px] max-h-[66vh] bg-black flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                <img
                  src={cardList[activeModalIndex].mediaUrl}
                  alt={cardList[activeModalIndex].title || "Event Capture"}
                  className="max-h-[64vh] max-w-full w-auto object-contain rounded-lg shadow-2xl select-none"
                />

                {/* Left Navigation Arrow */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalIndex((prev) =>
                      prev !== null ? (prev - 1 + cardList.length) % cardList.length : 0
                    )
                  }
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white hover:text-cyan-400 backdrop-blur-md transition-all shadow-xl active:scale-95"
                  aria-label="Previous capture"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalIndex((prev) =>
                      prev !== null ? (prev + 1) % cardList.length : 0
                    )
                  }
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white hover:text-cyan-400 backdrop-blur-md transition-all shadow-xl active:scale-95"
                  aria-label="Next capture"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Details Footer */}
              <div className="px-6 py-4 bg-[#080c14] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-display uppercase tracking-tight text-white font-bold">
                    {cardList[activeModalIndex].title}
                  </h3>
                  {cardList[activeModalIndex].highlightText && (
                    <p className="text-xs text-gray-300 font-sans leading-relaxed max-w-3xl">
                      {cardList[activeModalIndex].highlightText}
                    </p>
                  )}
                </div>
                {cardList[activeModalIndex].statValue && (
                  <div className="shrink-0 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    {cardList[activeModalIndex].statLabel || "METRIC"}: {cardList[activeModalIndex].statValue}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
