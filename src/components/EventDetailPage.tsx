import React, { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Shield, 
  Share2, 
  CheckCircle2, 
  Lock, 
  Terminal, 
  Radio, 
  Cpu, 
  FileSearch, 
  MessageSquare, 
  ZoomIn, 
  X,
  ExternalLink
} from "lucide-react";
import { EventItem } from "../types";

interface EventDetailPageProps {
  event: EventItem;
  onBack: () => void;
}

export default function EventDetailPage({ event, onBack }: EventDetailPageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const metadata = event.metadata || {};
  const speaker = metadata.speaker;
  const highlights = metadata.highlights || [
    "Live case studies & real-world examples",
    "Cyber threat analysis & investigation techniques",
    "Tools, technologies & defense strategies",
    "Q&A session & interactive discussion"
  ];
  const tagline = metadata.tagline || "Detect • Analyze • Defend";
  const closingMessage = metadata.closingMessage || "Because Digital Security Is a Shared Responsibility.";
  const regMessage = metadata.registrationMessage || "Registration details coming soon";

  const highlightIcons = [
    <FileSearch className="w-5 h-5 text-[#00BFFF]" key="icon-0" />,
    <Shield className="w-5 h-5 text-[#00BFFF]" key="icon-1" />,
    <Cpu className="w-5 h-5 text-[#00BFFF]" key="icon-2" />,
    <MessageSquare className="w-5 h-5 text-[#00BFFF]" key="icon-3" />
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00BFFF]/30 selection:text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Background Cyber Grid Accent */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 20%, rgba(0, 191, 255, 0.15) 0%, transparent 60%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 32px 32px, 32px 32px"
        }}
      />

      <div className="relative max-w-5xl mx-auto space-y-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9CA3AF] hover:text-[#00BFFF] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Expeditions</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00BFFF]/10 border border-[#00BFFF]/25 text-[10px] font-mono text-[#00BFFF] uppercase font-bold tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" /> Verified Event
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* HERO GRID: Poster & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Event Poster Box */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div 
              onClick={() => event.image && setIsLightboxOpen(true)}
              className="relative w-full max-w-md bg-[#05070A] rounded-2xl border border-white/15 p-3.5 overflow-hidden shadow-2xl group cursor-pointer hover:border-[#00BFFF]/50 transition-all"
            >
              <div className="relative overflow-hidden rounded-xl bg-black/60 flex items-center justify-center">
                <img 
                  src={event.image || "/cyber-defense-poster.jpg"} 
                  alt={event.title}
                  className="w-full h-auto max-h-[560px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 pointer-events-none">
                  <span className="px-3 py-1.5 bg-black/85 backdrop-blur-md border border-[#00BFFF]/40 text-[#00BFFF] font-mono text-xs uppercase font-bold rounded-lg tracking-wider flex items-center gap-1.5 shadow-xl">
                    <ZoomIn className="w-3.5 h-3.5" /> Full Poster
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] px-1">
                <span>Official Workshop Poster</span>
                <span className="text-[#00BFFF] group-hover:underline">Click to Expand ↗</span>
              </div>
            </div>
          </div>

          {/* Right: Event Information & Header */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-[#00BFFF] bg-[#00BFFF]/10 border border-[#00BFFF]/30 py-0.5 px-3 rounded font-bold uppercase tracking-wider">
                  {event.category?.toUpperCase() || "WORKSHOP"}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 py-0.5 px-3 rounded font-bold uppercase tracking-wider">
                  UPCOMING
                </span>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 py-0.5 px-3 rounded font-bold uppercase tracking-wider">
                  IMSUC GHAZIABAD
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display uppercase tracking-tight text-white font-extrabold leading-[1.1]">
                {event.title}
              </h1>

              {tagline && (
                <div className="flex items-center gap-2 pt-1 text-[#00BFFF] font-mono font-bold tracking-[0.25em] text-xs sm:text-sm uppercase">
                  <Terminal className="w-4 h-4 text-[#00BFFF] shrink-0" />
                  <span>{tagline}</span>
                </div>
              )}
            </div>

            {/* Event Description */}
            <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed font-sans font-light border-l-2 border-[#00BFFF]/40 pl-4 py-1">
              {event.description}
            </p>

            {/* Date, Time & Venue Key Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-white/10 bg-[#0F1115]/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#9CA3AF] tracking-wider block">Date & Day</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-white block">{event.rawDate || event.date}</span>
                  <span className="text-[11px] font-sans text-[#9CA3AF]">Friday</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-[#0F1115]/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#9CA3AF] tracking-wider block">Session Timing</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-white block">{event.time}</span>
                  <span className="text-[11px] font-sans text-[#9CA3AF]">Indian Standard Time (IST)</span>
                </div>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl border border-white/10 bg-[#0F1115]/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/20 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#9CA3AF] tracking-wider block">Venue</span>
                  <span className="text-xs sm:text-sm font-sans font-semibold text-white block">{event.venue}</span>
                  <span className="text-[11px] font-mono text-[#00BFFF]">Auditorium • IMSUC Ghaziabad</span>
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="p-4 rounded-xl border border-[#00BFFF]/25 bg-gradient-to-r from-[#00BFFF]/10 via-[#0A192F]/40 to-transparent flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-[#00BFFF]">
                  <Shield className="w-3.5 h-3.5 text-[#00BFFF]" />
                  <span>REGISTRATION DESK ACTIVE</span>
                </div>
                <p className="text-xs text-[#E5E7EB] font-sans">
                  Official Google Form registration is open. Secure your workshop pass now.
                </p>
              </div>

              <div className="shrink-0 flex items-center">
                <a
                  href={event.externalLink || "https://docs.google.com/forms/d/e/1FAIpQLSdbSMHXwTHOOgAwZzKoWrhFbvbc__MyOve3Ik50tIhFepz2Iw/viewform?usp=dialog"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#1E90FF]/20 border border-[#1E90FF]/40 text-xs font-mono uppercase font-bold text-white tracking-widest text-center shadow-[0_0_15px_rgba(30,144,255,0.3)] hover:bg-[#1E90FF]/30 transition-all cursor-pointer inline-block"
                >
                  SECURE PASS ↗
                </a>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {event.tags && event.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono text-[#9CA3AF] bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION: GUEST SPEAKER & KEY HIGHLIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          
          {/* Guest Speaker Spotlight */}
          <div className="md:col-span-5 space-y-4">
            <div className="border-b border-white/10 pb-2">
              <span className="text-xs font-mono uppercase text-[#00BFFF] tracking-widest font-semibold block">DISTINGUISHED SPEAKER</span>
              <h2 className="text-xl font-display uppercase font-bold text-white">Guest Speaker</h2>
            </div>

            <div className="p-6 rounded-2xl border border-white/15 bg-[#0F1115]/70 glass-panel relative overflow-hidden space-y-5">
              {/* Corner Cyber Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#00BFFF]/20 to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-4">
                {speaker?.photo ? (
                  <div className="relative shrink-0">
                    <img 
                      src={speaker.photo} 
                      alt={speaker.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#00BFFF]/40 shadow-xl"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#05070A] rounded-full border border-[#00BFFF]/40">
                      <Shield className="w-3.5 h-3.5 text-[#00BFFF]" />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#00BFFF]/10 border border-[#00BFFF]/30 flex items-center justify-center text-[#00BFFF] shrink-0">
                    <Shield className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00BFFF] font-bold block">
                    GUEST SPEAKER
                  </span>
                  <h3 className="text-lg sm:text-xl font-display uppercase font-bold text-white">
                    {speaker?.name || "Mr. Vikas Kumar"}
                  </h3>
                </div>
              </div>

              {/* Speaker Designations */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                {speaker?.designation?.map((des, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#D1D5DB] font-sans">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] mt-1.5 shrink-0" />
                    <span>{des}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="md:col-span-7 space-y-4">
            <div className="border-b border-white/10 pb-2">
              <span className="text-xs font-mono uppercase text-[#00BFFF] tracking-widest font-semibold block">CURRICULUM & VALUE</span>
              <h2 className="text-xl font-display uppercase font-bold text-white">Key Highlights</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {highlights.map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl border border-white/10 bg-[#0F1115]/50 hover:border-[#00BFFF]/30 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-[#00BFFF]/10 border border-[#00BFFF]/20 group-hover:bg-[#00BFFF]/20 transition-colors">
                      {highlightIcons[index % highlightIcons.length]}
                    </div>
                    <span className="text-[10px] font-mono text-[#6B7280]">0{index + 1}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans font-medium text-[#E5E7EB] leading-snug">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CLOSING MESSAGE BANNER */}
        <div className="p-6 rounded-2xl border border-[#00BFFF]/30 bg-[#05070A]/90 relative overflow-hidden shadow-2xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00BFFF]/10 border border-[#00BFFF]/30 text-[#00BFFF] text-[10px] font-mono uppercase font-bold tracking-widest">
            <Shield className="w-3.5 h-3.5" /> DIGITAL DEFENSE MOTTO
          </div>
          
          <blockquote className="text-lg sm:text-2xl font-display uppercase tracking-wider text-white font-extrabold max-w-2xl mx-auto leading-relaxed">
            “{closingMessage}”
          </blockquote>

          <p className="text-xs font-mono text-[#9CA3AF] tracking-widest uppercase">
            IMS Ghaziabad (University Courses Campus) • Code Catalyst Club
          </p>
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close poster preview"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center justify-center p-2">
            <img 
              src={event.image || "/cyber-defense-poster.jpg"} 
              alt={event.title}
              className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
