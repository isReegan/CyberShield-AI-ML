import React from "react";

const stats = [
  { label: "Messages Analyzed", value: "10M+", icon: "📊" },
  { label: "Scam Detection Rate", value: "98.5%", icon: "🎯" },
  { label: "False Positive Rate", value: "<0.5%", icon: "✅" },
  { label: "Avg Response Time", value: "<5ms", icon: "⚡" },
];

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-cyber-card border border-cyber-border rounded-xl p-4 text-center hover:border-cyan-400/30 transition-colors"
        >
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className="text-lg font-bold text-cyan-400 font-mono">{s.value}</div>
          <div className="text-xs text-cyber-muted mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
