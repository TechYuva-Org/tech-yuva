import React, { useState, useRef, useEffect } from "react";
import { 
  Users, Terminal, Cpu, Award, Code2, Presentation, Calendar, 
  ChevronRight, ArrowRight, Github, Send, Star, Shield, Info, Heart, Layout, Globe, Instagram
} from "lucide-react";
import { motion } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import HeroTerminal from "./components/HeroTerminal";
import FounderVision from "./components/FounderVision";
import TechYuvaAI from "./components/TechYuvaAI";
import ArchitectureDocs from "./components/ArchitectureDocs";
import EventRegisterModal from "./components/EventRegisterModal";
import TechYuvaLogo from "./components/TechYuvaLogo";
import CertificateViewer from "./components/CertificateViewer";
import MemberDashboard from "./components/MemberDashboard";
import AdminTerminal from "./components/AdminTerminal";
import AdminCMS from "./components/AdminCMS";
import BlurredImage from "./components/BlurredImage";
import LoadingScreen from "./components/LoadingScreen";

// Static Data
import { 
  UPCOMING_EVENTS, 
  PAST_EVENTS, 
  GALLERY_ITEMS, 
  SPONSORS, 
  TESTIMONIALS 
} from "./data";
import { EventItem } from "./types";

export default function App() {
  const queryClient = useQueryClient();
  const [loadingDone, setLoadingDone] = useState(false);

  // Modal states
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);

  // Dynamic Full-Stack Registry Queries
  const { data: dbEvents = UPCOMING_EVENTS } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
      return UPCOMING_EVENTS;
    },
    initialData: UPCOMING_EVENTS,
  });

  const { data: dbRegistrations = [] } = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const res = await fetch(`/api/registrations?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    initialData: [],
  });

  const { data: cmsData = null } = useQuery({
    queryKey: ["cmsData"],
    queryFn: async () => {
      const res = await fetch(`/api/cms/homepage?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
      return null;
    },
  });

  const setCmsData = (updater: any) => {
    queryClient.setQueryData(["cmsData"], (old: any) => {
      if (typeof updater === "function") {
        return updater(old);
      }
      return updater;
    });
  };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "portal" | "admin">("upcoming");
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [adminMode, setAdminMode] = useState<"terminal" | "cms">("cms");

  const triggerRefresh = () => {
    queryClient.invalidateQueries();
  };

  // Auth state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      if (loginStep === "email") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail })
        });
        const data = await res.json();
        if (res.ok) {
          setLoginStep("otp");
        } else {
          setLoginError(data.error || "Login failed");
        }
      } else {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, otp: loginOtp })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data.user);
          localStorage.setItem("token", data.token);
          setIsLoginModalOpen(false);
          setActiveTab(data.user.role === "admin" ? "admin" : "portal");
        } else {
          setLoginError(data.error || "Invalid OTP");
        }
      }
    } catch (err) {
      setLoginError("Network error. Try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    setActiveTab("upcoming");
  };
  
  // CTA Join Section state
  const [ctaName, setCtaName] = useState("");
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaGithub, setCtaGithub] = useState("");
  const [isCtaSuccess, setIsCtaSuccess] = useState(false);
  const [ctaLoading, setCtaLoading] = useState(false);

  // Scroll reference anchors
  const mainEventsRef = useRef<HTMLDivElement>(null);
  const mainAboutRef = useRef<HTMLDivElement>(null);
  const mainOffersRef = useRef<HTMLDivElement>(null);
  const mainGalleryRef = useRef<HTMLDivElement>(null);
  const mainJoinRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ctaLoading) return;
    setCtaLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: ctaName, email: ctaEmail, github: ctaGithub })
      });
      if (res.ok) {
        setIsCtaSuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to join waitlist.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setCtaLoading(false);
    }
  };

  return (
    <>
    <LoadingScreen onComplete={() => setLoadingDone(true)} />
    <div className={`min-h-[100dvh] bg-brand-bg text-text-primary relative grid-mesh selection:bg-neon-blue/20 select-none overflow-x-hidden ${!loadingDone ? 'invisible' : 'animate-fade-in'}`}>
      
      {/* Dynamic Schedulable Announcements Banner from Database CMS */}
      {cmsData?.announcements && cmsData.announcements.filter((ann: any) => ann.enabled).map((ann: any) => {
        const bgColors: Record<string, string> = {
          urgent: "bg-red-500/10 border-red-500/20 text-red-400",
          warning: "bg-saffron/10 border-saffron/20 text-saffron",
          success: "bg-emerald-green/10 border-emerald-green/20 text-emerald-green",
          info: "bg-neon-blue/10 border-neon-blue/20 text-neon-blue"
        };
        const currentStyle = bgColors[ann.type || "info"] || bgColors.info;
        return (
          <div key={ann.id} className={`w-full py-2.5 px-6 border-b text-center text-xs font-mono font-medium flex items-center justify-center gap-2 relative z-50 ${currentStyle}`}>
            <span className="flex h-2 w-2 rounded-full bg-current animate-pulse shrink-0" />
            <span>{ann.message}</span>
            {ann.targetLink && (
              <a href={ann.targetLink} className="underline hover:opacity-85 transition-opacity inline-flex items-center gap-1 font-bold">
                Learn more <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      })}

      {/* Background Atmosphere */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#1E90FF]/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-[#FF7A00]/5 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* SECTION 0: IMMERSIVE THEME HEADER RAIL */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/60 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.06] px-6 md:px-10 py-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand with custom circular brand emblem used as-is */}
          <div className="flex items-center select-none cursor-pointer">
            <TechYuvaLogo size={56} />
          </div>

          {/* Mobile Menu State */}
          <div className="md:hidden flex items-center gap-4">
            {!currentUser ? (
              <button onClick={() => { setLoginStep("email"); setLoginEmail(""); setLoginOtp(""); setLoginError(""); setIsLoginModalOpen(true); }} className="text-xs font-bold uppercase text-[#1E90FF]">Login</button>
            ) : (
              <button onClick={handleLogout} className="text-xs font-bold uppercase text-red-400">Logout</button>
            )}
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>

          {/* Immersive Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-widest text-text-secondary select-none">
            <button onClick={() => scrollToSection(mainAboutRef)} className="hover:text-text-primary transition-colors cursor-pointer">MISSION</button>
            <button onClick={() => scrollToSection(mainOffersRef)} className="hover:text-text-primary transition-colors cursor-pointer">ECOSYSTEM</button>
            <button onClick={() => scrollToSection(mainEventsRef)} className="hover:text-text-primary transition-colors cursor-pointer">EVENTS</button>
            <button onClick={() => scrollToSection(mainGalleryRef)} className="hover:text-text-primary transition-colors cursor-pointer">COMMUNITY</button>
            <button onClick={() => setIsSpecsOpen(true)} className="text-[#1E90FF] hover:text-text-primary transition-all cursor-pointer flex items-center gap-1.5 font-bold">
              <Layout className="w-3.5 h-3.5" /> ARCHITECT SPECS
            </button>
          </nav>

          {/* Join Community CTA & Login */}
          <div className="hidden md:flex items-center gap-3">
            {!currentUser ? (
              <button onClick={() => { setLoginStep("email"); setLoginEmail(""); setLoginOtp(""); setLoginError(""); setIsLoginModalOpen(true); }} className="text-xs font-bold uppercase text-white/70 hover:text-white px-3 cursor-pointer">Login</button>
            ) : (
              <button onClick={handleLogout} className="text-xs font-bold uppercase text-red-400/70 hover:text-red-400 px-3 cursor-pointer">Logout</button>
            )}
            <a
              href="https://chat.whatsapp.com/EARK4FcxQn0EW987zH9I08"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-[#1E90FF]/20 backdrop-blur-xl border border-[#1E90FF]/40 text-white text-[11px] font-black uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(30,144,255,0.3)] hover:bg-[#1E90FF]/30 transition-all cursor-pointer"
              id="header-join-cta"
            >
              JOIN COMMUNITY
            </a>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER CONTENT SPREAD */}
      <main className="w-full max-w-7xl mx-auto space-y-24 md:space-y-36 pb-24 overflow-x-hidden">
        
        {/* SECTION 1: HERO CONTAINER SCREEN */}
        <motion.section 
          id="hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <HeroTerminal 
            key={loadingDone ? 'ready' : 'loading'}
            onOpenSpecs={() => setIsSpecsOpen(true)} 
            onScrollToEvents={() => scrollToSection(mainEventsRef)}
            cmsHero={cmsData?.heroContent}
          />
        </motion.section>

        {/* SECTION 2: ABOUT TECH YUVA */}
        <motion.section 
          ref={mainAboutRef} 
          className="py-12 px-4" 
          id="about-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            {/* Animated official Tech Yuva Brand Emblem */}
            <div className="flex justify-center mb-8">
              <TechYuvaLogo size={260} className="hover:scale-105 transition-transform duration-500 cursor-pointer" />
            </div>
            <span className="text-xs font-mono text-neon-blue uppercase tracking-[0.2em] font-semibold block">COHORT PRINCIPLES</span>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-text-primary font-bold">
              THE NEXT GENERATION DEVELOPMENT HUB
            </h2>
            <p className="text-sm text-secondary-text font-sans font-light">
              We skip standard visual slides. Learn, deploy, and scale in modern tech structures by getting your hands dirty with real code from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {cmsData?.aboutCards && cmsData.aboutCards.length > 0 ? (
              cmsData.aboutCards.map((card: any, idx: number) => {
                const colors = [
                  { bg: "bg-primary-blue/15 border-primary-blue/30 text-neon-blue", icon: <Cpu className="w-5 h-5 text-neon-blue" />, text: "text-neon-blue" },
                  { bg: "bg-saffron/15 border-saffron/30 text-[#FF7A00]", icon: <Users className="w-5 h-5 text-[#FF7A00]" />, text: "text-saffron" },
                  { bg: "bg-emerald-green/15 border-emerald-green/30 text-emerald-green", icon: <Award className="w-5 h-5 text-emerald-green" />, text: "text-emerald-green" }
                ];
                const currentTheme = colors[idx % colors.length];

                const renderDynamicIcon = (iconName: string) => {
                  const iconClass = "w-5 h-5";
                  switch (iconName?.toLowerCase()) {
                    case "cpu": return <Cpu className={iconClass} />;
                    case "users": return <Users className={iconClass} />;
                    case "award": return <Award className={iconClass} />;
                    case "code":
                    case "code2": return <Code2 className={iconClass} />;
                    case "terminal": return <Terminal className={iconClass} />;
                    case "presentation": return <Presentation className={iconClass} />;
                    case "calendar": return <Calendar className={iconClass} />;
                    case "globe": return <Globe className={iconClass} />;
                    case "shield": return <Shield className={iconClass} />;
                    case "heart": return <Heart className={iconClass} />;
                    default: return currentTheme.icon;
                  }
                };

                return (
                  <div key={card.id || idx} className="p-6 md:p-8 rounded-xl bg-brand-bg-sec/30 border border-border-color glass-panel glass-panel-hover transition-all space-y-4">
                    <div className={`w-12 h-12 rounded flex items-center justify-center ${currentTheme.bg}`}>
                      {renderDynamicIcon(card.icon)}
                    </div>
                    <h3 className="text-lg font-display uppercase font-semibold text-text-primary">{card.heading || card.title}</h3>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      {card.description}
                    </p>
                    {card.footerText && (
                      <div className={`pt-2 flex items-center gap-1.5 font-mono text-[10px] ${currentTheme.text}`}>
                        <span>{card.footerText}</span>
                        <span>✦</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <>
                {/* Card 1: Innovation */}
                <div className="p-6 md:p-8 rounded-xl bg-brand-bg-sec/30 border border-border-color glass-panel glass-panel-hover transition-all space-y-4">
                  <div className="w-12 h-12 rounded bg-primary-blue/15 border border-primary-blue/30 text-neon-blue flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-neon-blue" />
                  </div>
                  <h3 className="text-lg font-display uppercase font-semibold text-text-primary">Innovation First</h3>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    Work alongside multi-agent LLM systems, write smart contracts, and explore edge deployments using modern full-stack architectures.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 font-mono text-[10px] text-neon-blue">
                    <span>Vercel / Stripe Standard</span>
                    <span>✦</span>
                  </div>
                </div>

                {/* Card 2: Community */}
                <div className="p-6 md:p-8 rounded-xl bg-brand-bg-sec/30 border border-border-color glass-panel glass-panel-hover transition-all space-y-4">
                  <div className="w-12 h-12 rounded bg-saffron/15 border border-saffron/30 text-[#FF7A00] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#FF7A00]" />
                  </div>
                  <h3 className="text-lg font-display uppercase font-semibold text-text-primary">Youth Community</h3>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    Connect directly with corporate leaders and student coders. Tech Yuva brings high-calibre developer guilds directly to young students.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 font-mono text-[10px] text-saffron">
                    <span>500+ Active Members</span>
                    <span>✦</span>
                  </div>
                </div>

                {/* Card 3: Growth */}
                <div className="p-6 md:p-8 rounded-xl bg-brand-bg-sec/30 border border-border-color glass-panel glass-panel-hover transition-all space-y-4">
                  <div className="w-12 h-12 rounded bg-emerald-green/15 border border-emerald-green/30 text-emerald-green flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-green" />
                  </div>
                  <h3 className="text-lg font-display uppercase font-semibold text-text-primary">Startup Path</h3>
                  <p className="text-xs text-secondary-text leading-relaxed">
                    Refine, pitch, and scale your concepts. Get direct funding fellowships, angel reviews, and server deployment sponsorships for student MVPs.
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 font-mono text-[10px] text-emerald-green">
                    <span>4 Funded Startups</span>
                    <span>✦</span>
                  </div>
                </div>
              </>
            )}

          </div>
        </motion.section>

        {/* SECTION 3: FOUNDER'S VISION */}
        <motion.section 
          id="vision-quote"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <FounderVision cmsFounder={cmsData?.founderContent} />
        </motion.section>

        {/* SECTION 4: WHAT WE OFFER BENTO GRID */}
        <motion.section 
          ref={mainOffersRef} 
          className="py-12 px-4" 
          id="offerings-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono text-[#FF7A00] uppercase tracking-[0.2em] font-semibold block">ECOSYSTEM TRACKS</span>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-text-primary font-bold">
              WHAT WE OFFER DEVELOPERS
            </h2>
            <p className="text-sm text-secondary-text font-sans font-light">
              Explore six modular pipelines designed to construct absolute developer excellence and support high-performance startup structures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
            
            {cmsData?.offerings && cmsData.offerings.length > 0 ? (
              cmsData.offerings.map((off: any, idx: number) => {
                const isWide = idx % 3 === 0 || idx % 3 === 1; // alternating wide and narrow columns
                const colSpan = isWide ? "md:col-span-8" : "md:col-span-4";
                const bgColors = ["bg-[#1E90FF]/15 text-neon-blue", "bg-saffron/15 text-saffron", "bg-purple-500/10 text-purple-400", "bg-emerald-green/15 text-emerald-green"];
                const iconColor = bgColors[idx % bgColors.length];
                
                // Assign matching icons to maintain high quality
                let OfferingIcon = Code2;
                if (off.title?.toLowerCase().includes("api") || off.title?.toLowerCase().includes("workshop")) {
                  OfferingIcon = Terminal;
                } else if (off.title?.toLowerCase().includes("talk") || off.title?.toLowerCase().includes("corporate")) {
                  OfferingIcon = Presentation;
                } else if (off.title?.toLowerCase().includes("ai") || off.title?.toLowerCase().includes("generative")) {
                  OfferingIcon = Cpu;
                }

                return (
                  <div key={off.id || idx} className={`${colSpan} p-6 md:p-8 rounded-xl bg-brand-bg-sec/40 border border-border-color glass-panel glass-panel-hover transition-all flex flex-col justify-between min-h-[220px]`}>
                    <div className="flex justify-between items-start">
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${iconColor}`}>
                        <OfferingIcon className="w-5 h-5" />
                      </div>
                      {off.badge && (
                        <span className="text-[9px] font-mono border border-border-color py-1 px-3 rounded uppercase bg-[#1A1A1A]">
                          {off.badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-6 space-y-2">
                      <h3 className="text-lg font-display uppercase font-bold text-text-primary">{off.title}</h3>
                      <p className="text-xs text-secondary-text leading-relaxed">{off.description}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {/* 1. Grand Hackathons (Wide) */}
                <div className="md:col-span-8 p-6 md:p-8 rounded-xl bg-brand-bg-sec/40 border border-border-color glass-panel glass-panel-hover transition-all flex flex-col justify-between min-h-[220px]">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded bg-[#1E90FF]/15 text-neon-blue flex items-center justify-center">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono text-neon-blue bg-[#1A1A1A] border border-border-color py-1 px-3 rounded">FLAGSHIP TRACK</span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <h3 className="text-lg font-display uppercase font-bold text-text-primary">36-Hour Hackathons</h3>
                    <p className="text-xs text-secondary-text max-w-xl leading-relaxed">
                      Join hundreds of intense student teams in our iconic annual sprints. Code non-stop, build genuine database-driven apps, eat pizza, and win cash seeds.
                    </p>
                  </div>
                </div>

                {/* 2. Interactive Workshops (Tall) */}
                <div className="md:col-span-4 p-6 md:p-8 rounded-xl bg-brand-bg-sec/40 border border-border-color glass-panel glass-panel-hover transition-all flex flex-col justify-between min-h-[220px]">
                  <div className="w-10 h-10 rounded bg-saffron/15 text-saffron flex items-center justify-center">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <h3 className="text-base font-display uppercase font-bold text-text-primary">Systems Engineering</h3>
                    <p className="text-xs text-secondary-text leading-relaxed">
                      No empty theory. We architect production-grade backends, build scalable APIs, and deploy active systems directly to the cloud.
                    </p>
                  </div>
                </div>

                {/* 3. Tech Talks (Small) */}
                <div className="md:col-span-4 p-6 rounded-xl bg-brand-bg-sec/40 border border-border-color glass-panel glass-panel-hover transition-all flex flex-col justify-between min-h-[180px]">
                  <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-display font-medium text-text-primary uppercase">Corporate Tech Talks</h4>
                    <p className="text-xs text-secondary-text">
                      Direct syncs with elite architects modeling web platforms and explaining system-level file behaviors.
                    </p>
                  </div>
                </div>

                {/* 4. AI Bootcamps (Wide) */}
                <div className="md:col-span-8 p-6 rounded-xl bg-brand-bg-sec/40 border border-border-color glass-panel glass-panel-hover transition-all flex flex-col justify-between min-h-[180px]">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded bg-emerald-green/15 text-emerald-green flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono text-emerald-green">INCUBATION SPOT</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-display font-medium text-text-primary uppercase">Generative AI Bootcamps</h4>
                    <p className="text-xs text-secondary-text max-w-lg">
                      Master natural language embeddings, structured schemas, model temperature tuning, tool-calling APIs, and streaming interfaces securely using server-side proxies.
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>
        </motion.section>

        {/* SECTION 5: DYNAMIC COHORT EVENT REGISTRY DESK */}
        <motion.section 
          ref={mainEventsRef} 
          className="py-12 px-4 space-y-8 scroll-mt-24" 
          id="upcoming-events-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          


          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#00BFFF] uppercase tracking-[0.2em] font-semibold block">COHORT REGISTRY DESK</span>
              <h2 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-text-primary font-bold">
                {activeTab === "upcoming" ? "ACTIVE EXPEDITIONS" : activeTab === "portal" ? "DEVELOPER COHORT PASSPORT" : "ADMINISTRATOR COMMAND DECK"}
              </h2>
              <p className="text-xs text-secondary-text font-sans">
                {activeTab === "upcoming" 
                  ? "Select and register developer conference passes instantly." 
                  : activeTab === "portal" 
                    ? "Log in to display check-ins and lock digital holographic certificates." 
                    : "Create sprints, track attendance checkboxes, and download full CSV files."}
              </p>
            </div>
            
            {/* Immersive horizontal tab deck switches */}
            <div className="flex bg-[#0c0f13]/90 border border-white/10 p-1.5 rounded-lg shrink-0 select-none">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
                  activeTab === "upcoming" 
                    ? "bg-[#1E90FF]/20 border border-[#1E90FF]/40 text-[#00BFFF] backdrop-blur-xl shadow-lg" 
                    : "text-[#a0a0a0] hover:text-white"
                }`}
              >
                1. EXPEDITIONS
              </button>
              <button
                onClick={() => setActiveTab("portal")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
                  activeTab === "portal" 
                    ? "bg-[#1E90FF]/20 border border-[#1E90FF]/40 text-[#00BFFF] backdrop-blur-xl shadow-lg" 
                    : "text-[#a0a0a0] hover:text-white"
                }`}
              >
                2. MEMBER CONSOLE
              </button>
              {currentUser && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-all ${
                  activeTab === "admin" 
                    ? "bg-red-500/20 border border-red-500/40 text-red-400 backdrop-blur-xl shadow-lg" 
                    : "text-[#a0a0a0] hover:text-white"
                }`}
              >
                3. ADMIN ROOM
              </button>
              )}
            </div>
          </div>

          {/* TAB CONTENT 1: UPCOMING EXPEDITIONS GRID (VISITOR SIGHT) */}
          {activeTab === "upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {dbEvents.filter(e => e.status === "upcoming" || e.status === "active" || !e.status).map((evt) => (
                <div 
                  key={evt.id} 
                  className="relative rounded-xl border border-white/10 bg-[#0F1115]/50 overflow-hidden flex flex-col justify-between p-6 min-h-[360px] glass-panel hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-[#00BFFF] bg-[#00BFFF]/10 border border-[#00BFFF]/20 py-0.5 px-2.5 rounded">
                      {evt.category?.toUpperCase() || "SPRINT"}
                    </span>
                    {evt.featured && (
                      <span className="text-[9px] font-mono text-saffron bg-saffron/10 border border-saffron/20 py-0.5 px-2.5 rounded font-bold uppercase tracking-wider">
                        Featured Sprints
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 flex-1">
                    <span className="text-[11px] font-mono text-[#9CA3AF] block font-light flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-secondary-text" /> {evt.date}
                    </span>
                    
                    <h3 className="text-lg font-display uppercase tracking-wide text-text-primary font-semibold">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans font-light">
                      {evt.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {evt.tags && Array.isArray(evt.tags) && evt.tags.map((tag: string) => (
                        <span key={tag} className="text-[9px] font-mono text-secondary-text bg-brand-bg-sec/50 border border-border-color py-0.5 px-2.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[10px] text-secondary-text">
                        Seats Remaining: <span className="text-saffron font-bold text-xs">{evt.spotsLeft !== undefined ? evt.spotsLeft : 25}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedEventForReg(evt)}
                        className="px-4 py-1.5 bg-[#1E90FF]/20 backdrop-blur-xl border border-[#1E90FF]/40 hover:bg-[#1E90FF]/30 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(30,144,255,0.3)] transition-all cursor-pointer"
                      >
                        SECURE PASS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {dbEvents.filter(e => e.status === "upcoming" || e.status === "active" || !e.status).length === 0 && (
                <div className="col-span-3 text-center py-12 border border-white/5 bg-[#0d0f13]/40 rounded-xl space-y-2">
                  <p className="text-xs text-secondary-text">No active upcoming sprints found on the database.</p>
                  <p className="text-[10px] font-mono text-[#00BFFF]">Switch to the Admin tab to create custom ones instantly!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: MEMBER SECURE CONSOLE */}
          {activeTab === "portal" && (
            <div className="max-w-4xl mx-auto w-full animate-fade-in">
              <MemberDashboard 
                currentUser={currentUser}
                allEvents={dbEvents}
                onLogin={(user) => {
                  setCurrentUser(user);
                  triggerRefresh();
                }}
                onLogout={() => {
                  setCurrentUser(null);
                  setActiveTab("upcoming");
                  triggerRefresh();
                }}
                onViewCertificate={(cert) => {
                  setSelectedCertificate(cert);
                }}
              />
            </div>
          )}

          {/* TAB CONTENT 3: ADMIN INSTRUMENTS CONTROL DECK */}
          {activeTab === "admin" && (
            <div className="w-full animate-fade-in space-y-6">
              {currentUser?.role === "admin" && (
                <div className="flex bg-[#0c0f13] border border-white/10 p-1 rounded-lg max-w-sm select-none">
                  <button
                    onClick={() => setAdminMode("cms")}
                    className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      adminMode === "cms"
                        ? "bg-neon-blue text-black shadow-lg"
                        : "text-[#a0a0a0] hover:text-white"
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" /> 1. Visual CMS
                  </button>
                  <button
                    onClick={() => setAdminMode("terminal")}
                    className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      adminMode === "terminal"
                        ? "bg-neon-blue text-black shadow-lg"
                        : "text-[#a0a0a0] hover:text-white"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> 2. CLI Terminal
                  </button>
                </div>
              )}

              {adminMode === "cms" ? (
                <AdminCMS 
                  currentUser={currentUser}
                  allEvents={dbEvents}
                  allRegistrations={dbRegistrations}
                  cmsData={cmsData}
                  setCmsData={setCmsData}
                  onTriggerRefresh={() => {
                    triggerRefresh();
                  }}
                  onLoginAsAdmin={async () => {
                    try {
                      const response = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: "dakshchaudhary2668@gmail.com" })
                      });
                      if (response.ok) {
                        const { user } = await response.json();
                        setCurrentUser(user);
                        triggerRefresh();
                      }
                    } catch (err) {
                      console.error("Admin fast login failure", err);
                    }
                  }}
                />
              ) : (
                <AdminTerminal 
                  currentUser={currentUser}
                  allEvents={dbEvents}
                  allRegistrations={dbRegistrations}
                  onTriggerRefresh={triggerRefresh}
                  onLoginAsAdmin={async () => {
                    try {
                      const response = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: "dakshchaudhary2668@gmail.com" })
                      });
                      if (response.ok) {
                        const { user } = await response.json();
                        setCurrentUser(user);
                        triggerRefresh();
                      }
                    } catch (err) {
                      console.error("Admin fast login failure", err);
                    }
                  }}
                />
              )}
            </div>
          )}

        </motion.section>

        {/* SECTION 6 & 7: PAST EVENTS GALLERY & COMMUNITY IMPACT METRICS */}
        <motion.section 
          ref={mainGalleryRef} 
          className="py-12 px-4 space-y-16" 
          id="gallery-impact-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Gallery Left text column */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <span className="text-xs font-mono text-emerald-green uppercase tracking-[0.2em] font-semibold block">COHORT LOGS</span>
                <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-text-primary font-bold leading-tight">
                  PAST HIGHLIGHTS & GRAND GALLERY
                </h2>
              </div>
              <p className="text-sm text-secondary-text font-sans font-light leading-relaxed">
                Explore real historic milestones completed by community sub-teams during our 2025 and 2026 build periods. Check verification metrics on-site.
              </p>
              
              <div className="p-4 rounded border border-border-color bg-brand-bg-sec/50 space-y-3 font-mono">
                <p className="text-[10px] uppercase text-secondary-text tracking-wider font-bold">Consolidated Track Records</p>
                <div className="space-y-1 text-xs">
                  <p className="flex justify-between"><span>⭐ Google Cloud Sprints</span> <span className="text-text-primary">Active (20)</span></p>
                  <p className="flex justify-between"><span>🧩 MVPs Spawned</span> <span className="text-text-primary">80+ Prototypes</span></p>
                  <p className="flex justify-between"><span>💰 Grant Funding</span> <span className="text-text-primary">$25K Secured</span></p>
                </div>
              </div>
            </div>

            {/* Gallery Right Horizontal Layout cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(cmsData?.gallery && cmsData.gallery.length > 0 ? cmsData.gallery : GALLERY_ITEMS).map((item: any) => (
                <div 
                  key={item.id} 
                  className="group relative rounded-lg overflow-hidden border border-border-color bg-brand-bg-sec min-h-[220px] shadow-lg"
                >
                  
                  {/* Photo Canvas render with referrer check and blurred loading placeholder */}
                  <BlurredImage 
                    src={item.mediaUrl} 
                    alt={item.title} 
                    referrerPolicy="no-referrer"
                  />

                  {/* Dark mask filter gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent flex flex-col justify-end p-5" />

                  {/* Highlight text rendering on group-hover */}
                  <div className="absolute inset-x-0 bottom-0 p-5 translate-y-3 group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-1.5 select-none animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-[10px] text-neon-blue font-semibold uppercase">{item.event}</span>
                      <span className="font-mono text-emerald-green font-bold text-xs bg-emerald-green/10 px-2 py-0.5 rounded border border-emerald-green/20">
                        {item.statLabel || item.badge || "METRIC"}: {item.statValue || "100%"}
                      </span>
                    </div>
                    <h4 className="text-sm font-sans font-bold text-text-primary uppercase">{item.title}</h4>
                    <p className="text-[10px] text-secondary-text leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.highlightText || item.description}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </motion.section>

        {/* IMMERSIVE BENTO TICKER */}
        <motion.section 
          className="border-y border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#111827]/10 rounded-xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="border-b sm:border-r border-white/5 p-8 flex flex-col justify-center bg-[#111827]/30">
            <span className="text-3xl font-black text-white">20+</span>
            <span className="text-[10px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Events Hosted</span>
          </div>
          <div className="border-b lg:border-b-0 lg:border-r border-white/5 p-8 flex flex-col justify-center">
            <span className="text-3xl font-black text-[#1E90FF] italic">AI BOOTCAMPS</span>
            <span className="text-[10px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Hands-on Learning</span>
          </div>
          <div className="border-b sm:border-r border-white/5 p-8 flex flex-col justify-center bg-[#111827]/30">
            <span className="text-3xl font-black text-[#FF7A00]">500+</span>
            <span className="text-[10px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Active Members</span>
          </div>
          <div className="p-8 flex flex-col justify-center overflow-hidden">
            <span className="text-[10px] uppercase tracking-widest text-[#B3B3B3] font-bold mb-3 italic font-mono">Partners & Sponsors</span>
            <div className="flex gap-4 items-center grayscale opacity-40 select-none">
              <span className="text-[11px] font-black tracking-tighter uppercase font-sans text-white">GitHub</span>
              <span className="text-[11px] font-black tracking-tighter uppercase font-sans text-white">Vercel</span>
              <span className="text-[11px] font-black tracking-tighter uppercase font-sans text-white">Stripe</span>
            </div>
          </div>
        </motion.section>

        {/* SECTION 8: SPONSORS & PARTNERS INFINITE MARQUEE */}
        <motion.section 
          className="py-12 border-y border-white/5 relative" 
          id="marquee-sponsors-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          
          <div className="max-w-4xl mx-auto text-center mb-6">
            <p className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-widest font-bold">
              ENGAGED ECOSYSTEM COMPILER PARTNERS & SPONSORS
            </p>
          </div>

          {/* Marquee Wrapper element */}
          <div className="w-full overflow-hidden relative py-4 bg-brand-bg-sec/10 select-none">
            
            {/* Absolute side fade shadows */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-brand-bg to-transparent z-10 pointers-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-brand-bg to-transparent z-10 pointers-none" />

            {/* Rolling slider row */}
            <div className="flex gap-8 w-max animate-infinite-marquee">
              
              {/* Combine thrice for continuous loop effect */}
              {[
                ...(cmsData?.sponsors && cmsData.sponsors.length > 0 ? cmsData.sponsors : SPONSORS),
                ...(cmsData?.sponsors && cmsData.sponsors.length > 0 ? cmsData.sponsors : SPONSORS),
                ...(cmsData?.sponsors && cmsData.sponsors.length > 0 ? cmsData.sponsors : SPONSORS)
              ].map((sps: any, spsIdx: number) => (
                <div 
                  key={spsIdx} 
                  className="group relative flex items-center gap-2 px-6 py-2.5 bg-brand-bg border border-white/5 rounded-lg text-xs leading-none transition-colors hover:border-neon-blue/40 hover:bg-[#111827] cursor-pointer"
                >
                  <span className="text-sm font-bold text-white select-none">{sps.logo || "✦"}</span>
                  <span className="font-sans font-semibold text-[#f3f4f6]">{sps.name}</span>
                  <span className="text-[10px] font-mono text-secondary-text">({sps.domain || sps.tier || "partner"})</span>

                  {/* Tooltip detail element on list hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-brand-bg-sec border border-white/10 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 text-left">
                    <span className="text-[9px] font-mono text-neon-blue uppercase font-bold tracking-wider">{sps.statusText || sps.tier || "ACTIVE"}</span>
                    <p className="text-xs font-sans text-white font-medium mt-1">{sps.contribution || sps.description || "Tech Yuva Ecosystem Partner"}</p>
                  </div>
                </div>
              ))}

            </div>

          </div>

        </motion.section>

        {/* SECTION 9: GENERAL TESTIMONIALS (STUDENT REVIEWS) */}
        <motion.section 
          className="py-12 px-4 space-y-12" 
          id="testimonials-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono text-saffron uppercase tracking-[0.2em] font-semibold block">FELLOWSHIP VERDICTS</span>
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-white font-bold">
              HEARD FROM OUR ACTIVE BUILDERS
            </h2>
            <p className="text-sm text-secondary-text font-sans">Real opinions from students transformed inside our grand cohorts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(cmsData?.testimonials && cmsData.testimonials.length > 0 ? cmsData.testimonials : TESTIMONIALS).map((tes: any, idx: number) => (
              <div 
                key={tes.id || idx} 
                className="p-6 md:p-8 rounded-xl bg-brand-bg-sec/20 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between glass-panel relative"
              >
                {/* Visual quotes marker asset */}
                <span className="absolute top-4 right-6 text-6xl font-serif text-white/5 select-none leading-none">“</span>

                <div className="space-y-4">
                  
                  {/* Star Rating row */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <Star key={st} className="w-3.5 h-3.5 fill-saffron text-saffron" />
                    ))}
                  </div>

                  {/* Body citation */}
                  <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans font-light italic">
                    "{tes.quote}"
                  </p>
                </div>

                {/* Speaker Identity segment */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                  <img 
                    src={tes.avatar} 
                    alt={tes.name} 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h4 className="text-xs font-sans font-bold text-white">{tes.name}</h4>
                    <p className="text-[10px] font-mono text-[#9CA3AF]">
                      {tes.role} • <span className="text-neon-blue">{tes.organization || tes.company || "Builder"}</span>
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </motion.section>

        {/* SECTION 11: JOIN COMMUNITY CONVERSION SECTION */}
        <motion.section 
          ref={mainJoinRef} 
          className="py-12 px-4" 
          id="join-invite-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-[#0F1115] to-[#161a22] border border-white/10 p-6 sm:p-10 md:p-12 relative overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            
            {/* Absolute background flare indicator */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/10 rounded-full filter blur-[100px] -z-10" />

            {/* Left side text info */}
            <div className="space-y-4 md:col-span-7">
              <span className="text-xs font-mono text-neon-blue uppercase tracking-widest font-bold block">ENGAGE TODAY</span>
              <h2 className="text-3xl font-display uppercase tracking-wider text-white font-bold leading-tight">
                JOIN THE NEXT <br />TECH WAVE
              </h2>
              <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans max-w-sm">
                Apply for active member access to get invited instantly to our Discord HQ network, private open-source repositories, and secure free hosting server packs.
              </p>
              
              <div className="flex items-center gap-2.5 text-[10px] font-mono text-[#22C55E]">
                <Shield className="w-3.5 h-3.5 text-emerald-green" />
                <span>Zero-fee membership sponsored by partners.</span>
              </div>
            </div>

            {/* Right side active form */}
            <div className="w-full md:col-span-5 bg-brand-bg border border-white/5 p-6 rounded-xl relative">
              {isCtaSuccess ? (
                <div className="text-center p-6 space-y-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-green/10 text-emerald-green flex items-center justify-center mx-auto border border-emerald-green/30">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold uppercase text-white">Application Secured!</h4>
                    <p className="text-xs text-[#9CA3AF] mt-1 font-mono">Check your email inbox for validation instructions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCtaSuccess(false)}
                    className="mt-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-mono transition-colors cursor-pointer"
                  >
                    SUBMIT ANOTHER
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCtaSubmit} className="space-y-4">
                  
                  <div>
                    <label htmlFor="cta-input-name" className="sr-only">Developer Full Name</label>
                    <input
                      type="text"
                      required
                      value={ctaName}
                      onChange={(e) => setCtaName(e.target.value)}
                      placeholder="Developer Full Name"
                      className="w-full bg-[#111827] py-3.5 px-4 text-sm text-white rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#1E90FF]/50 placeholder:text-[#9CA3AF]/60 transition-all"
                      id="cta-input-name"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-input-email" className="sr-only">Secure Email ID</label>
                    <input
                      type="email"
                      required
                      value={ctaEmail}
                      onChange={(e) => setCtaEmail(e.target.value)}
                      placeholder="Secure Email ID"
                      className="w-full bg-[#111827] py-3.5 px-4 text-sm text-white rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#1E90FF]/50 font-mono placeholder:text-[#9CA3AF]/60 transition-all"
                      id="cta-input-email"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-input-github" className="sr-only">GitHub Username</label>
                    <input
                      type="text"
                      required
                      value={ctaGithub}
                      onChange={(e) => setCtaGithub(e.target.value)}
                      placeholder="GitHub Username (e.g., @lakshay-soni)"
                      className="w-full bg-[#111827] py-3.5 px-4 text-sm text-white rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#1E90FF]/50 font-mono placeholder:text-[#9CA3AF]/60 transition-all"
                      id="cta-input-github"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={ctaLoading}
                    className="w-full h-12 bg-[#1E90FF]/20 backdrop-blur-xl border border-[#1E90FF]/40 text-white text-xs font-mono font-bold uppercase rounded-lg shadow-[0_0_20px_rgba(30,144,255,0.3)] flex items-center justify-center gap-2 transition-all hover:bg-[#1E90FF]/30 active:scale-[0.98] cursor-pointer select-none"
                    id="cta-submit-btn"
                  >
                    {ctaLoading ? "SUBMITTING REQUEST..." : "SUBMIT ACTIVE REQUEST"}
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>

                  <p className="text-[9px] font-mono text-[#9CA3AF] text-center mt-2">
                    By submitting, you agree to comply with our community build rules.
                  </p>

                </form>
              )}
            </div>

          </div>
        </motion.section>

      </main>

      {/* SECTION: PARTNER & VOLUNTEER CTA */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-mono text-neon-blue uppercase tracking-[0.2em] font-semibold">Get Involved</span>
          <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-text-primary font-bold">
            Be Part Of The Movement
          </h2>
          <p className="text-sm text-secondary-text font-sans font-light max-w-xl mx-auto">
            Whether you represent an organization looking to partner with the next generation of builders, or you're a passionate individual ready to volunteer — there's a place for you here.
          </p>
        </div>

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Community Partners Card */}
          <a
            href="COMMUNITY_PARTNERS_GOOGLE_FORM_URL"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-8 rounded-2xl bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#1E90FF]/30 hover:shadow-[0_8px_40px_rgba(30,144,255,0.1)] transition-all duration-300 text-center space-y-4 cursor-pointer"
            id="cta-community-partners"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1E90FF]/10 border border-[#1E90FF]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-[#1E90FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Community Partners</h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">Organizations, startups, and institutions interested in collaborating with Tech Yuva.</p>
            <span className="inline-flex items-center gap-2 text-[#1E90FF] text-xs font-mono font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
              Apply Now <span className="font-mono">→</span>
            </span>
          </a>

          {/* Sponsors Card */}
          <a
            href="SPONSORS_GOOGLE_FORM_URL"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative p-8 rounded-2xl bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#FF7A00]/30 hover:shadow-[0_8px_40px_rgba(255,122,0,0.1)] transition-all duration-300 text-center space-y-4 cursor-pointer"
            id="cta-sponsors"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-[#FF7A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Sponsors</h3>
            <p className="text-xs text-gray-400 font-light leading-relaxed">Companies and brands looking to support the next generation of tech talent and gain community visibility.</p>
            <span className="inline-flex items-center gap-2 text-[#FF7A00] text-xs font-mono font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
              Sponsor US <span className="font-mono">→</span>
            </span>
          </a>
        </div>
      </section>

      {/* SECTION 12: PROFESSIONAL FOOTER BAR */}
      <footer className="border-t border-border-color bg-footer-bg py-12 px-6 font-mono text-xs text-text-secondary w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-border-color">
          
          <div className="space-y-3 md:col-span-1">
            <div className="flex justify-start">
              <TechYuvaLogo size={52} />
            </div>
            <p className="text-[11px] leading-relaxed text-text-secondary">
              The flagship student-led innovation guild empowering developers to launch real systems securely.
            </p>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Quick Navigation</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => scrollToSection(mainAboutRef)} className="hover:text-text-primary transition-colors cursor-pointer text-left">About Cohort</button></li>
              <li><button onClick={() => scrollToSection(mainOffersRef)} className="hover:text-text-primary transition-colors cursor-pointer text-left">Developer Offerings</button></li>
              <li><button onClick={() => scrollToSection(mainEventsRef)} className="hover:text-text-primary transition-colors cursor-pointer text-left">Upcoming Events</button></li>
              <li><button onClick={() => scrollToSection(mainGalleryRef)} className="hover:text-text-primary transition-colors cursor-pointer text-left">Historic Logs</button></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Engineering Specs</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => setIsSpecsOpen(true)} className="hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1.5 text-neon-blue font-bold text-left">🛠️ Interactive Blueprint Manual</button></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-1.5 text-left">🐙 Core Club Org GitHub</a></li>
              <li><span className="text-text-secondary">Hosting: Cloud Run (Node)</span></li>
              <li><span className="text-text-secondary">Model Layer: Gemini 3.5 Flash</span></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h5 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">Primary Reach Office</h5>
            <p className="text-[11px] text-text-secondary">
              Lead Architect Seat:<br />
              techyuva.org@gmail.com
            </p>
            <p className="text-[11px] text-text-secondary">
              Community Sync:<br />
              New Delhi Grid, NCR Area, IN
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
          <p>© 2026 Tech Yuva Guild Council. All rights secured internationally.</p>
          <div className="flex items-center gap-4 text-text-secondary">
            <a href="https://www.instagram.com/techyuva_/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors flex items-center gap-1"><Instagram className="w-3.5 h-3.5" /> instagram</a>
            <span className="text-border-color">|</span>
            <a href="https://github.com" className="hover:text-text-primary transition-colors flex items-center gap-1"><Github className="w-3.5 h-3.5" /> github</a>
            <span className="text-border-color">|</span>
            <span className="flex items-center gap-1 text-neon-blue"><Globe className="w-3 h-3 text-neon-blue" /> region-in-3000</span>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTIVE SYSTEM LAYOUT COMPONENT NODES */}
      <TechYuvaAI />
      
      <ArchitectureDocs 
        isOpen={isSpecsOpen} 
        onClose={() => setIsSpecsOpen(false)} 
      />

      <EventRegisterModal 
        event={selectedEventForReg}
        isOpen={selectedEventForReg !== null}
        onClose={() => setSelectedEventForReg(null)}
        currentUser={currentUser}
        onSuccess={triggerRefresh}
      />

      <CertificateViewer 
        certificate={selectedCertificate}
        isOpen={selectedCertificate !== null}
        onClose={() => setSelectedCertificate(null)}
      />

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0f13] border border-[#1E90FF]/30 p-8 rounded-xl shadow-[0_0_50px_rgba(30,144,255,0.15)] max-w-sm w-full">
            <h2 className="text-xl font-bold font-display uppercase text-text-primary mb-2">Access Command</h2>
            <p className="text-xs text-secondary-text mb-6">Enter your credentials to access the secure grid.</p>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginStep === "email" ? (
                <div>
                  <label className="block text-[10px] font-mono text-[#00BFFF] uppercase tracking-widest mb-1.5">Email Address</label>
                  <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm font-mono text-text-primary focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] outline-none transition-all" placeholder="hacker@techyuva.org" />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-mono text-[#00BFFF] uppercase tracking-widest mb-1.5">One-Time Passcode</label>
                  <input type="text" required value={loginOtp} onChange={e => setLoginOtp(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-sm font-mono text-text-primary focus:border-[#1E90FF] focus:ring-1 focus:ring-[#1E90FF] outline-none transition-all" placeholder="123456" />
                </div>
              )}
              
              {loginError && <p className="text-red-400 text-xs font-mono">{loginError}</p>}
              
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setIsLoginModalOpen(false)} className="flex-1 px-4 py-2 border border-white/10 text-text-secondary text-[11px] font-bold uppercase rounded-lg hover:text-white hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={loginLoading} className="flex-1 px-4 py-2 bg-[#1E90FF]/20 border border-[#1E90FF]/40 text-[#00BFFF] text-[11px] font-bold uppercase rounded-lg hover:bg-[#1E90FF]/30 hover:shadow-[0_0_15px_rgba(30,144,255,0.4)] transition-all disabled:opacity-50 cursor-pointer">
                  {loginLoading ? "..." : loginStep === "email" ? "Send Code" : "Verify Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
