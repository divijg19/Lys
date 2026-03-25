"use client";
import type React from "react";

export const NeonGlow: React.FC = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      {/* Primary neon gradient wash - Cyan */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(0,255,255,0.35),transparent_50%)] mix-blend-screen animate-[neon-pulse_8s_ease-in-out_infinite]" />

      {/* Secondary neon gradient - Magenta */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_60%,rgba(255,0,180,0.28),transparent_55%)] mix-blend-screen animate-[neon-pulse_10s_ease-in-out_infinite_2s]" />

      {/* Accent neon gradient - Purple */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(200,0,255,0.22),transparent_60%)] mix-blend-screen animate-[neon-pulse_12s_ease-in-out_infinite_4s]" />

      {/* Vertical scan flicker - Enhanced */}
      <div className="absolute inset-0 animate-[cyber-scan_5s_linear_infinite] bg-[linear-gradient(180deg,transparent,rgba(0,255,255,0.35)_30%,rgba(255,0,255,0.25)_50%,transparent_70%)] opacity-40" />

      {/* Horizontal data sweep */}
      <div className="absolute inset-0 animate-[data-sweep_15s_linear_infinite] bg-[linear-gradient(90deg,transparent,rgba(0,255,200,0.15)_45%,rgba(255,0,180,0.12)_55%,transparent)] opacity-30" />

      {/* Grid overlay for depth */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.3)_1px,transparent_1px)] bg-[size:40px_40px] animate-[grid-drift_20s_linear_infinite]" />

      <style jsx>{`
        @keyframes cyber-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes neon-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes data-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes grid-drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
      `}</style>
    </div>
  );
};
