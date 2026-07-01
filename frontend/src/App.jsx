import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header.jsx";
import ResultCard from "./components/ResultCard.jsx";
import StatsBar from "./components/StatsBar.jsx";
import { analyzeMessage, checkHealth } from "./utils/api.js";

const SAMPLE_MESSAGES = [
  {
    label: "Prize Scam",
    text: "Congratulations! You've won $5,000,000 in the international lottery. Send your bank details to claim your prize immediately!",
  },
  {
    label: "Phishing",
    text: "URGENT: Your PayPal account is limited. Please confirm your information at: http://paypal-secure-update.com",
  },
  {
    label: "Safe Message",
    text: "Hey, are we still meeting for lunch tomorrow at noon? Let me know if you need to reschedule.",
  },
  {
    label: "Tech Support Scam",
    text: "WARNING: We detected a virus on your device! Call Microsoft Support immediately: 1-888-555-FAKE before it's too late!",
  },
  {
    label: "Safe Email",
    text: "Your Amazon order has shipped! Track your package at amazon.com with order number A123-456. Expected delivery: July 5th.",
  },
  {
    label: "Crypto Scam",
    text: "Bitcoin giveaway! Send 0.1 BTC and receive 1 BTC back! Elon Musk is doubling all Bitcoin for 24 hours only!",
  },
];

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-cyan-400 font-mono text-sm animate-pulse">Analyzing message…</p>
      <div className="flex gap-1.5">
        {["NLP", "TF-IDF", "AI Model"].map((step, i) => (
          <span key={step} className="text-xs text-cyber-muted font-mono px-2 py-0.5 bg-cyber-card border border-cyber-border rounded-full" style={{ animationDelay: `${i * 0.2}s` }}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

function CharCounter({ count, max }) {
  const pct = count / max;
  const color = pct > 0.9 ? "text-red-400" : pct > 0.7 ? "text-yellow-400" : "text-cyber-muted";
  return (
    <span className={`text-xs font-mono ${color}`}>
      {count}/{max}
    </span>
  );
}

export default function App() {
  const [message, setMessage]     = useState("");
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [modelReady, setModelReady] = useState(false);
  const [sampleOpen, setSampleOpen] = useState(false);
  const resultRef = useRef(null);
  const MAX_CHARS = 2000;

  // Health check on mount
  useEffect(() => {
    const poll = async () => {
      try {
        const health = await checkHealth();
        setModelReady(health.model_ready);
      } catch {
        setModelReady(false);
      }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async () => {
    const trimmed = message.trim();
    if (!trimmed) { setError("Please enter a message to analyze."); return; }
    if (trimmed.length < 5) { setError("Message is too short. Please enter at least 5 characters."); return; }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeMessage(trimmed);
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to analyze message. Is the backend running?";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessage("");
    setResult(null);
    setError("");
  };

  const handleSample = (text) => {
    setMessage(text);
    setResult(null);
    setError("");
    setSampleOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze();
  };

  return (
    <div className="min-h-screen bg-cyber-dark grid-bg">
      <Header modelReady={modelReady} />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-xs text-cyan-400 font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Powered by Machine Learning · TF-IDF + Logistic Regression
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
            Detect Scams{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Instantly
            </span>
          </h2>
          <p className="text-cyber-muted text-lg max-w-xl mx-auto">
            Paste any suspicious message — email, SMS, or chat — and our AI will analyze it in milliseconds.
          </p>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Input card */}
        <div className="bg-cyber-card border border-cyber-border rounded-2xl p-6 mb-6 cyber-glow">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Message to Analyze
            </label>
            <CharCounter count={message.length} max={MAX_CHARS} />
          </div>

          <textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setMessage(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Paste your suspicious message here…&#10;&#10;Example: 'Congratulations! You've won $1,000,000 in our lottery draw…'"
            className="w-full h-44 bg-cyber-darker border border-cyber-border rounded-xl p-4 text-gray-200 placeholder-cyber-muted/50 font-mono text-sm resize-none focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
          />

          {error && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-400/10 border border-red-400/30 rounded-lg">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            {/* Analyze */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !message.trim()}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                hover:from-cyan-400 hover:to-blue-500 hover:shadow-glow-blue
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…</>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Analyze Message
                </>
              )}
            </button>

            {/* Sample */}
            <div className="relative">
              <button
                onClick={() => setSampleOpen(!sampleOpen)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-cyan-400 border border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10 transition-all"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                Sample
                <svg viewBox="0 0 24 24" className={`w-3 h-3 transition-transform ${sampleOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {sampleOpen && (
                <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-cyber-card border border-cyber-border rounded-xl shadow-xl overflow-hidden">
                  {SAMPLE_MESSAGES.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSample(s.text)}
                      className="w-full text-left px-4 py-3 hover:bg-cyber-border/50 transition-colors border-b border-cyber-border last:border-0"
                    >
                      <p className="text-xs font-bold text-cyan-400 mb-0.5">{s.label}</p>
                      <p className="text-xs text-cyber-muted truncate">{s.text}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear */}
            <button
              onClick={handleClear}
              disabled={!message && !result}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-cyber-muted border border-cyber-border hover:border-red-400/30 hover:text-red-400 hover:bg-red-400/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Clear
            </button>
          </div>

          <p className="text-xs text-cyber-muted mt-3 font-mono">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-cyber-darker border border-cyber-border rounded text-cyber-muted">Ctrl+Enter</kbd> to analyze
          </p>
        </div>

        {/* Result */}
        {loading && <LoadingSpinner />}

        {result && !loading && (
          <div ref={resultRef}>
            <ResultCard result={result} />
          </div>
        )}

        {/* How it works */}
        {!result && !loading && (
          <div className="mt-8 bg-cyber-card border border-cyber-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              How CyberShield AI Works
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { step: "01", label: "NLP Preprocessing", desc: "Text cleaned, tokenized, stop words removed", icon: "🔤" },
                { step: "02", label: "TF-IDF Encoding", desc: "Message converted to numerical feature vector", icon: "🔢" },
                { step: "03", label: "AI Classification", desc: "Logistic Regression model scores the message", icon: "🤖" },
                { step: "04", label: "Risk Assessment", desc: "Confidence score and risk level calculated", icon: "🛡️" },
              ].map((item) => (
                <div key={item.step} className="bg-cyber-darker border border-cyber-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-mono text-cyan-400/60">Step {item.step}</span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{item.label}</p>
                  <p className="text-xs text-cyber-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border bg-cyber-darker/50 py-6 mt-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-cyber-muted font-mono">
            CyberShield AI · AI-Powered Scam Detection · Built with React + Django + Scikit-learn
          </p>
          <p className="text-xs text-cyber-muted/50 font-mono mt-1">
            For educational purposes. Always verify suspicious messages through official channels.
          </p>
        </div>
      </footer>

      {/* Click outside to close sample dropdown */}
      {sampleOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSampleOpen(false)} />
      )}
    </div>
  );
}
