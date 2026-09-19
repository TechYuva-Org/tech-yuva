import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Maximize2, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

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
  cardWidth?: number | string;
  cardHeight?: number | string;
  animationDuration?: number;
  enableDepthFog?: boolean;
  fogIntensity?: number;
  enableMagneticAttraction?: boolean;
  magneticStrength?: number;
  onCardClick?: (index: number) => void;
  className?: string;
}

export const ParallaxCards: React.FC<ParallaxCardsProps> = ({
  images = [],
  items,
  cardCount,
  perspective = 2500,
  mouseSensitivity = 3,
  cardWidth,
  cardHeight = 320,
  animationDuration = 1.2,
  enableDepthFog = false,
  fogIntensity = 1,
  enableMagneticAttraction = false,
  magneticStrength = 50,
  onCardClick,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // -1 to 1
  const [isHovered, setIsHovered] = useState(false);
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  // Normalize data between images and items
  const cardList: ParallaxCardItem[] = React.useMemo(() => {
    if (items && items.length > 0) {
      return items.slice(0, cardCount || Math.min(items.length, 12));
    }
    return images.slice(0, cardCount || Math.min(images.length, 12)).map((img, i) => ({
      mediaUrl: img,
      title: `Event Capture #${i + 1}`,
      event: "Tech Yuva Event",
      statLabel: "ARCHIVE",
      statValue: "VERIFIED",
      highlightText: "Official visual record from Tech Yuva community archives."
    }));
  }, [images, items, cardCount]);

  // Smooth mouse tracking with requestAnimationFrame
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  const updateMouse = useCallback(() => {
    setMousePos((prev) => {
      const dx = mouseTargetRef.current.x - prev.x;
      const dy = mouseTargetRef.current.y - prev.y;
      // Damping factor
      const damping = 0.08;
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        return mouseTargetRef.current;
      }
      return {
        x: prev.x + dx * damping,
        y: prev.y + dy * damping
      };
    });
    animFrameRef.current = requestAnimationFrame(updateMouse);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(updateMouse);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateMouse]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    mouseTargetRef.current = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseTargetRef.current = { x: 0, y: 0 };
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (activeModalIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModalIndex(null);
      if (e.key === "ArrowLeft") {
        setActiveModalIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : cardList.length - 1) : null
        );
      }
      if (e.key === "ArrowRight") {
        setActiveModalIndex((prev) =>
          prev !== null ? (prev < cardList.length - 1 ? prev + 1 : 0) : null
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalIndex, cardList.length]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${className}`}
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 50%"
      }}
    >
      {/* 3D Scene Container */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${-mousePos.y * mouseSensitivity * 1.5}deg) rotateY(${mousePos.x * mouseSensitivity * 2}deg)`,
          transitionDuration: isHovered ? "0.1s" : `${animationDuration}s`
        }}
      >
        {cardList.map((card, index) => {
          // Calculate depth variations for staggering effect
          const depthLayer = ((index % 3) + 1) * 15; // 15px, 30px, 45px base z-layer
          
          return (
            <SingleParallaxCard
              key={index}
              card={card}
              index={index}
              parentMousePos={mousePos}
              mouseSensitivity={mouseSensitivity}
              baseZ={depthLayer}
              cardHeight={cardHeight}
              cardWidth={cardWidth}
              enableDepthFog={enableDepthFog}
              fogIntensity={fogIntensity}
              enableMagneticAttraction={enableMagneticAttraction}
              magneticStrength={magneticStrength}
              onClick={() => {
                if (onCardClick) onCardClick(index);
                setActiveModalIndex(index);
              }}
            />
          );
        })}
      </div>

      {/* Lightbox / High-Res Preview Modal */}
      <AnimatePresence>
        {activeModalIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveModalIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-w-4xl w-full bg-[#0d121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {cardList[activeModalIndex].event || "Tech Yuva Archives"}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {activeModalIndex + 1} / {cardList.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalIndex(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image Container */}
              <div className="relative w-full max-h-[65vh] flex items-center justify-center bg-black/60 overflow-hidden">
                <img
                  src={cardList[activeModalIndex].mediaUrl}
                  alt={cardList[activeModalIndex].title || "Event Image"}
                  className="max-h-[65vh] w-auto object-contain select-none"
                  loading="lazy"
                />

                {/* Left Navigation */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalIndex((prev) =>
                      prev !== null ? (prev > 0 ? prev - 1 : cardList.length - 1) : null
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white backdrop-blur transition-all shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Navigation */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalIndex((prev) =>
                      prev !== null ? (prev < cardList.length - 1 ? prev + 1 : 0) : null
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white backdrop-blur transition-all shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Footer Details */}
              <div className="p-6 bg-gradient-to-b from-[#0d121d] to-[#0a0e17] space-y-2 border-t border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-display uppercase tracking-tight text-white font-bold">
                    {cardList[activeModalIndex].title}
                  </h3>
                  {cardList[activeModalIndex].statValue && (
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                      {cardList[activeModalIndex].statLabel || "IMPACT"}: {cardList[activeModalIndex].statValue}
                    </span>
                  )}
                </div>
                {cardList[activeModalIndex].highlightText && (
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">
                    {cardList[activeModalIndex].highlightText}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SingleCardProps {
  card: ParallaxCardItem;
  index: number;
  parentMousePos: { x: number; y: number };
  mouseSensitivity: number;
  baseZ: number;
  cardHeight: number | string;
  cardWidth?: number | string;
  enableDepthFog: boolean;
  fogIntensity: number;
  enableMagneticAttraction: boolean;
  magneticStrength: number;
  onClick: () => void;
}

const SingleParallaxCard: React.FC<SingleCardProps> = ({
  card,
  parentMousePos,
  mouseSensitivity,
  baseZ,
  cardHeight,
  cardWidth,
  enableDepthFog,
  fogIntensity,
  enableMagneticAttraction,
  magneticStrength,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [localHover, setLocalHover] = useState(false);
  const [localMouse, setLocalMouse] = useState({ x: 0, y: 0 }); // relative to this card center

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setLocalMouse({
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    });
  };

  const handleCardMouseLeave = () => {
    setLocalHover(false);
    setLocalMouse({ x: 0, y: 0 });
  };

  // 3D rotations combining parent scene and local hover tilt
  const rotateX = localHover
    ? -localMouse.y * 12
    : -parentMousePos.y * mouseSensitivity * 1.8;
  const rotateY = localHover
    ? localMouse.x * 12
    : parentMousePos.x * mouseSensitivity * 1.8;

  // Layered translation
  const translateZ = localHover ? baseZ + 35 : baseZ;

  // Optional magnetic pull towards mouse
  const magX = enableMagneticAttraction && localHover ? localMouse.x * magneticStrength : 0;
  const magY = enableMagneticAttraction && localHover ? localMouse.y * magneticStrength : 0;

  // Glare position calculation
  const glareX = 50 + localMouse.x * 40;
  const glareY = 50 + localMouse.y * 40;

  // Depth fog calculation
  const fogOpacity = enableDepthFog
    ? Math.max(0, Math.min(0.6, (1 - (baseZ / 60)) * 0.3 * fogIntensity))
    : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleCardMouseMove}
      onMouseEnter={() => setLocalHover(true)}
      onMouseLeave={handleCardMouseLeave}
      onClick={onClick}
      className="group relative cursor-pointer select-none rounded-xl transition-all duration-300"
      style={{
        transformStyle: "preserve-3d",
        transform: `translate3d(${magX}px, ${magY}px, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        height: typeof cardHeight === "number" ? `${cardHeight}px` : cardHeight,
        width: cardWidth ? (typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth) : "100%",
        willChange: "transform"
      }}
    >
      {/* Outer Card Frame / Glass container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-[#0f1422] shadow-[0_15px_35px_rgba(0,0,0,0.5)] group-hover:border-cyan-500/40 group-hover:shadow-[0_20px_45px_rgba(30,144,255,0.2)] transition-all duration-300">
        
        {/* Layer 1: Image Canvas with subtle zoom and parallax */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(10px) scale(${localHover ? 1.08 : 1.02})`,
            transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)"
          }}
        >
          <img
            src={card.mediaUrl}
            alt={card.title || "Gallery"}
            className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] group-hover:brightness-100 transition-all duration-500"
            loading="lazy"
          />
        </div>

        {/* Dynamic Glare Reflection Layer */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: localHover ? 0.45 : 0.1,
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.0) 65%)`
          }}
        />

        {/* Dark Vignette / Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Optional Depth Fog */}
        {enableDepthFog && fogOpacity > 0 && (
          <div
            className="absolute inset-0 bg-slate-950 pointer-events-none transition-opacity duration-300"
            style={{ opacity: fogOpacity }}
          />
        )}

        {/* Layer 2: Floating Event Badge (Top-Left) */}
        <div
          className="absolute top-3 left-3 flex items-center gap-2"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(30px)",
            transition: "transform 0.3s ease-out"
          }}
        >
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-cyan-400">
            {card.event || "Event Log"}
          </span>
        </div>

        {/* Layer 3: Floating Expand Action Icon (Top-Right) */}
        <div
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:bg-black/70 transition-all duration-300"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(25px)"
          }}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </div>

        {/* Layer 4: Content Overlay at Bottom */}
        <div
          className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-1.5 pointer-events-none"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(35px)",
            transition: "transform 0.3s ease-out"
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
              {card.title}
            </h4>
            {card.statValue && (
              <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                {card.statValue}
              </span>
            )}
          </div>

          {card.highlightText && (
            <p className="text-[11px] text-gray-300/90 font-sans line-clamp-2 leading-relaxed opacity-85 group-hover:opacity-100 transition-opacity">
              {card.highlightText}
            </p>
          )}

          {/* Interactive instruction line on hover */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400/80 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Click to inspect</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </div>

      </div>
    </div>
  );
};
