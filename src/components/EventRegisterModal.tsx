import React, { useState, useEffect } from "react";
import { X, CheckCircle, Ticket, Github, Sparkles, User, Mail, Users, ArrowRight } from "lucide-react";
import { EventItem } from "../types";

interface EventRegisterModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { id: string; name: string; email: string; github: string; role: string } | null;
  onSuccess?: () => void;
}

export default function EventRegisterModal({ event, isOpen, onClose, currentUser, onSuccess }: EventRegisterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    github: "",
    teamSize: "1",
    interests: "web3_ai"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");

  // Automatically pre-populate default profiles for members/admins
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || "",
        email: currentUser.email || "",
        github: currentUser.github || ""
      }));
    } else {
      setFormData({
        name: "",
        email: "",
        github: "",
        teamSize: "1",
        interests: "web3_ai"
      });
    }
    setIsSuccess(false);
    setErrorText("");
  }, [currentUser, event, isOpen]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorText("");

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventId: event.id,
          userId: currentUser?.id || null, // pass modern id if logged in
          name: formData.name,
          email: formData.email,
          github: formData.github,
          teamSize: formData.teamSize,
          techFocus: formData.interests
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to finalize registration.");
      }

      // Create a ticket serial signature based on server returns
      const uniquePasscode = result.registration.id.toUpperCase();
      setTicketNumber(uniquePasscode);
      setIsSuccess(true);
      
      // Notify parent applet to refresh database cache (events list spots left, registrations metrics, etc.)
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorText(err.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      github: "",
      teamSize: "1",
      interests: "web3_ai"
    });
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" id="registration-modal-root">
      {/* Blurry dim overlay */}
      <div 
        className="absolute inset-0 bg-brand-bg/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main card box widget */}
      <div className="relative w-full max-w-xl bg-[#0d0f13] border border-white/10 rounded-xl overflow-hidden shadow-2xl glass-panel text-white animate-scale-up">
        
        {/* Header bar */}
        <div className="p-5 border-b border-white/5 bg-brand-bg-sec flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary-blue/15 text-neon-blue">
              <Ticket className="w-4 h-4 text-neon-blue" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold uppercase tracking-widest text-white">Event Pass Registry</h3>
              <p className="text-[10px] font-mono text-neon-blue">REGISTER: {event.title}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 rounded-full hover:bg-white/5 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success ticket view design */}
        {isSuccess ? (
          <div className="p-6 md:p-8 space-y-6 text-center">
            
            {/* Animating success checkmark */}
            <div className="w-12 h-12 rounded-full bg-emerald-green/10 text-emerald-green flex items-center justify-center mx-auto mb-4 border border-emerald-green/30">
              <CheckCircle className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h4 className="text-xl font-display uppercase tracking-wider text-white">Registration Secured!</h4>
              <p className="text-xs text-[#9CA3AF] mt-1 font-mono">Your unique community developer pass has been generated:</p>
            </div>

            {/* Virtual Hologram Pass ticket card container */}
            <div className="relative max-w-md mx-auto bg-gradient-to-br from-[#111827] to-[#1F2937] border border-white/10 p-5 rounded-lg text-left overflow-hidden shadow-lg select-none">
              
              {/* Absolutes decorative visual elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full filter blur-xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-saffron/10 rounded-full filter blur-xl" />
              
              {/* Ticket content */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="text-[9px] font-mono bg-neon-blue/20 text-[#00BFFF] px-2 py-0.5 rounded font-semibold uppercase tracking-widest">
                    TECH YUVA COHORT
                  </span>
                  <p className="text-sm font-display uppercase tracking-wide text-white mt-2 mb-1">{event.title}</p>
                  <p className="text-[10px] font-mono text-[#9CA3AF]">{event.date} • {event.time}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-[#9CA3AF] block uppercase">SERIAL PASS</span>
                  <span className="text-xs font-mono font-bold text-white tracking-widest">{ticketNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-mono text-[#9CA3AF] block uppercase">DEVELOPER</span>
                  <span className="text-xs font-sans font-semibold text-white truncate max-w-full block">{formData.name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-[#9CA3AF] block uppercase">GITHUB HANDLER</span>
                  <span className="text-xs font-mono text-neon-blue flex items-center gap-1">
                    <Github className="w-3.5 h-3.5 text-[#00BFFF]" />
                    {formData.github.startsWith("@") ? formData.github : `@${formData.github}`}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-[#9CA3AF] block uppercase">VENUE ENTRANCE</span>
                  <span className="text-[10.5px] font-sans text-white truncate text-ellipsis">{event.venue}</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-[#9CA3AF] block uppercase">STATUS PATH</span>
                  <span className="text-[10.5px] font-sans text-emerald-green font-semibold">✓ CONFIRMED PASS</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="mt-5 pt-4 border-t border-dashed border-white/10 flex flex-col items-center justify-center gap-1 bg-[#0a0c10]/50 p-2 rounded">
                <div className="flex gap-0.5 justify-center h-8 w-full opacity-60">
                  {[1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 1].map((val, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white shrink-0" 
                      style={{ width: `${val}px` }} 
                    />
                  ))}
                </div>
                <span className="text-[8px] font-mono text-[#9CA3AF] select-all uppercase">SECURE PASS ID: {ticketNumber}</span>
              </div>

            </div>

            <p className="text-[11px] text-[#9CA3AF] max-w-sm mx-auto font-sans">
              An invitation receipt and workspace setup details have been routed to <span className="text-white font-semibold font-mono">{formData.email}</span>. Use the barcode to register on-site at the login desk.
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-mono transition-colors cursor-pointer border border-white/10 block mx-auto"
            >
              DISMISS PASSPORT
            </button>

          </div>
        ) : (
          /* Input Form state */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
            
            {errorText && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-xs text-red-400 rounded font-sans leading-relaxed">
                ⚠️ <b>Security Registry Notice:</b> {errorText}
              </div>
            )}

            <div className="p-3 bg-brand-bg-sec border border-white/5 text-xs text-[#9CA3AF] leading-relaxed rounded flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
              <span>
                <b>Spots remaining:</b> {event.spotsLeft || 25} seats are vacant in our current registry batch. Complete your pass reservation to avoid waiting lists.
              </span>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Developer Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Lakshay Soni"
                    className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-sans"
                    id="reg-input-name"
                  />
                </div>
              </div>

              {/* Email ID */}
              <div>
                <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Secure Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., lakshay@example.com"
                    className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-mono"
                    id="reg-input-email"
                  />
                </div>
              </div>

              {/* GitHub Handle */}
              <div>
                <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">GitHub Username</label>
                <div className="relative">
                  <Github className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="e.g., lakshay-soni"
                    className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-mono"
                    id="reg-input-github"
                  />
                </div>
              </div>

              {/* Team Size & Core Focus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Team Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                    <select
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                      className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-sans"
                    >
                      <option value="1">Solo Builder (1)</option>
                      <option value="2">Duo Team (2)</option>
                      <option value="3">Trio Syndicate (3)</option>
                      <option value="4">Quad Squad (4)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Core Tech Focus</label>
                  <select
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-sans"
                  >
                    <option value="web3_ai">AI + Web3 Implementations</option>
                    <option value="frontend_dev">Vercel/Stripe Grade UIs</option>
                    <option value="backend_sys">Node Core Systems</option>
                    <option value="startup_mvp">Startup Founders Track</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-blue to-neon-blue text-white rounded font-sans text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-40 select-none cursor-pointer"
                id="reg-submit-btn"
              >
                {isSubmitting ? "GENERATING PASS..." : "SECURE MY CODE PASS"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
