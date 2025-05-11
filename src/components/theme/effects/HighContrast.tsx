// src/components/theme/effects/HighContrast.tsx

export default function HighContrastEffect() {
  return (
    <div className="absolute inset-0 bg-black">
      {/* Optional overlay to add texture or contrast aid */}
      <div
        className="absolute inset-0 bg-[repeating-linear-gradient(45deg,white_0_2px,transparent_2px_4px)] opacity-30 mix-blend-difference"
        aria-hidden="true"
      />
    </div>
  );
}
