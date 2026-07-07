"use client";

import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

const themeColors = {
  dark: { primaryBg: "#f6f6f7", primaryFg: "#050505" },
  light: { primaryBg: "#111111", primaryFg: "#ffffff" },
};

function applyTheme(theme: keyof typeof themeColors) {
  const colors = themeColors[theme];
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.setProperty("--primary-bg", colors.primaryBg);
  document.documentElement.style.setProperty("--primary-fg", colors.primaryFg);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.dataset.theme || "dark";
  });

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("atomo-panel-theme", next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="focus-ring ui-pressable inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-[color:var(--panel-raised)] text-[color:var(--foreground)] shadow-[var(--shadow-control)] transition-[transform,background-color,box-shadow] duration-160 ease-[var(--ease-out-premium)] active:scale-[0.97]"
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? <Moon size={18} weight="fill" aria-hidden /> : <Sun size={18} weight="fill" aria-hidden />}
    </button>
  );
}
