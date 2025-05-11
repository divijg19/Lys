"use client";

export default function HorizonBlazeEffect() {
  return (
    <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
      {/* Radiant horizon gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900 via-amber-600 to-yellow-200 opacity-25 animate-horizon-fade" />

      {/* Sunburst animated rays */}
      <div className="absolute inset-0 flex items-end justify-center">
        <div className="w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,204,0,0.15)_10%,transparent_70%)] animate-sunrays" />
      </div>

      {/* Gentle moving heat shimmer overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_70%,rgba(255,204,0,0.1))] mix-blend-screen animate-heatwave" />
    </div>
  );
}
