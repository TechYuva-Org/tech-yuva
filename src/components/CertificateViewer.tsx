import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { X, Award, Shield, CheckCircle, Download, ExternalLink } from "lucide-react";
import TechYuvaLogo from "./TechYuvaLogo";

interface Certificate {
  id: string;
  registrationId: string;
  eventId: string;
  userId: string;
  recipientName: string;
  eventTitle: string;
  issueDate: string;
  verificationCode: string;
}

interface CertificateViewerProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CertificateViewer({ certificate, isOpen, onClose }: CertificateViewerProps) {
  const [printLoading, setPrintLoading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    setPrintLoading(true);
    // Standard trigger for browser standard printing targeting just this DOM element
    setTimeout(() => {
      window.print();
      setPrintLoading(false);
    }, 500);
  };

  const formattedDate = new Date(certificate.issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none" id="certificate-viewer-modal">
      {/* Blurry dark background overlay */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-[#090b0e] border border-[#1E90FF]/30 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col items-center">
        
        {/* Certificate Action Top Ribbon */}
        <div className="w-full p-4 border-b border-white/5 bg-brand-bg-sec/55 flex justify-between items-center px-6 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#00BFFF]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#9CA3AF]">Holographic Certificate Inspector</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={printLoading}
              className="px-4 py-1.5 bg-[#00BFFF]/10 border border-[#00BFFF]/30 text-white font-mono text-[11px] font-bold rounded hover:bg-[#00BFFF]/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              {printLoading ? "PREPARING..." : "PRINT / PDF PASSPORT"}
            </button>
            <button
              onClick={onClose}
              className="p-1 px-2.5 rounded-full hover:bg-white/5 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable/Screen Visual Certificate Layout Box */}
        <div className="p-8 md:p-12 w-full flex justify-center bg-[#07090c] relative print:p-0" ref={certRef}>
          
          {/* Neon Grid decoration */}
          <div className="absolute inset-0 grid-mesh opacity-[0.03]" />
          
          <div className="relative w-full max-w-3xl border-[3px] border-double border-white/10 p-6 md:p-10 rounded-xl bg-gradient-to-br from-[#0c0f14] to-[#040507] overflow-hidden text-center flex flex-col justify-between min-h-[480px]">
            
            {/* Corner Decorative Borders */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#1E90FF]/60" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#1E90FF]/60" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#1E90FF]/60" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#1E90FF]/60" />

            {/* Central watermark stamp */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none w-[360px] h-[360px]">
              <TechYuvaLogo size="100%" animated={false} />
            </div>

            {/* Header Content */}
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="w-8 h-px bg-gradient-to-r from-transparent to-[#00BFFF]" />
                <span className="text-[10px] font-mono text-[#00BFFF] uppercase tracking-[0.3em] font-bold">Tech Yuva Innovation Council</span>
                <span className="w-8 h-px bg-gradient-to-l from-transparent to-[#00BFFF]" />
              </div>
              <h2 className="text-xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#9CA3AF] to-white tracking-widest uppercase mb-1">
                CERTIFICATE OF ACHIEVEMENT
              </h2>
              <p className="text-[10px] font-mono text-[#9CA3AF] uppercase tracking-widest font-light">
                Secure Youth Engineering Credentials
              </p>
            </div>

            {/* Recipients Block */}
            <div className="my-8 space-y-6">
              <div className="space-y-1">
                <p className="text-xs text-secondary-text font-serif italic mb-2">This credential passport holds safe that</p>
                <h3 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-wide uppercase border-b border-white/5 pb-2 max-w-lg mx-auto">
                  {certificate.recipientName}
                </h3>
              </div>

              <div className="max-w-xl mx-auto py-2">
                <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans font-light">
                  has successfully completed high-performance agile sprint architectures, validated on-site at raw coordinate gates, and demonstrated production-ready engineering deployments during the elite student-led workshop & sprint:
                </p>
                <p className="text-md md:text-lg text-[#00BFFF] font-display font-semibold uppercase tracking-wider mt-3">
                  🚀 {certificate.eventTitle}
                </p>
              </div>
            </div>

            {/* Signatures & Telemetry block */}
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left items-end">
              
              {/* Code Verification Signature */}
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-[#9CA3AF] block uppercase">Verification Code</span>
                <span className="text-[11px] font-mono font-bold text-white tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#FF7A00]" />
                  {certificate.verificationCode}
                </span>
                <span className="text-[7px] font-mono text-[#a1a1a1]/40 block select-all">verified: true</span>
              </div>

              {/* Date Issued */}
              <div className="hidden sm:block text-center space-y-1">
                <span className="text-[8px] font-mono text-[#9CA3AF] block uppercase">Issued Date</span>
                <span className="text-xs font-sans text-white">{formattedDate}</span>
                <span className="text-[7px] font-mono text-[#a1a1a1]/40 block">COHORT 2026/02</span>
              </div>

              {/* Dynamic Design Signatures */}
              <div className="text-right space-y-2">
                <div className="inline-block border-b border-white/10 pb-1 pr-1">
                  {/* Creative handwritten styled font simulation */}
                  <span className="font-serif italic text-sm text-slate-300 pr-5 select-none font-semibold">
                    Daksh Chaudhary
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono text-[#00BFFF] block uppercase">Site Architect</span>
                  <span className="text-[6.5px] font-mono text-[#9CA3AF] block uppercase">Tech Yuva Council Org</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
