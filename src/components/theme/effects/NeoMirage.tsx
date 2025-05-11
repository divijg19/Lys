"use client";

export default function NeoMirageEffect() {
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Subtle pastel gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c1e1ff] via-[#fbeeff] to-[#ffd6e0] opacity-25 animate-mirage-shift" />

      {/* Refraction shimmer effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent)] mix-blend-soft-light animate-refract" />

      {/* Layered blur overlay for dreamy distortion */}
      <div className="absolute inset-0 backdrop-blur-[2px] backdrop-saturate-150 animate-blur-pulse" />
    </div>
  );
}
