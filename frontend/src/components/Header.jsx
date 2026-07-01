import React from "react";

export default function Header({ modelReady }) {
  return (
    <header className="relative z-10 border-b border-cyber-border bg-cyber-darker/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-glow-blue">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide text-glow-blue">
              CyberShield <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-xs text-cyber-muted font-mono">AI Scam Message Checker</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-card border border-cyber-border">
          <span className={`w-2 h-2 rounded-full ${modelReady ? "bg-cyber-safe animate-pulse" : "bg-cyber-warn animate-pulse"}`} />
          <span className={`text-xs font-mono ${modelReady ? "text-cyber-safe" : "text-cyber-warn"}`}>
            {modelReady ? "AI Model Online" : "AI Loading…"}
          </span>
        </div>
      </div>
    </header>
  );
}
