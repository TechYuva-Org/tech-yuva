import { useState, useEffect, useRef } from "react";
import { Terminal, Copy, Check, Play, RefreshCw, Smartphone, Laptop, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface HeroTerminalProps {
  onOpenSpecs: () => void;
  onScrollToEvents: () => void;
  cmsHero?: any;
  key?: string;
}

export default function HeroTerminal({ onOpenSpecs, onScrollToEvents, cmsHero }: HeroTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [outputResult, setOutputResult] = useState<string | null>(null);
  const [executionLine, setExecutionLine] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const [displayTitle, setDisplayTitle] = useState(cmsHero?.title || "TECH YUVA");

  // Derive dynamic strings
  const badgeText = cmsHero?.badge || "ADMISSION OPEN • NEW COHORT 2026";
  const subtitleText = cmsHero?.subtitle || "Where Youth Meet To Build Future Tech.";
  const descriptionText = cmsHero?.description || "Empowering the next generation of builders through AI, Web3, and high-performance startup culture.";
  const button1Text = cmsHero?.ctaButton1Text || "EXPLORE WORKSHOPS";
  const button2Text = cmsHero?.ctaButton2Text || "VIEW STATS & SPECS";

  const fullCodeText = cmsHero?.terminalCode || `const future = {
  dream: "Become a Developer",
  learn: true,
  build: true,
  community: "Tech Yuva"
};

console.log("Your journey starts here 🚀");`;

  // Dynamic code lines splitter
  const codeLines = fullCodeText.split("\n");
  const codeBlocks = codeLines.map((lineText: string, idx: number) => ({
    text: lineText,
    line: idx + 1
  }));

  const copyCode = () => {
    navigator.clipboard.writeText(fullCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCodeCompile = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgressLog([]);
    setOutputResult(null);
    setExecutionLine(0);

    // Sequence execution simulation
    const logs = [
      "⚡ Initializing Vercel Edge Node...",
      "🔍 Resolving dependencies from package.json...",
      "📦 Implemented @google/genai module structures...",
      "⚙️ Compiling TypeScript server targets to CommonJS...",
      "✅ Execution success in 143ms."
    ];

    let currentLogIdx = 0;
    const logInterval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setProgressLog(prev => [...prev, logs[currentLogIdx]]);
        currentLogIdx++;
      } else {
        clearInterval(logInterval);
        setOutputResult("Your journey starts here 🚀\nJoin Tech Yuva to access active Hackathons! ✨");
        setIsRunning(false);
        setExecutionLine(-1);
        setDisplayTitle(cmsHero?.subtitle || "WHERE YOUTH MEET TO BUILD FUTURE TECH.");
      }
    }, 450);

    // Line highlight loops
    let currentLine = 1;
    const highlightInterval = setInterval(() => {
      if (currentLine <= 8) {
        setExecutionLine(currentLine);
        currentLine++;
      } else {
        clearInterval(highlightInterval);
      }
    }, 200);
  };

  // Automatically execute code once on viewport load
  useEffect(() => {
    const timer = setTimeout(() => {
      runCodeCompile();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 md:py-20 relative px-4" ref={containerRef}>
      
      {/* Absolute floating particle glow background */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-primary-blue glowing-orbs -translate-x-1/2 -translate-y-1/2 -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-saffron glowing-orbs translate-x-1/2 translate-y-1/2 -z-10" />

      {/* Hero Left Column: Brand Pitch */}
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#00BFFF]">{badgeText}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-sans font-black leading-[0.9] uppercase tracking-tighter italic text-white">
          {displayTitle.toLowerCase().includes("build future tech") ? (
            <>Where Youth Meet To <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E90FF] to-[#00BFFF]">Build Future Tech.</span></>
          ) : (
            displayTitle.toUpperCase() === "TECH YUVA" ? (
              <><span className="text-saffron">TECH</span> <span className="text-emerald-green">YUVA</span></>
            ) : displayTitle
          )}
        </h1>

        <p className="text-lg text-gray-400 max-w-xl font-light leading-relaxed">
          {descriptionText}
        </p>

        {/* Action button rows */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            onClick={onScrollToEvents}
            className="h-12 px-8 bg-[#1E90FF]/20 backdrop-blur-xl border border-[#1E90FF]/40 text-white font-bold uppercase text-xs tracking-widest rounded-lg shadow-[0_0_20px_rgba(30,144,255,0.3)] hover:bg-[#1E90FF]/30 hover:shadow-[0_0_30px_rgba(30,144,255,0.4)] active:scale-[0.98] transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            id="hero-explore-cta"
          >
            {button1Text}
            <span className="font-mono text-xs">→</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenSpecs}
            className="h-12 px-8 bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] text-white font-bold uppercase text-xs tracking-widest rounded-lg hover:bg-white/[0.08] hover:border-white/[0.15] transition-all italic flex items-center justify-center gap-2"
            id="hero-specs-cta"
          >
            <Terminal className="w-4 h-4 text-[#1E90FF]" />
            {button2Text}
          </button>
        </div>

        {/* Custom statistics badge ribbon */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 font-mono">
          <div>
            <p className="text-2xl font-black font-sans text-white">500+</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Members</p>
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-white">20+</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Events Hosted</p>
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-[#FF7A00]">1000+</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Impacted Builders</p>
          </div>
        </div>
      </div>

      {/* Hero Right Column: Floating Monitor Code Simulator */}
      <div className="lg:col-span-6 flex justify-center relative">
        <div className="absolute inset-0 bg-[#1E90FF]/10 rounded-2xl blur-3xl transform rotate-3" />
        <div className="relative w-full max-w-md bg-[#0A0A0A]/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(30,144,255,0.06)] overflow-hidden flex flex-col pt-0 animate-float z-10">
          
          {/* Mock Screen Header Bar */}
          <div className="bg-white/[0.03] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              <span className="text-[10px] font-mono text-gray-500 ml-2 tracking-wider uppercase">tech-yuva-core.js</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={copyCode}
                className="p-1 rounded hover:bg-white/5 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                title="Copy full code stack"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-green" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button 
                type="button"
                onClick={runCodeCompile}
                disabled={isRunning}
                className="px-2.5 py-1 rounded bg-[#1E90FF]/25 hover:bg-[#1E90FF]/40 border border-[#1E90FF]/40 text-neon-blue text-[10px] font-mono flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isRunning ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5 text-neon-blue fill-neon-blue" />}
                {isRunning ? "COMPILING" : "RUN CODE"}
              </button>
            </div>
          </div>

          {/* Line by line Code Canvas Screen */}
          <div className="p-5 font-mono text-[#c0caf5] text-xs leading-6 overflow-x-auto min-h-[220px]">
            {codeBlocks.map((block, index) => (
              <div 
                key={index} 
                className={`flex gap-4 ${
                  executionLine === block.line 
                    ? "bg-[#1E90FF]/15 text-white border-l-2 border-[#00BFFF] pl-2 -ml-2" 
                    : ""
                } transition-all duration-150`}
              >
                <span className="text-[#414868] text-right w-4 select-none shrink-0">{index + 1}</span>
                <span className="whitespace-pre">
                  {block.text ? (
                    // Simple syntax coloring inside presentation view
                    block.text.split('"').map((segment, segIdx) => {
                      if (segIdx % 2 === 1) {
                        return <span key={segIdx} className="text-[#e0af68]">"{segment}"</span>;
                      }
                      if (segment && (segment.includes("const ") || segment.includes("console."))) {
                        return (
                          <span key={segIdx}>
                            {segment.includes("const ") && <span className="text-[#bb9af7]">const </span>}
                            {segment.includes("console.") && <span className="text-[#7aa2f7]">console</span>}
                            {segment.includes(".log") && <span className="text-[#0dbc79]">.log</span>}
                            {segment.replace("const ", "").replace("console", "").replace(".log", "")}
                          </span>
                        );
                      }
                      return segment;
                    })
                  ) : <br />}
                </span>
              </div>
            ))}
          </div>

          {/* Console Output Screen Area */}
          <div className="p-4 border-t border-white/[0.06] bg-black/40 backdrop-blur-sm min-h-[140px] font-mono text-[11px] flex flex-col gap-1.5 text-[#9CA3AF]">
            <p className="text-[10px] uppercase text-[#414868] tracking-widest font-bold border-b border-white/5 pb-1 select-none flex items-center justify-between">
              <span>Output terminal Console</span>
              <span className="text-[9px] lowercase font-normal italic text-white/30">(click Run Code to update logs)</span>
            </p>
            {progressLog.map((log, logIdx) => (
              <p key={logIdx} className={(log && log.includes("✅")) ? "text-[#0dbc79]" : "text-[#7982a9]"}>{log}</p>
            ))}
            {outputResult && (
              <div className="mt-2 p-2.5 rounded bg-brand-bg border border-white/5 text-white animate-fade-in text-xs whitespace-pre-wrap leading-relaxed">
                {outputResult}
              </div>
            )}
          </div>
        </div>

        {/* Floating Status Card */}
        <div className="absolute -bottom-6 -right-6 p-5 bg-[#0A0A0A]/60 border border-white/[0.08] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl z-20 hidden md:block select-none">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold font-mono">Current Impact</div>
          <div className="text-3xl font-black text-[#1E90FF] tabular-nums font-sans">500+</div>
          <div className="text-[10px] text-gray-500 uppercase font-sans">Students Impacted</div>
        </div>
      </div>

    </div>
  );
}
