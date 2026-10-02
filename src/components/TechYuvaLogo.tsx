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
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 transform hover:scale-105 rounded-full ${className}`}
      style={{ width: dimension, height: dimension, backgroundColor: "transparent" }}
    >
      {/* Circular atmospheric ambient glow */}
      {animated && (
        <div className="absolute inset-0 rounded-full bg-[#1E90FF]/20 blur-md opacity-60 hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
      )}
      
      {/* Seamless circular mask (no black border, transparent canvas) */}
      <div 
        className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center pointer-events-none bg-transparent"
        style={{ mixBlendMode: "screen", backgroundColor: "transparent" }}
      >
        <img
          src="/tech-yuva-logo.png"
          alt="Tech Yuva"
          draggable={false}
          className="w-full h-full object-cover scale-[1.04]"
          style={{ display: "block", backgroundColor: "transparent" }}
        />
      </div>
    </div>
  );
}
