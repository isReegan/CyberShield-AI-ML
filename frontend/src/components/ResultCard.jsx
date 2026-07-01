import React from "react";

const RISK_CONFIG = {
  Critical: { color: "text-red-400",   bg: "bg-red-400/10",   border: "border-red-400/30",   dot: "bg-red-400"   },
  High:     { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", dot: "bg-orange-400" },
  Medium:   { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", dot: "bg-yellow-400" },
  Low:      { color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30",   dot: "bg-blue-400"  },
  None:     { color: "text-cyber-safe", bg: "bg-green-400/10",  border: "border-green-400/30",  dot: "bg-green-400" },
};

function ConfidenceBar({ value, isScam }) {
  const color = isScam ? "#ff3366" : "#00ff88";
  return (
    <div className="w-full h-2 bg-cyber-border rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  );
}

function StatBox({ label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-cyber-darker border border-cyber-border rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-cyber-muted">{sub}</p>}
    </div>
  );
}

export default function ResultCard({ result }) {
  const isScam = result.prediction === "Scam";
  const risk = RISK_CONFIG[result.risk_level] || RISK_CONFIG.None;

  return (
    <div
      className={`relative rounded-2xl border p-6 transition-all duration-500 ${
        isScam
          ? "border-red-500/40 bg-red-950/10 shadow-glow-red"
          : "border-green-500/40 bg-green-950/10 shadow-glow-green"
      }`}
    >
      {/* Verdict banner */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isScam ? "bg-red-500/15" : "bg-green-500/15"
            }`}
          >
            {isScam ? (
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            )}
          </div>

          <div>
            <p className="text-sm text-cyber-muted font-mono uppercase tracking-widest mb-0.5">Analysis Result</p>
            <h2
              className={`text-3xl font-extrabold tracking-wide ${
                isScam ? "text-red-400 text-glow-red" : "text-green-400 text-glow-green"
              }`}
            >
              {isScam ? "⚠ SCAM DETECTED" : "✓ SAFE MESSAGE"}
            </h2>
          </div>
        </div>

        {/* Risk badge */}
        <div className={`px-4 py-2 rounded-full border ${risk.bg} ${risk.border} flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full ${risk.dot} animate-pulse`} />
          <span className={`text-sm font-bold font-mono ${risk.color}`}>
            {result.risk_level === "None" ? "No Risk" : `${result.risk_level} Risk`}
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-cyber-muted font-mono">Confidence Score</span>
          <span className={`text-xl font-bold font-mono ${isScam ? "text-red-400" : "text-green-400"}`}>
            {result.confidence}%
          </span>
        </div>
        <ConfidenceBar value={result.confidence} isScam={isScam} />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-cyber-muted font-mono">0%</span>
          <span className="text-xs text-cyber-muted font-mono">100%</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatBox
          label="Category"
          value={result.category}
          color={isScam ? "text-red-300" : "text-green-300"}
        />
        <StatBox
          label="Risk Level"
          value={result.risk_level === "None" ? "No Risk" : result.risk_level}
          color={risk.color}
        />
        <StatBox
          label="Scam Probability"
          value={`${result.scam_probability}%`}
          color="text-red-400"
        />
        <StatBox
          label="Safe Probability"
          value={`${result.safe_probability}%`}
          color="text-green-400"
        />
      </div>

      {/* Timing */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-cyber-muted" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-xs text-cyber-muted font-mono">
          Analyzed in {result.prediction_time_ms} ms
        </span>
      </div>

      {/* Warning footer for scam */}
      {isScam && (
        <div className="mt-4 p-3 rounded-xl bg-red-400/5 border border-red-400/20">
          <p className="text-xs text-red-300 font-mono">
            ⚠ Do not click any links or share personal information from this message.
            Report it to your local cybercrime authority.
          </p>
        </div>
      )}
    </div>
  );
}
