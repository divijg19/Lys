// src/components/theme/effects/LowMotion.tsx

export default function LowMotionEffect() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200 opacity-90">
      {/* Optional subtle texture to avoid flatness */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"
        aria-hidden="true"
      />
    </div>
  );
}
