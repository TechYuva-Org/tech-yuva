import React, { useState } from "react";

interface BlurredImageProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export default function BlurredImage({
  src,
  alt,
  className = "",
  referrerPolicy = "no-referrer",
}: BlurredImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0A0D14]">
      {/* 
        Aesthetic Blurred Placeholder Backing:
        Utilizes a beautiful animated gradient representing the image structure
        to keep the executive look polished prior to full-resolution download.
      */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#1E293B]/20 to-[#0F172A] transition-opacity duration-700 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,144,255,0.08)_0,transparent_60%)] animate-pulse" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <div className="w-5 h-5 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#9CA3AF] font-bold select-none">
            STREAMING MEDIA...
          </span>
        </div>
      </div>

      {/* 
        Primary High-Resolution Image Layer with high-end blur transition:
        Initially blurred and slightly scaled up, then smoothly unblurs, scales to normal,
        and reveals full rich colors and deep contrast.
      */}
      <img
        src={src}
        alt={alt}
        referrerPolicy={referrerPolicy}
        onLoad={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${
          isLoaded
            ? "blur-0 scale-100 grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-60"
            : "blur-2xl scale-110 opacity-30"
        } ${className}`}
      />
    </div>
  );
}
