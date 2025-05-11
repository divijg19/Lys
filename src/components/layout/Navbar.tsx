"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Lottie from "lottie-react";
import clsx from "clsx";

interface ThemeOption {
  name: string;
  value: string;
  animationFile: string;
}

const themes: ThemeOption[] = [
  {
    name: "Light Mode",
    value: "Light",
    animationFile: "/animations/light.json",
  },
  { name: "Dark Mode", value: "Dark", animationFile: "/animations/dark.json" },
  {
    name: "Cyberpunk",
    value: "Cyberpunk",
    animationFile: "/animations/cyberpunk.json",
  },
  {
    name: "Ethereal",
    value: "Ethereal",
    animationFile: "/animations/ethereal.json",
  },
  {
    name: "Horizon Blaze",
    value: "Horizon Blaze",
    animationFile: "/animations/horizon.json",
  },
  {
    name: "Neo Mirage",
    value: "Neo Mirage",
    animationFile: "/animations/mirage.json",
  },
  {
    name: "High Contrast",
    value: "High Contrast",
    animationFile: "/animations/contrast.json",
  },
  {
    name: "Low Motion",
    value: "Low Motion",
    animationFile: "/animations/lowmotion.json",
  },
];

// 👇 Hook must be used inside a React Component
const useLottieIcon = (filePath: string) => {
  try {
    return require(`@/../public${filePath}`);
  } catch {
    return null;
  }
};

// ✅ Converted the theme icon renderer into a React component
const ThemeIcon = ({ index, size = 28 }: { index: number; size?: number }) => {
  const animationData = useLottieIcon(themes[index].animationFile);

  return animationData ? (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className={`w-[${size}px] h-[${size}px] drop-shadow`}
    />
  ) : (
    <div
      className={`w-[${size}px] h-[${size}px] rounded-full bg-gray-400 animate-pulse`}
    />
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const [themeIndex, setThemeIndex] = useState(0);
  const [showThemeList, setShowThemeList] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const theme = themes[themeIndex];
  const nextTheme = themes[(themeIndex + 1) % themes.length];

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const initialIndex = themes.findIndex((t) => t.value === saved);
    const index = initialIndex !== -1 ? initialIndex : 0;
    setThemeIndex(index);
    applyTheme(index);
  }, []);

  const applyTheme = (index: number) => {
    const selected = themes[index];
    document.documentElement.setAttribute("data-theme", selected.value);
    localStorage.setItem("theme", selected.value);
  };

  const handleThemeChange = (index: number) => {
    setThemeIndex(index);
    applyTheme(index);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <Tooltip.Provider>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full backdrop-blur-md bg-transparent shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent hover:opacity-80"
            >
              Divij
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-purple-400",
                    pathname === href &&
                      "font-semibold underline underline-offset-4",
                  )}
                >
                  {label}
                </Link>
              ))}

              {/* Theme Cycle Button */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() =>
                      handleThemeChange((themeIndex + 1) % themes.length)
                    }
                    aria-label={`Switch to ${nextTheme.name}`}
                    className="p-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <ThemeIcon index={themeIndex} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-black text-white px-2 py-1 rounded text-xs"
                    sideOffset={5}
                  >
                    Switch to {nextTheme.name}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              {/* Dropdown Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeList((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={showThemeList}
                  className="ml-2 flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {theme.name}
                  {showThemeList ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>

                <AnimatePresence>
                  {showThemeList && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      role="listbox"
                      className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 z-50 ring-1 ring-black/10 dark:ring-white/10"
                    >
                      {themes.map((t, idx) => (
                        <motion.li
                          key={t.value}
                          role="option"
                          aria-selected={idx === themeIndex}
                          onClick={() => {
                            handleThemeChange(idx);
                            setShowThemeList(false);
                          }}
                          className={clsx(
                            "px-4 py-3 flex items-center gap-3 cursor-pointer transition-all",
                            idx === themeIndex
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800",
                          )}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ThemeIcon index={idx} size={24} />
                          <span className="text-sm">{t.name}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden px-4 pt-4 pb-6 bg-white/70 dark:bg-gray-900/80 backdrop-blur-md shadow-xl rounded-b-xl space-y-3 text-sm"
            >
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    "block px-4 py-2 rounded-md",
                    pathname === href
                      ? "bg-gray-300 dark:bg-gray-700 font-semibold"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700",
                  )}
                >
                  {label}
                </Link>
              ))}

              {/* Mobile Theme Selector */}
              <div className="pt-3">
                <label
                  htmlFor="mobile-theme-select"
                  className="block text-xs mb-1 text-gray-700 dark:text-gray-300"
                >
                  Theme
                </label>
                <select
                  id="mobile-theme-select"
                  value={themeIndex}
                  onChange={(e) => {
                    handleThemeChange(Number(e.target.value));
                    setIsMobileOpen(false);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {themes.map((t, idx) => (
                    <option key={t.value} value={idx}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </Tooltip.Provider>
  );
}
