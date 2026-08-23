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
      className={`relative flex items-center justify-center select-none cursor-pointer group transition-all duration-300 transform hover:scale-110 ${className}`}
      style={{ width: dimension, height: dimension, borderRadius: "50%" }}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1E90FF]/0 via-[#00BFFF]/0 to-[#FF7A00]/0 group-hover:from-[#1E90FF]/30 group-hover:via-[#00BFFF]/30 group-hover:to-[#FF7A00]/20 blur-md transition-all duration-500 opacity-0 group-hover:opacity-100" />
      <img
        src="/tech-yuva-logo.png"
        alt="Tech Yuva — Where Youth Meet to Build Future Tech"
        draggable={false}
        className={`w-full h-full object-contain rounded-full relative z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_16px_rgba(0,191,255,0.8)] ${animated ? "ty-logo-glow" : ""}`}
        style={{ display: "block" }}
      />
    </div>
  );
}
