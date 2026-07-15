import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Settings, Plus, Edit3, Trash2, DownloadCloud, 
  CheckSquare, Square, RefreshCcw, Save, Calendar, MapPin, Tag, Check
} from "lucide-react";

interface AdminTerminalProps {
  currentUser: any;
  allEvents: any[];
  allRegistrations: any[];
  onTriggerRefresh: () => void;
  onLoginAsAdmin: () => void;
}

export default function AdminTerminal({
  currentUser,
  allEvents,
  allRegistrations,
  onTriggerRefresh,
  onLoginAsAdmin
}: AdminTerminalProps) {
  
  // Event CRUD states
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("bootcamp");
  const [date, setDate] = useState("");
  const [rawDate, setRawDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [description, setDescription] = useState("");
  const [spotsLeft, setSpotsLeft] = useState(25);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("upcoming");

  // Load selected event into form to start editing
  const handleStartEdit = (evt: any) => {
    setIsEditing(true);
    setEditingEventId(evt.id);
    setTitle(evt.title || "");
    setCategory(evt.category || "bootcamp");
    setDate(evt.date || "");
    setRawDate(evt.rawDate || new Date().toISOString().split("T")[0]);
    setTime(evt.time || "");
    setVenue(evt.venue || "");
    setTagsRaw(Array.isArray(evt.tags) ? evt.tags.join(", ") : "");
    setDescription(evt.description || "");
    setSpotsLeft(evt.spotsLeft !== undefined ? evt.spotsLeft : 25);
    setFeatured(!!evt.featured);
    setStatus(evt.status || "upcoming");
    
    // Smooth scroll user up to form
    const el = document.getElementById("admin-editor-title");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingEventId("");
    setTitle("");
    setCategory("bootcamp");
    setDate("");
    setRawDate(new Date().toISOString().split("T")[0]);
    setTime("");
    setVenue("");
    setTagsRaw("");
    setDescription("");
    setSpotsLeft(25);
    setFeatured(false);
    setStatus("upcoming");
    setFormError("");
  };

  // Submit create or edit API
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !venue) {
      setFormError("All key fields are required (Title, Description, Venue).");
      return;
    }

    setFormError("");
    setFormSuccess("");
    setActionLoading(true);

    const tagsArray = tagsRaw
      ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title,
      category,
      date: date || new Date(rawDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase(),
      rawDate,
      time: time || "10:00 AM - 4:00 PM (IST)",
      venue,
      tags: tagsArray,
      description,
      spotsLeft: Number(spotsLeft),
      featured,
      status
    };

    try {
      let response;
      if (isEditing) {
        // Edit existing Event row
        response = await fetch(`/api/events/${editingEventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new Event row
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed key operation.");
      }

      setFormSuccess(isEditing ? "Event row edited safely!" : "New Expedition created successfully!");
      resetForm();
      onTriggerRefresh(); // Trigger parent reload
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Endpoint error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete event row action
  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event from the backend database? This action is irreversible.")) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        onTriggerRefresh();
      } else {
        const d = await response.json();
        alert(d.error || "Delete failed.");
      }
    } catch (err) {
      console.error("Delete call failed", err);
    }
  };

  // Toggle user Attendance gate state
  const handleToggleAttendance = async (regId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/registrations/${regId}/attend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended: !currentStatus })
      });
      
      if (response.ok) {
        onTriggerRefresh(); // refresh counts
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Attendee toggling error.");
      }
    } catch (err) {
      console.error("Attendance post failed:", err);
    }
  };

  // Direct CSV Exporter string compiler
  const handleExportCSV = () => {
    if (allRegistrations.length === 0) {
      alert("No database registrations found to export yet.");
      return;
    }

    const headers = ["Registration ID", "Developer Name", "Email Address", "GitHub Handle", "Selected Event ID", "Event Title", "Team Size", "Core Tech Focus", "Checked In", "Registered Timestamp"];
    const rows = allRegistrations.map((reg) => {
      const matchedEvt = allEvents.find(e => e.id === reg.eventId);
      const evTitle = matchedEvt ? matchedEvt.title : "Unknown Event";
      return [
        reg.id,
        `"${reg.name.replace(/"/g, '""')}"`,
        reg.email,
        reg.github || "None",
        reg.eventId,
        `"${evTitle.replace(/"/g, '""')}"`,
        reg.teamSize || "1",
        reg.techFocus || "General AI",
        reg.attended ? "YES" : "NO",
        reg.registeredAt
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tech_yuva_registry_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lockscreen display if not logged-in as admin
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="bg-[#0c0f13]/60 border border-white/10 rounded-xl p-8 text-center max-w-xl mx-auto space-y-6" id="admin-lockscreen">
        <div className="w-12 h-12 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">RESTRICTED TERMINAL</h3>
          <p className="text-xs text-secondary-text max-w-sm mx-auto leading-relaxed">
            Authorized administrative keys required. Toggle your role session using the quick switch bypass below to query CRUD database logs.
          </p>
        </div>

        <button
          onClick={onLoginAsAdmin}
          className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-sans font-bold text-xs uppercase tracking-widest rounded transition-colors cursor-pointer w-full"
        >
          🔑 CONNECT AS ADMIN (LAKSHAY)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12" id="admin-terminal-root">
      
      {/* HUD Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-brand-bg-sec/30 font-mono">
          <p className="text-[10px] text-secondary-text uppercase">Total Registry Rows</p>
          <p className="text-2xl font-black text-white mt-1">{allRegistrations.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-brand-bg-sec/30 font-mono">
          <p className="text-[10px] text-secondary-text uppercase">Sprints in DB</p>
          <p className="text-2xl font-black text-[#00BFFF] mt-1">{allEvents.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-brand-bg-sec/30 font-mono">
          <p className="text-[10px] text-secondary-text uppercase">Attendee Check-Ins</p>
          <p className="text-2xl font-black text-emerald-green mt-1">
            {allRegistrations.filter(r => r.attended).length}
          </p>
        </div>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CRUD BUILDER BOX (Left column) */}
        <div className="lg:col-span-5 bg-[#0d1014]/65 border border-white/10 p-6 rounded-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-display font-medium uppercase tracking-widest text-[#00BFFF] flex items-center gap-2" id="admin-editor-title">
              <Settings className="w-4 h-4" /> 
              {isEditing ? "Modify Expedition Row" : "Spawn New Expedition"}
            </h3>
            {isEditing && (
              <button
                onClick={resetForm}
                className="text-[10px] font-mono text-secondary-text hover:text-white underline cursor-pointer"
              >
                CANCEL EDIT
              </button>
            )}
          </div>

          {formError && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-xs text-red-400 rounded">
              ⚠️ {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald- green text-[#10B981] rounded">
              ✓ {formSuccess}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Title / Description */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Event Master Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., NextGen Web3 Hack Sprint"
                  className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none focus:border-[#00BFFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Category Theme</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="bootcamp">Bootcamp</option>
                    <option value="symposium">Symposium</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">General Sprints</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Target Gate Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none font-semibold text-emerald-green"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="upcoming">Active/Upcoming</option>
                    <option value="completed">Completed (Issues Certificates)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Date Input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Calendar Deadline</label>
                  <input
                    type="date"
                    value={rawDate}
                    onChange={(e) => {
                      setRawDate(e.target.value);
                      // Reset custom input text date to let helper render
                      setDate("");
                    }}
                    className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Friendly Date (Override)</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. JUNE 25, 2026"
                    className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none font-mono placeholder:opacity-45"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Gate Entry Timer</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:00 AM - 4:00 PM"
                    className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Seats Capacity</label>
                  <input
                    type="number"
                    value={spotsLeft}
                    onChange={(e) => setSpotsLeft(Number(e.target.value))}
                    className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Gate Location Venue</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Lab 4B Auditorium, Core Block"
                  className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Tags (Comma separated lists)</label>
                <input
                  type="text"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="e.g., react, api, googlecloud"
                  className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#9CA3AF] uppercase block mb-1">Description Brief</label>
                <textarea
                  value={description}
                  required
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write clear session details..."
                  className="w-full bg-brand-bg p-2 text-xs text-white rounded border border-white/10 focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="bg-brand-bg rounded border-white/10 focus:ring-0 text-[#00BFFF]"
                />
                <label htmlFor="featured-check" className="text-[11px] font-sans text-[#9CA3AF] select-none block cursor-pointer">
                  Highlight as Featured Expedition Sprints
                </label>
              </div>

            </div>

            <div className="pt-4 border-t border-white/5 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded transition-colors flex-1 cursor-pointer"
              >
                CLEAR FIELDS
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-[#00BFFF] hover:bg-[#00BFFF]/90 text-black font-sans font-extrabold text-xs uppercase tracking-widest rounded transition-all flex-1 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {actionLoading ? "SAVING..." : isEditing ? "COMMIT ROW" : "PUBLISH PASS"}
              </button>
            </div>

          </form>

        </div>

        {/* ADMIN EVENT CONTROL LIST AND PARTICIPANTS (Right column) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* DATABASE EVENTS CONTROL ROOM */}
          <div className="bg-[#0b0c10]/40 border border-white/10 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-xs font-display font-bold uppercase text-white tracking-widest text-[#9CA3AF]">
                EVENT SCHEDULER INDEX ({allEvents.length})
              </h4>
              <span className="text-[9px] font-mono text-secondary-text">Click Modify to load editor</span>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {allEvents.map((evt) => (
                <div 
                  key={evt.id}
                  className="p-3 bg-brand-bg border border-white/5 flex items-center justify-between gap-3 rounded-lg hover:border-white/15"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold bg-[#00BFFF]/15 text-[#00BFFF] px-1.5 py-0.5 rounded uppercase">
                        {evt.status}
                      </span>
                      {evt.featured && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 rounded uppercase">Featured</span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white uppercase tracking-wide truncate block max-w-xs">{evt.title}</span>
                    <span className="text-[9px] font-mono text-secondary-text block">
                      ID: {evt.id} • Date: {evt.date} • {evt.spotsLeft} spots
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    <button
                      onClick={() => handleStartEdit(evt)}
                      className="p-1.5 border border-white/10 hover:border-[#00BFFF]/40 text-[#a0a0a0] hover:text-[#00BFFF] rounded transition-colors cursor-pointer"
                      title="Edit Campaign"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 border border-white/10 hover:border-red-500/40 text-[#a0a0a0] hover:text-red-400 rounded transition-colors cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MASTER PARTICIPANT REGISTRY TABLE */}
          <div className="bg-[#0b0c10]/40 border border-white/10 p-5 rounded-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
              <div className="space-y-0.5">
                <h4 className="text-xs font-display font-bold uppercase text-white tracking-widest text-[#9CA3AF]">
                  DEVELOPER ENTRANCE REGISTRY ({allRegistrations.length})
                </h4>
                <p className="text-[9px] font-mono text-secondary-text leading-none">Tap gate checkbox to mark candidate checked-in and issue pass</p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-[#FF7A00]/10 border border-[#FF7A00]/30 hover:bg-[#FF7A00]/20 text-[#FF7A00] font-mono text-[10px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer"
              >
                <DownloadCloud className="w-3.5 h-3.5" /> EXPORT REGISTRATION CSV
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto pr-1">
              {allRegistrations.length === 0 ? (
                <p className="text-xs text-secondary-text font-mono text-center py-8">Registry is currently vacant. No contestants registered.</p>
              ) : (
                <div className="space-y-2">
                  {allRegistrations.map((reg) => {
                    const matchedEvent = allEvents.find(e => e.id === reg.eventId);
                    return (
                      <div 
                        key={reg.id} 
                        className="p-3 border border-white/5 bg-brand-bg rounded-lg space-y-2 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-white/15"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white uppercase">{reg.name}</span>
                            <span className="text-[8px] font-mono text-[#9CA3AF] bg-[#0c0f13]/60 px-1.5 py-0.5 rounded border border-white/10">
                              PASS ID: {reg.id.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="font-mono text-[9px] text-secondary-text space-y-0.5">
                            <p className="truncate block max-w-xs">Email: <span className="text-slate-300">{reg.email}</span></p>
                            <p className="truncate block max-w-xs">Event: <span className="text-[#00BFFF] uppercase font-bold">{matchedEvent ? matchedEvent.title : reg.eventId}</span></p>
                          </div>
                        </div>

                        {/* Attendance checkpoint */}
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(reg.id, !!reg.attended)}
                          className={`px-3 py-1.5 rounded text-[10px] uppercase font-mono font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shrink-0 ml-auto sm:ml-0 ${
                            reg.attended 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                              : "bg-amber-500/5 border-amber-500/20 text-[#a0a0a0] hover:border-amber-500/40"
                          }`}
                        >
                          {reg.attended ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-green" />
                              <span>Checked In</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                              <span>Gate pending</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
