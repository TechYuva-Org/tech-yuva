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
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: dimension, height: dimension, borderRadius: "50%", overflow: "hidden" }}
    >
      <img
        src="/tech-yuva-logo.png"
        alt="Tech Yuva — Where Youth Meet to Build Future Tech"
        draggable={false}
        className={`w-full h-full object-contain ${animated ? "ty-logo-glow" : ""}`}
        style={{ display: "block" }}
      />
    </div>
  );
}
