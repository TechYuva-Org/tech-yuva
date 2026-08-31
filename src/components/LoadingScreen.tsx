import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

const SYSTEM_LOGS = [
  "Booting Tech Yuva Core...",
  "Loading Innovation Engine...",
  "Connecting Community Services...",
  "Syncing Developer Network...",
  "Connecting Future Builders...",
  "Platform Ready."
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<"video" | "interactive" | "resolution" | "fadeout" | "done">("video");
  const [currentLogIndex, setCurrentLogIndex] = useState(-1);
  const [typedText, setTypedText] = useState("");
  const [titleTyped, setTitleTyped] = useState("");
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasCompleted = useRef(false);

  // Typewriter effect refs
  const titleTimer = useRef<NodeJS.Timeout | null>(null);
  const logTimer = useRef<NodeJS.Timeout | null>(null);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finishSequence = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    try {
      sessionStorage.setItem("techyuva_has_seen_loading", "true");
    } catch (e) {}
    setPhase("fadeout");
    setTimeout(() => {
      setPhase("done");
      onCompleteRef.current();
    }, 350);
  }, []);

  // Initial Check (prefers-reduced-motion & sessionStorage & Safety hard timeout)
  useEffect(() => {
    try {
      if (sessionStorage.getItem("techyuva_has_seen_loading") === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPhase("done");
        onCompleteRef.current();
        return;
      }
    } catch (e) {}
    
    // Auto-advance if video takes more than 1.5s or gets blocked on mobile
    const videoFallback = setTimeout(() => {
      setPhase(p => (p === "video" ? "interactive" : p));
    }, 1500);

    // Hard absolute safety fallback
    const fallbackTimer = setTimeout(() => {
      if (!hasCompleted.current) finishSequence();
    }, 4500);

    return () => {
      clearTimeout(videoFallback);
      clearTimeout(fallbackTimer);
    };
  }, [finishSequence]);

  // Handle Video completion
  const handleVideoEnd = () => {
    if (phase === "video") setPhase("interactive");
  };

  const handleVideoError = () => {
    if (phase === "video") setPhase("interactive");
  };

  // Typewriter logic for the title
  useEffect(() => {
    if (phase === "interactive") {
      const fullTitle = "Initializing Tech Yuva...";
      let i = 0;
      titleTimer.current = setInterval(() => {
        setTitleTyped(fullTitle.substring(0, i + 1));
        i++;
        if (i === fullTitle.length) {
          if (titleTimer.current) clearInterval(titleTimer.current);
          setTimeout(() => setCurrentLogIndex(0), 150);
        }
      }, 35);
    }
    return () => {
      if (titleTimer.current) clearInterval(titleTimer.current);
    };
  }, [phase]);

  // Typewriter logic for logs
  useEffect(() => {
    if (currentLogIndex >= 0 && currentLogIndex < SYSTEM_LOGS.length) {
      const targetText = SYSTEM_LOGS[currentLogIndex];
      let i = 0;
      setTypedText("");
      
      setProgress(Math.floor(((currentLogIndex + 1) / SYSTEM_LOGS.length) * 100));

      logTimer.current = setInterval(() => {
        setTypedText(targetText.substring(0, i + 1));
        i++;
        if (i === targetText.length) {
          if (logTimer.current) clearInterval(logTimer.current);
          
          if (currentLogIndex === SYSTEM_LOGS.length - 1) {
            setProgress(100);
            setTimeout(() => setPhase("resolution"), 250);
          } else {
            setTimeout(() => setCurrentLogIndex(prev => prev + 1), 80);
          }
        }
      }, 15);
    }
    return () => {
      if (logTimer.current) clearInterval(logTimer.current);
    };
  }, [currentLogIndex]);

  // Resolution phase logic
  useEffect(() => {
    if (phase === "resolution") {
      const timer = setTimeout(() => {
        finishSequence();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [phase, finishSequence]);

  if (phase === "done") return null;

  return (
    <div
      className={`loading-screen-overlay ${phase === "resolution" || phase === "fadeout" ? "pointer-events-none" : ""} ${phase === "fadeout" ? "loading-screen-fadeout" : ""}`}
      aria-hidden="true"
      role="presentation"
    >
      {/* Background cinematic effects */}
      <div className={`loading-screen-bg ${phase !== "video" ? "active" : ""}`} />
      <div className={`loading-particles ${phase !== "video" ? "active" : ""}`} />

      {/* Video Phase */}
      <video
        ref={videoRef}
        className="loading-screen-video"
        style={{ opacity: phase === "video" ? 1 : 0 }}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        onError={handleVideoError}
      >
        <source src="/loading-screen.mp4" type="video/mp4" />
      </video>

      {/* Interactive Phase */}
      {phase !== "video" && (
        <div className="loading-interactive">
          {/* Logo container */}
          <div className={`loading-logo-container active ${phase === "resolution" ? "loading-logo-pulse" : ""}`}>
            <div className="loading-logo-glow" />
            <img src="/tech-yuva-logo.png" alt="" className="w-full h-full object-contain" />
            {phase === "resolution" && <div className="loading-ripple active" onAnimationEnd={finishSequence} />}
          </div>

          {/* Title */}
          <h2 className="text-white/75 font-mono text-sm uppercase tracking-[0.12em] mb-8 min-h-[20px]">
            {titleTyped}
          </h2>

          {/* Progress Bar */}
          <div 
            className={`loading-progress-container ${titleTyped.length > 0 && phase !== "resolution" ? "active" : ""}`}
            style={{ opacity: phase === "resolution" ? 0 : undefined }}
          >
            <div className="loading-progress-bar" style={{ width: `${progress}%` }} />
          </div>

          {/* Logs */}
          <div 
            className="w-full mt-8 font-mono text-xs flex flex-col gap-2 min-h-[160px]"
            style={{ opacity: phase === "resolution" ? 0 : 1, transition: "opacity 0.4s ease" }}
          >
            {SYSTEM_LOGS.map((log, index) => {
              const isActive = index === currentLogIndex;
              const isComplete = index < currentLogIndex;
              const isVisible = index <= currentLogIndex;

              if (!isVisible) return <div key={index} className="h-4" />;

              return (
                <div key={index} className="flex items-center gap-2 animate-fade-in">
                  <span className={`shrink-0 ${isComplete ? "text-emerald-green" : isActive ? "text-[#1E90FF]" : "text-transparent"}`}>
                    {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 block" />}
                  </span>
                  <span className={isComplete ? "text-emerald-green/80" : isActive ? "text-[#1E90FF]" : "text-transparent"}>
                    {isActive ? typedText : log}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Resolution Launch Text */}
          {phase === "resolution" && (
            <div className="absolute bottom-10 font-mono text-emerald-green text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch Successful.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
