import type { NextWebVitalsMetric } from "next/app";

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (process.env.NODE_ENV !== "production") return;
  try {
    navigator.sendBeacon(
      "/api/vitals",
      JSON.stringify({ id: metric.id, name: metric.name, value: metric.value, label: metric.label })
    );
  } catch {
    // no-op
  }
}
