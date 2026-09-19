import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X, Sparkles, Grid, Layers, Play, Pause } from "lucide-react";

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
  autoSlideInterval?: number; // in ms, default 3200
  className?: string;
}

export const ParallaxCards: React.FC<ParallaxCardsProps> = ({
  images = [],
  items,
  cardCount,
  perspective = 1200,
  mouseSensitivity = 2.5,
  autoSlideInterval = 3200,
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
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [isInViewport, setIsInViewport] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  // ResizeObserver to adapt 3D spacing accurately for mobile vs desktop
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // IntersectionObserver: auto-slide triggers when user scrolls/stops on the gallery
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Navigation handlers
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % cardList.length);
  }, [cardList.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + cardList.length) % cardList.length);
  }, [cardList.length]);

  // Auto-slide effect: slides from right to left when user stops on the gallery
  useEffect(() => {
    if (
      !isInViewport ||
      !isAutoPlayEnabled ||
      isHovered ||
      activeModalIndex !== null ||
      viewMode !== "3d-flow"
    ) {
      return;
    }

    const timer = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [isInViewport, isAutoPlayEnabled, isHovered, activeModalIndex, viewMode, nextSlide, autoSlideInterval]);

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

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseTilt({ x: 0, y: 0 });
  };

  // Touch gesture support with responsive swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();
    setIsHovered(true); // pause auto-slide while touching
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartXRef.current - touchEndX;
      const timeDiff = Date.now() - touchStartTimeRef.current;

      // Sensitive swipe detection for mobile
      if (Math.abs(diff) > 30 || (Math.abs(diff) > 15 && timeDiff < 250)) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }
    touchStartXRef.current = null;
    // Resume auto-slide after brief pause
    setTimeout(() => setIsHovered(false), 2000);
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

  const isMobile = containerWidth < 640;

  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* Top Controls Bar: Clean, User-Friendly Mode Switcher & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>3D FLOW • {cardList.length} ARCHIVES</span>
          </span>
          {isAutoPlayEnabled && isInViewport && !isHovered && viewMode === "3d-flow" && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400/90">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto-sliding right &rarr; left
            </span>
          )}
        </div>

        {/* View Mode & AutoPlay Toggle Buttons */}
        <div className="flex items-center gap-1.5 bg-[#0b0f19] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
            className={`p-1.5 rounded-lg text-xs font-mono transition-all ${
              isAutoPlayEnabled ? "text-cyan-300 hover:bg-white/5" : "text-gray-500 hover:text-gray-300"
            }`}
            title={isAutoPlayEnabled ? "Pause auto-slide" : "Resume auto-slide"}
            aria-label={isAutoPlayEnabled ? "Pause auto-slide" : "Resume auto-slide"}
          >
            {isAutoPlayEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setViewMode("3d-flow")}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
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
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              viewMode === "grid"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,210,255,0.2)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* 3D Flow Carousel View (Default on Mobile and Desktop) */}
      {viewMode === "3d-flow" ? (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[440px] sm:h-[500px] md:h-[560px] lg:h-[600px] overflow-hidden rounded-3xl bg-gradient-to-b from-[#060810] via-[#04060a] to-[#020306] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)]"
          style={{ perspective: `${perspective}px` }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(30,144,255,0.14)_0%,transparent_70%)]" />

          {/* Floating Previous Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-cyan-950/90 border border-white/15 hover:border-cyan-400/40 text-white hover:text-cyan-300 backdrop-blur-md transition-all shadow-xl active:scale-95"
            aria-label="Previous capture"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Floating Next Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-cyan-950/90 border border-white/15 hover:border-cyan-400/40 text-white hover:text-cyan-300 backdrop-blur-md transition-all shadow-xl active:scale-95"
            aria-label="Next capture"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 3D Curved Spatial Arc Stage */}
          <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {cardList.map((card, index) => {
              const count = cardList.length;
              let offset = (index - currentIndex + count) % count;
              if (offset > count / 2) offset -= count;

              // On mobile, render -2 to +2 to keep layout tight; on desktop render -3 to +3
              const maxRange = isMobile ? 2 : 3;
              if (Math.abs(offset) > maxRange) return null;

              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);

              // Responsive 3D positioning along curved arc
              const stepX = isMobile ? Math.min(containerWidth * 0.65, 230) : 280;
              const translateX = offset * stepX;
              const translateZ = -absOffset * (isMobile ? 90 : 130);
              const rotateY = offset * (isMobile ? -20 : -25);
              const scale = 1 - absOffset * (isMobile ? 0.14 : 0.12);
              const opacity = 1 - absOffset * (isMobile ? 0.35 : 0.25);
              const zIndex = 30 - absOffset * 5;

              // Tilt exclusively on active center card for performance
              const tiltX = isCenter && !isMobile ? -mouseTilt.y * mouseSensitivity * 2 : 0;
              const tiltY = isCenter && !isMobile ? mouseTilt.x * mouseSensitivity * 2.5 : 0;

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
                    width: isMobile ? "min(86vw, 360px)" : "min(82vw, 540px)",
                    height: isMobile ? "min(55vh, 320px)" : "min(65vh, 380px)",
                    transformStyle: "preserve-3d",
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY + tiltY}deg) rotateX(${tiltX}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)"
                  }}
                >
                  {/* Double-bezel hardware styling */}
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
                    {isCenter && !isMobile && (
                      <div
                        className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300 opacity-20 group-hover:opacity-40"
                        style={{
                          background: `radial-gradient(circle at ${50 + mouseTilt.x * 40}% ${50 + mouseTilt.y * 40}%, rgba(255,255,255,0.8) 0%, transparent 65%)`
                        }}
                      />
                    )}

                    {/* Gradient Darkening Mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <span className="font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-cyan-300">
                        {card.event || "Tech Yuva"}
                      </span>
                      {card.statValue && (
                        <span className="font-mono text-[9px] sm:text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/30">
                          {card.statValue}
                        </span>
                      )}
                    </div>

                    {/* Zoom Icon Hint on Center Card */}
                    {isCenter && (
                      <div className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-cyan-300 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Content Details at Bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 flex flex-col gap-1 z-10">
                      <h4 className="font-display text-sm sm:text-base md:text-lg font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {card.title}
                      </h4>
                      {card.highlightText && (
                        <p className="text-[11px] sm:text-xs text-gray-300 font-sans leading-relaxed line-clamp-2">
                          {card.highlightText}
                        </p>
                      )}
                      {isCenter && (
                        <div className="flex items-center justify-between pt-1 text-[10px] sm:text-[11px] font-mono text-cyan-400">
                          <span>Tap card to view in crisp high-res</span>
                          <span>Capture {index + 1} of {cardList.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Dot Indicator Rail */}
          <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5 px-4 overflow-x-auto py-1">
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
                    ? "w-7 h-2 bg-cyan-400 shadow-[0_0_10px_rgba(0,210,255,0.7)]"
                    : "w-2 h-2 bg-white/25 hover:bg-white/50"
                }`}
                aria-label={`Go to capture ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Alternate Responsive Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cardList.map((card, index) => (
            <div
              key={index}
              onClick={() => setActiveModalIndex(index)}
              className="group relative cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-[#0a0d16] hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,180,255,0.2)] h-[260px] sm:h-[280px]"
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

      {/* CRYSTAL-CLEAR HIGH-RES LIGHTBOX MODAL (ZERO BLUR, FULL NATIVE RESOLUTION) */}
      <AnimatePresence>
        {activeModalIndex !== null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 md:p-8 bg-black/90 backdrop-blur-md"
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
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-[#0b0f19]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-mono text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                    {cardList[activeModalIndex].event || "Tech Yuva Milestone"}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono text-gray-400">
                    Capture {activeModalIndex + 1} of {cardList.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalIndex(null)}
                  className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close high-res view"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Pure High-Res Photo Container (Zero blur filter, crisp object-contain) */}
              <div className="relative w-full flex-1 min-h-[260px] max-h-[66vh] bg-black flex items-center justify-center p-2 sm:p-4 overflow-hidden">
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
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white hover:text-cyan-400 backdrop-blur-md transition-all shadow-xl active:scale-95"
                  aria-label="Previous capture"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalIndex((prev) =>
                      prev !== null ? (prev + 1) % cardList.length : 0
                    )
                  }
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white hover:text-cyan-400 backdrop-blur-md transition-all shadow-xl active:scale-95"
                  aria-label="Next capture"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Modal Details Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#080c14] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base md:text-lg font-display uppercase tracking-tight text-white font-bold">
                    {cardList[activeModalIndex].title}
                  </h3>
                  {cardList[activeModalIndex].highlightText && (
                    <p className="text-[11px] sm:text-xs text-gray-300 font-sans leading-relaxed max-w-3xl">
                      {cardList[activeModalIndex].highlightText}
                    </p>
                  )}
                </div>
                {cardList[activeModalIndex].statValue && (
                  <div className="shrink-0 font-mono text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-500/30 w-fit">
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
