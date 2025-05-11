"use client";

import { useEffect, useState } from "react";

export default function ClientFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-6 text-center text-sm transition-colors duration-300">
      <p className="text-gray-600 dark:text-gray-400">
        © {year ?? "----"} Divij Ganjoo. Built with ❤️, React, and Next.js.
      </p>
    </footer>
  );
}
