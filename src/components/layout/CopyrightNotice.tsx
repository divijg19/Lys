// src/components/layout/CopyrightNotice.tsx
"use client";

export default function CopyrightNotice() {
  const year = new Date().getFullYear();
  return <p className="mt-2">© {year} Divij. All rights reserved.</p>;
}
