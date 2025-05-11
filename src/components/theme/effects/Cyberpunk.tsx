"use client";

export default function CyberpunkEffect() {
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none">
      {/* Pulsing neon background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900 via-black to-blue-900 opacity-25 animate-pulse" />

      {/* Subtle animated scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.03)_96%)] bg-[length:100%_2px] opacity-10 mix-blend-screen pointer-events-none" />

      {/* Optional glitch flicker overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,0,255,0.1),transparent_70%)] opacity-5 animate-glitch pointer-events-none" />
    </div>
  );
}
