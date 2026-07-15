import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Terminal, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ChatMessage } from "../types";
import TechYuvaLogo from "./TechYuvaLogo";

export default function TechYuvaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      text: "👋 Connection established. I am **YuvaAI 3.5**, your intelligent assistant for the Tech Yuva Community. Ask me about **YuvaHack 2026**, registering for workshops, or PitchCraft incubation pathways!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dismiss notification indicator after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        throw new Error("Local endpoint is booting or returned error.");
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "ai",
        text: data.text || "I was unable to retrieve a response from my cognitive layer. Let's retry!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("AI Assistant connection error:", err);
      // Inline intelligent fallback if backend model endpoint is preparing key setup
      setTimeout(() => {
        let fallbackText = "I apologize; my cognitive backend API route is initializing. To register, please use our **Join Community** application form below, or ask me directly about our upcoming timeline!";
        
        const lower = textToSend.toLowerCase();
        if (lower.includes("hack") || lower.includes("yuvahack")) {
          fallbackText = "🚀 **YuvaHack 2026** is our signature 36-hour physical hackathon this July 15-17. It brings together over 300 developers to build innovative solutions. Secure your spot via the **Upcoming Events** card or hit register!";
        } else if (lower.includes("workshop") || lower.includes("bootcamp")) {
          fallbackText = "📅 Our next big workshop is the **AI Builders Bootcamp** on July 30. We'll be writing full-stack systems using React and Vite with server-side LLMs! Spots are limited to 150 students.";
        } else if (lower.includes("join") || lower.includes("register")) {
          fallbackText = "Ready to build the future? You can join Tech Yuva by filling out the **Join Community** application form in the CTA section at the bottom of our web layout!";
        } else if (lower.includes("founder") || lower.includes("who made")) {
          fallbackText = "💡 Tech Yuva was founded by Lakshay Soni (Visionary Council Lead) and architected by Daksh Chaudhary (Technical Head & Site Architect) to bring Silicon Valley quality to the youth tech community.";
        }

        const fallbackMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai-fallback`,
          sender: "ai",
          text: fallbackText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFAQClick = (faqText: string) => {
    handleSendMessage(faqText);
  };

  const activeQuickQuestions = [
    "Tell me about Tech Yuva! 🚀",
    "Who built this site? 💡",
    "What upcoming events are on? 📅",
    "How does registration work? 🔑",
    "Who sponsors Tech Yuva? 💼"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" id="tech-yuva-ai-container">
      
      {/* Floating Spark notification snippet badge above toggle */}
      {showNotification && !isOpen && (
        <div 
          className="absolute right-0 bottom-16 w-72 p-3 rounded-lg bg-brand-bg-sec border border-neon-blue/30 shadow-xl flex items-start gap-2.5 animate-bounce mb-3 cursor-pointer"
          onClick={() => { setIsOpen(true); setShowNotification(false); }}
        >
          <div className="p-1 rounded bg-[#00BFFF]/10 text-neon-blue mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-mono text-[#00BFFF] font-bold uppercase tracking-wider">Live AI Assistant Online</p>
            <p className="text-xs text-[#9CA3AF] leading-tight">"Ask me about YuvaHack 2026 or pitch incubation routes!"</p>
          </div>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}
            className="text-[#9CA3AF] hover:text-white ml-auto"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Collapsed Trigger Badge */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => { setIsOpen(true); setShowNotification(false); }}
          className="w-14 h-14 rounded-full bg-[#05070A] hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-neon-blue/20 transition-all cursor-pointer relative group border border-[#1E90FF]/30 overflow-hidden"
          id="ai-widget-trigger"
        >
          <span className="absolute inset-0 rounded-full bg-neon-blue/10 animate-ping group-hover:animate-none" />
          <TechYuvaLogo size={42} />
        </button>
      ) : (
        /* Expanded Chat Console */
        <div 
          className="w-96 h-[500px] rounded-xl bg-[#0d0f13]/95 border border-white/10 shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-fade-in"
          id="ai-console-expanded"
        >
          {/* Header Title bar */}
          <div className="p-4 bg-brand-bg border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TechYuvaLogo size={24} />
              <div>
                <h4 className="text-xs font-display uppercase tracking-widest text-white flex items-center gap-1.5 font-bold mt-0.5">
                  YuvaAI <span className="text-[9px] bg-primary-blue/30 text-neon-blue px-1.5 py-0.2 rounded font-mono font-normal">v3.5</span>
                </h4>
                <p className="text-[10px] text-[#9CA3AF] font-mono">Community Cognitive Node</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/5 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat message streams */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-none bg-[#0a0c0e]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div 
                  className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-primary-blue text-white rounded-br-none" 
                      : "bg-brand-card/30 border border-white/5 text-[#f3f4f6] rounded-bl-none"
                  }`}
                >
                  {/* Simplistic formatted rendering */}
                  <span className="whitespace-pre-line">
                    {msg.text.split("**").map((part, partIdx) => 
                      partIdx % 2 === 1 ? <strong key={partIdx} className="text-neon-blue font-semibold">{part}</strong> : part
                    )}
                  </span>
                </div>
                <span className="text-[9px] text-[#9CA3AF] font-mono mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5 py-2">
                <Loader2 className="w-3.5 h-3.5 text-neon-blue animate-spin" />
                <span className="text-[10px] text-[#9CA3AF] font-mono tracking-widest uppercase">YuvaAI is compiling...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Chips bar */}
          <div className="p-2.5 border-t border-white/5 bg-brand-bg-sec/40">
            <p className="text-[9px] font-mono text-[#9CA3AF] uppercase mb-1.5 px-0.5">Recommended Queries:</p>
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full text-nowrap scrollbar-none">
              {activeQuickQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => handleFAQClick(q)}
                  className="px-2.5 py-1 text-[10px] rounded bg-brand-card hover:bg-brand-card-sec border border-white/5 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer text-ellipsis overflow-hidden font-mono"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat input box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
            className="p-3 border-t border-white/5 bg-[#0a0c0e] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything or register..."
              className="flex-1 bg-brand-card p-2 text-xs text-white rounded border border-white/5 focus:outline-none focus:border-neon-blue/50 placeholder:text-[#9CA3AF]"
              id="ai-console-input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 rounded bg-gradient-to-r from-[#1E90FF] to-[#00BFFF] hover:opacity-90 transition-opacity text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
