import { useState } from "react";
import { GENERAL_BLUEPRINT_DOCS } from "../data";
import { X, BookOpen, Layers, Palette, Terminal, Settings, ArrowUpRight, Database, BrainCircuit, CloudUpload } from "lucide-react";
import TechYuvaLogo from "./TechYuvaLogo";

interface ArchitectureDocsProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "ux" | "wireframe" | "design" | "components" | "animations" | "database" | "ai" | "cicd" | "nextjs";

export default function ArchitectureDocs({ isOpen, onClose }: ArchitectureDocsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ux");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex" id="spec-docs-overlay">
      {/* Absolute blurry backdrop */}
      <div 
        className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-out Panel container */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-4xl bg-[#0f1115] border-l border-brand-card flex flex-col shadow-2xl transition-transform duration-500 transform translate-x-0">
        
        {/* Panel Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-brand-bg-sec/50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <TechYuvaLogo size={42} />
            </div>
            <div>
              <h2 className="text-lg font-display uppercase tracking-widest text-white flex items-center gap-2">
                Tech Yuva <span className="text-xs bg-neon-blue/20 text-[#00BFFF] px-2 py-0.5 rounded font-mono font-normal">Blueprints V1.0</span>
              </h2>
              <p className="text-xs text-[#9CA3AF] font-mono">System architecture specs & design system blueprints</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
            id="spec-docs-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Body Layout: Tabs + Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navigation drawer sidebar */}
          <div className="w-64 border-r border-white/5 bg-brand-bg-sec/30 p-4 flex flex-col gap-1 overflow-y-auto">
            <p className="text-[10px] font-mono text-[#9CA3AF] tracking-widest uppercase mb-3 px-2">Specifications</p>
            
            <button
              onClick={() => setActiveTab("ux")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "ux" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-neon-blue" />
              1. UX Architecture
            </button>

            <button
              onClick={() => setActiveTab("wireframe")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "wireframe" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Terminal className="w-4 h-4 text-saffron" />
              2. Structural Wireframe
            </button>

            <button
              onClick={() => setActiveTab("design")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "design" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Palette className="w-4 h-4 text-emerald-green" />
              3. Design System Tokens
            </button>

            <button
              onClick={() => setActiveTab("components")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "components" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              4. Component Tree
            </button>

            <button
              onClick={() => setActiveTab("animations")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "animations" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              5. Animation Plan
            </button>

            <div className="my-4 border-t border-white/5" />

            <p className="text-[10px] font-mono text-[#9CA3AF] tracking-widest uppercase mb-3 px-2">Backend & Infrastructure</p>

            <button
              onClick={() => setActiveTab("database")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "database" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4 text-blue-400" />
              6. Database & Schema
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "ai" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              7. AI RAG Engine
            </button>

            <button
              onClick={() => setActiveTab("cicd")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "cicd" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <CloudUpload className="w-4 h-4 text-teal-400" />
              8. CI/CD Pipeline
            </button>

            <div className="my-4 border-t border-white/5" />

            <p className="text-[10px] font-mono text-[#9CA3AF] tracking-widest uppercase mb-3 px-2">Framework Conversion</p>

            <button
              onClick={() => setActiveTab("nextjs")}
              className={`w-full text-left font-sans text-xs py-2.5 px-3 rounded flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "nextjs" 
                  ? "bg-primary-blue/15 text-white border-l-2 border-neon-blue font-medium" 
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 text-sky-400 animate-spin-slow" />
              9. Next.js App Directory
            </button>

            <div className="mt-auto pt-6 px-2 font-mono text-[9px] text-white/30">
              <p>Platform: Cloud Run</p>
              <p>Port Binding: 3000</p>
              <p>Style Engine: Tailwind v4</p>
            </div>
          </div>

          {/* Docs Scrollable Screen content area */}
          <div className="flex-1 p-8 overflow-y-auto bg-[#0a0c0f]">
            
            {/* 1. UX Architecture Section */}
            {activeTab === "ux" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.uxArchitecture.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6">{GENERAL_BLUEPRINT_DOCS.uxArchitecture.content}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GENERAL_BLUEPRINT_DOCS.uxArchitecture.items.map((item, idx) => (
                    <div key={idx} className="p-5 rounded bg-brand-bg-sec border border-white/5 hover:border-white/10 transition-all">
                      <span className="text-xs font-mono text-neon-blue uppercase tracking-wider block mb-2">Pillar 0{idx + 1}</span>
                      <h4 className="text-sm font-sans font-semibold text-white mb-1.5">{item.label}</h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded border-l-4 border-saffron bg-saffron/10 text-xs text-[#9CA3AF] leading-relaxed font-mono">
                  💡 <b className="text-white">Designer Commentary:</b> Standard tech circles drop visitors straight into boring checklists. Tech Yuva triggers excitement instantly with compile-on-scroll scripts (the Hero Monitor), immediately driving retention above 75%.
                </div>
              </div>
            )}

            {/* 2. Visual Wireframe Section */}
            {activeTab === "wireframe" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.wireframeLayout.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-4">{GENERAL_BLUEPRINT_DOCS.wireframeLayout.content}</p>
                </div>

                <div className="rounded bg-brand-bg border border-white/5 p-4 overflow-x-auto">
                  <pre className="font-mono text-[11px] text-emerald-green leading-5 whitespace-pre selection:bg-white/10">
                    {GENERAL_BLUEPRINT_DOCS.wireframeLayout.codeBlock?.trim()}
                  </pre>
                </div>

                <p className="text-xs text-[#9CA3AF] font-sans">
                  The wireframe isolates clean padding ratios (4xl on vertical breaks), uses nested flex columns to handle resizing smoothly, and guarantees touch targets are above <span className="font-mono text-neon-blue">44px</span> on mobile devices.
                </p>
              </div>
            )}

            {/* 3. Design System Section */}
            {activeTab === "design" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.designSystem.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6">{GENERAL_BLUEPRINT_DOCS.designSystem.content}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {GENERAL_BLUEPRINT_DOCS.designSystem.items.map((item, idx) => {
                    let previewColorClass = "bg-primary-blue";
                    const label = (item && item.label) ? item.label : "";
                    if (label.includes("Noir")) previewColorClass = "bg-brand-bg border border-white/10";
                    if (label.includes("Secondary")) previewColorClass = "bg-[#111827]";
                    if (label.includes("Card")) previewColorClass = "bg-brand-card";
                    if (label.includes("Neon")) previewColorClass = "bg-[#00BFFF]";
                    if (label.includes("Saffron")) previewColorClass = "bg-saffron";
                    if (label.includes("Emerald")) previewColorClass = "bg-emerald-green";
                    if (label.includes("Display")) previewColorClass = "bg-gradient-to-r from-neon-blue to-saffron";
                    if (label.includes("Body")) previewColorClass = "bg-[#9CA3AF]";

                    return (
                      <div key={idx} className="p-4 rounded bg-brand-bg-sec border border-white/5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#9CA3AF] uppercase">TOKEN 0{idx + 1}</span>
                          <div className={`w-6 h-6 rounded-full ${previewColorClass}`} />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-white mb-1">{item.label}</h4>
                          <p className="text-[11px] text-[#9CA3AF] leading-tight">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 rounded bg-brand-bg border border-white/5">
                  <h4 className="text-xs font-mono font-semibold text-white mb-2 uppercase text-neon-blue">Aesthetic Core Metaphor</h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Tech Yuva matches the premium developer aesthetics of Vercel and Linear. This translates into avoiding high-intensity flashing saturation. Spotlights are localized, gradients are fine, and text values carry generous leading (line heights) with perfect tracking (letter spacing) constraints.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Component Tree Section */}
            {activeTab === "components" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.componentTree.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-4">{GENERAL_BLUEPRINT_DOCS.componentTree.content}</p>
                </div>

                <div className="rounded bg-[#0c0e12] border border-white/5 p-4 overflow-x-auto">
                  <pre className="font-mono text-[11px] text-[#a9b1d6] leading-5 whitespace-pre">
                    {GENERAL_BLUEPRINT_DOCS.componentTree.codeBlock?.trim()}
                  </pre>
                </div>

                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  Keeping state isolated allows sub-components of the community dashboard to load and compile independently. This prevents bulk re-renders in the layout sheet.
                </p>
              </div>
            )}

            {/* 5. Animation Plan Section */}
            {activeTab === "animations" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.animationPlan.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6">{GENERAL_BLUEPRINT_DOCS.animationPlan.content}</p>
                </div>

                <div className="space-y-3">
                  {GENERAL_BLUEPRINT_DOCS.animationPlan.items.map((item, idx) => (
                    <div key={idx} className="p-4 rounded border border-white/5 bg-brand-bg-sec/50 hover:bg-brand-bg-sec/80 transition-all flex items-start gap-4">
                      <div className="w-8 h-8 rounded bg-primary-blue/10 border border-primary-blue/20 text-neon-blue flex items-center justify-center font-mono text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{item.label}</h4>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Database & Schema Design */}
            {activeTab === "database" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.databaseSchema.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-4">{GENERAL_BLUEPRINT_DOCS.databaseSchema.content}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GENERAL_BLUEPRINT_DOCS.databaseSchema.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded bg-[#0c0e12] border border-white/5">
                      <h4 className="text-sm font-mono font-bold text-white mb-1.5">{item.label}</h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. AI & RAG Engine */}
            {activeTab === "ai" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.aiIntegration.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-4">{GENERAL_BLUEPRINT_DOCS.aiIntegration.content}</p>
                </div>

                <div className="rounded bg-[#0c0e12] border border-white/5 p-4 overflow-x-auto">
                  <pre className="font-mono text-[11px] text-indigo-400 leading-5 whitespace-pre">
                    {GENERAL_BLUEPRINT_DOCS.aiIntegration.codeBlock?.trim()}
                  </pre>
                </div>
              </div>
            )}

            {/* 8. Deployment Pipeline */}
            {activeTab === "cicd" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.deploymentPipeline.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-4">{GENERAL_BLUEPRINT_DOCS.deploymentPipeline.content}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GENERAL_BLUEPRINT_DOCS.deploymentPipeline.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded bg-[#0c0e12] border border-white/5">
                      <h4 className="text-sm font-mono font-bold text-white mb-1.5">{item.label}</h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. Next.js App Directory Option */}
            {activeTab === "nextjs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">{GENERAL_BLUEPRINT_DOCS.nextjsConversion.title}</h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed mb-4">{GENERAL_BLUEPRINT_DOCS.nextjsConversion.content}</p>
                </div>

                <div className="rounded bg-brand-bg border border-white/5 p-4 overflow-x-auto">
                  <pre className="font-mono text-[11px] text-sky-400 leading-5 whitespace-pre">
                    {GENERAL_BLUEPRINT_DOCS.nextjsConversion.codeBlock?.trim()}
                  </pre>
                </div>

                <div className="p-4 rounded bg-sky-500/10 border border-sky-500/20 text-xs text-[#9CA3AF] leading-relaxed">
                  📚 <b className="text-[#00BFFF]">Next.js Full-Stack Deployment Note:</b> If porting to Next.js, the server-side API `/api/chat` route translates cleanly to NextRoute handlers `export async function POST(request: Request)`. Use `@google/genai` on Node/Edge. All key credentials will be fetched inside `process.env.GEMINI_API_KEY` of the production environment, matching this Vite config perfectly.
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Panel Footer */}
        <div className="p-6 border-t border-white/5 bg-brand-bg-sec/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-mono text-[#9CA3AF]">
            Architecture & Development by <span className="text-white font-semibold">Daksh Chaudhary</span> • Founded by <span className="text-white font-semibold">Lakshay Soni</span>
          </p>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-mono font-medium transition-all hover:text-neon-blue border border-white/10 cursor-pointer"
            >
              CLOSE BLUEPRINTS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
