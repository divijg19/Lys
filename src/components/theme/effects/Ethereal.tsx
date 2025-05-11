"use client";

export default function EtherealEffect() {
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Subtle floating gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 opacity-30 animate-float" />

      {/* Light cloud-like shimmer overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,transparent_70%)] mix-blend-soft-light opacity-10 animate-clouds" />
    </div>
  );
}
