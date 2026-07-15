import React, { useState } from "react";
import { User, Mail, Github, LogOut, ShieldAlert, Award, Ticket, ArrowRight, Hourglass, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "visitor" | "member" | "admin";
  github: string;
  joinedAt: string;
}

interface MemberDashboardProps {
  currentUser: UserProfile | null;
  allEvents: any[];
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onViewCertificate: (cert: any) => void;
}

export default function MemberDashboard({
  currentUser,
  allEvents,
  onLogin,
  onLogout,
  onViewCertificate
}: MemberDashboardProps) {
  // Login input states
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Loading user registered events and certificates using TanStack Query
  const { data: myRegistrations = [], isLoading: isRegLoading } = useQuery({
    queryKey: ["myRegistrations", currentUser?.email],
    queryFn: async () => {
      const res = await fetch(`/api/registrations?email=${encodeURIComponent(currentUser!.email)}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    enabled: !!currentUser,
  });

  const { data: myCertificates = [], isLoading: isCertsLoading } = useQuery({
    queryKey: ["myCertificates", currentUser?.id],
    queryFn: async () => {
      const res = await fetch(`/api/certificates?userId=${currentUser!.id}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    },
    enabled: !!currentUser,
  });

  const dashboardLoading = isRegLoading || isCertsLoading;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    setLoading(true);
    setLoginError("");

    try {
      // Endpoint handles checking or dynamically creating user if not exists
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Portal connection failed.");
      }

      onLogin(data.user);
      setEmailInput("");
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "Failed to establish user connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !nameInput) return;

    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          name: nameInput,
          github: githubInput || "techyuva-dev"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration entry failed.");
      }

      onLogin(data.user);
      setEmailInput("");
      setNameInput("");
      setGithubInput("");
      setIsRegisterMode(false);
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "Failed to registers new developer.");
    } finally {
      setLoading(false);
    }
  };

  // Helper shortcut login buttons for frictionless review
  const handleQuickLogin = (email: string) => {
    setEmailInput(email);
    setLoginError("");
    // programmatic submit trigger
    setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok) {
          onLogin(data.user);
          setEmailInput("");
        } else {
          setLoginError(data.error || "Failed quick credentials.");
        }
      } catch (err) {
        setLoginError("Quick link failed.");
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // Switch role visual banner color
  const getBadgeClass = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 border-red-500/20 text-red-400";
      case "member": return "bg-[#00BFFF]/10 border-[#00BFFF]/20 text-[#00BFFF]";
      default: return "bg-slate-500/10 border-slate-500/20 text-slate-400";
    }
  };

  // Render Login state
  if (!currentUser) {
    return (
      <div className="bg-[#0c0f13]/60 border border-white/10 rounded-xl p-6 md:p-8 space-y-6 max-w-xl mx-auto" id="portal-auth-container">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono text-[#00BFFF] uppercase tracking-[0.2em] font-semibold block">INTELLIGENT DOORMAN</span>
          <h3 className="text-xl font-display uppercase font-bold text-white tracking-wider">
            {isRegisterMode ? "INITIALIZE NEW PASSPORT" : "SECURE GATES ACCESS"}
          </h3>
          <p className="text-xs text-secondary-text max-w-sm mx-auto font-sans">
            {isRegisterMode 
              ? "Register a fresh identity on Tech Yuva. Standard members query tickets & certificates." 
              : "Enter your secure email signature below to fetch passes and download certified achievements."}
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-xs text-red-400 rounded text-center">
            ⚠️ <b>Gate rejection:</b> {loginError}
          </div>
        )}

        {isRegisterMode ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-secondary-text uppercase block mb-1">Developer Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g., Lakshay Soni"
                    className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-secondary-text uppercase block mb-1">Secure Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g., lakshay@techyuva.org"
                    className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-secondary-text uppercase block mb-1">GitHub Username</label>
                <div className="relative">
                  <Github className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={githubInput}
                    onChange={(e) => setGithubInput(e.target.value)}
                    placeholder="e.g., lakshay-soni (optional)"
                    className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-white rounded font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? "INITIALIZING ID..." : "SIGN UP NEW MEMBER"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-secondary-text uppercase block mb-1">Account Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g., lakshay@techyuva.org"
                  className="w-full bg-brand-bg p-2 pl-9 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-primary-blue to-neon-blue text-white rounded font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? "GATES CLEARING..." : "ENTER MEMBER ROOM"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Auth Mode Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setLoginError("");
            }}
            className="text-xs text-secondary-text hover:text-white underline font-mono cursor-pointer"
          >
            {isRegisterMode ? "Already registered? Sign In instead" : "New candidate? Create custom account here"}
          </button>
        </div>

        {/* Quick links header */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="text-center">
            <span className="text-[9px] font-mono text-[#9CA3AF] uppercase tracking-widest block mb-2">⚡ DEMONSTRATOR PERSPECTIVES (FAST LOGIN)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("lakshay@techyuva.org")}
              className="px-3 py-2 bg-brand-bg-sec border border-[#00BFFF]/20 text-[11px] font-mono text-[#00BFFF] font-semibold rounded hover:bg-[#00BFFF]/10 text-left flex items-center justify-between"
            >
              <span>👤 Lakshay (Member)</span>
              <span className="text-[9px] text-[#9CA3AF]">lakshay@...</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("dakshchaudhary2668@gmail.com")}
              className="px-3 py-2 bg-brand-bg-sec border border-red-500/20 text-[11px] font-mono text-red-400 font-semibold rounded hover:bg-red-500/10 text-left flex items-center justify-between"
            >
              <span>👑 Lakshay (Admin ID)</span>
              <span className="text-[9px] text-[#9CA3AF]">lakshay@...</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Logged in state dashboard
  return (
    <div className="space-y-8" id="member-profile-active">
      
      {/* Mini Profile HUD */}
      <div className="rounded-xl border border-white/10 bg-[#0d0f13]/40 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-white/20 bg-brand-bg-sec flex items-center justify-center text-white font-extrabold text-lg uppercase select-none">
            {currentUser.name ? currentUser.name[0] : "U"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-display font-semibold text-white uppercase tracking-wide">
                {currentUser.name || "Default Developer"}
              </h3>
              <span className={`text-[9px] font-mono uppercase tracking-widest border font-bold px-2 py-0.5 rounded ${getBadgeClass(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-secondary-text">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {currentUser.email}</span>
              {currentUser.github && (
                <span className="flex items-center gap-1">
                  <Github className="w-3 h-3 text-[#00BFFF]" /> 
                  @{currentUser.github}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-1.5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-xs text-secondary-text hover:text-red-400 font-mono flex items-center gap-1 bg-[#090b0e] rounded transition-all cursor-pointer block self-end md:self-center"
        >
          <LogOut className="w-3.5 h-3.5" /> LOG OUT SESSION
        </button>
      </div>

      {dashboardLoading ? (
        <div className="text-center py-12 font-mono text-xs text-secondary-text">
          <span className="inline-block animate-pulse">SYNCHRONIZING SECURE TELEMETRY CACHE...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SECURED PASS CODES LEFT */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#00BFFF]" />
              <h4 className="text-sm font-display font-bold uppercase tracking-widest text-white">
                MY SECURED PASSES ({myRegistrations.length})
              </h4>
            </div>

            {myRegistrations.length === 0 ? (
              <div className="p-8 border border-white/5 bg-[#0e1115]/30 rounded-xl text-center space-y-2">
                <p className="text-xs text-secondary-text font-sans">No code gateways registered for this email signature.</p>
                <p className="text-[10px] font-mono text-[#00BFFF]">Select an Expedition above and click "SECURE PASS" to register instantly!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRegistrations.map((reg) => {
                  // find the matched event details
                  const evt = allEvents.find(e => e.id === reg.eventId);
                  return (
                    <div 
                      key={reg.id}
                      className="p-4 border border-white/10 bg-[#0d0f13]/80 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/20 transition-all shadow"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white font-bold tracking-wider">
                            ID: {reg.id.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-[#00BFFF]">
                            Focus: {reg.techFocus === "web3_ai" ? "AI+Web3" : reg.techFocus === "frontend_dev" ? "UI/UX" : "Systems"}
                          </span>
                        </div>
                        <h5 className="text-sm font-display font-bold text-white uppercase tracking-wide">
                          {evt ? evt.title : "Tech Yuva Cohort Sprints"}
                        </h5>
                        <p className="text-[10px] font-mono text-[#9CA3AF]">
                          Date registered: {new Date(reg.registeredAt).toLocaleDateString()} • Team of {reg.teamSize}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {reg.attended ? (
                          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold rounded flex items-center gap-1 uppercase select-none">
                            <ShieldCheck className="w-3.5 h-3.5" /> ATTENDED OK
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-saffron/10 border border-saffron/20 text-saffron font-mono text-[9px] font-bold rounded flex items-center gap-1 uppercase select-none">
                            <Hourglass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} /> GATE WAITING
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DYNAMIC EARNED CERTIFICATES RIGHT */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF7A00]" />
              <h4 className="text-sm font-display font-bold uppercase tracking-widest text-white">
                EARNED CERTIFICATES ({myCertificates.length})
              </h4>
            </div>

            {myCertificates.length === 0 ? (
              <div className="p-8 border border-white/5 bg-[#0e1115]/30 rounded-xl text-center space-y-3 font-sans leading-relaxed">
                <p className="text-xs text-secondary-text">No cryptographic certificates minted yet.</p>
                <div className="text-[10px] text-[#9CA3AF] bg-brand-bg-sec/50 border border-white/5 p-3 rounded text-left">
                  <b>How to obtain a certificate:</b> 
                  <ul className="list-disc list-inside mt-1.5 space-y-1">
                    <li>Register for an event.</li>
                    <li>Toggle view to <b>Admin</b> to check your attendee box!</li>
                    <li>Mark that Event status as <b>Completed</b>. The server automatically mints and issues your verified certificate passport!</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {myCertificates.map((cert) => (
                  <div 
                    key={cert.id}
                    className="p-4 border border-[#FF7A00]/20 bg-[#0d0f13]/80 rounded-lg space-y-3 hover:border-[#FF7A00]/40 transition-all hover:bg-brand-bg-sec/45 cursor-pointer shadow-lg"
                    onClick={() => onViewCertificate(cert)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-[#FF7A00] bg-[#FF7A00]/10 px-2 py-0.5 rounded border border-[#FF7A00]/20 font-bold uppercase">
                          MINTED PASS
                        </span>
                        <h5 className="text-xs font-display font-bold text-white uppercase tracking-wider block mt-1.5">
                          {cert.eventTitle}
                        </h5>
                      </div>
                      <Award className="w-7 h-7 text-[#FF7A00] opacity-40 hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="text-[9px] font-mono text-[#9CA3AF]">
                        Code: {cert.verificationCode}
                      </span>
                      <button
                        type="button"
                        className="text-[10px] font-mono text-[#00BFFF] hover:underline flex items-center gap-0.5 cursor-pointer font-bold uppercase"
                      >
                        REVEAL ID <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
