import React from "react";

interface TechYuvaLogoProps {
  className?: string;
  size?: number | string;
  animated?: boolean;
}

export default function TechYuvaLogo({
  className = "",
  size = "100%",
  animated = true,
}: TechYuvaLogoProps) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none cursor-pointer group transition-all duration-300 transform hover:scale-105 rounded-full ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {/* Circular atmospheric ambient glow */}
      {animated && (
        <div className="absolute inset-0 rounded-full bg-[#1E90FF]/25 blur-lg opacity-70 group-hover:opacity-100 group-hover:bg-[#1E90FF]/40 transition-all duration-500 pointer-events-none" />
      )}
      
      {/* Seamless circular mask with screen blend mode (no square box, no black border) */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      >
        <img
          src="/tech-yuva-logo.png"
          alt="Tech Yuva"
          draggable={false}
          className="w-full h-full object-cover scale-[1.04]"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
