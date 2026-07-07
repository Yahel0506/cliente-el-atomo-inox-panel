"use client";

import { useEffect } from "react";

const themeColors = {
  dark: { primaryBg: "#f6f6f7", primaryFg: "#050505" },
  light: { primaryBg: "#111111", primaryFg: "#ffffff" },
};

function applyTheme(theme: keyof typeof themeColors) {
  const colors = themeColors[theme] || themeColors.dark;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.setProperty("--primary-bg", colors.primaryBg);
  document.documentElement.style.setProperty("--primary-fg", colors.primaryFg);
}

export function ThemeScript() {
  useEffect(() => {
    const stored = localStorage.getItem("atomo-panel-theme");
    const system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    applyTheme(stored === "light" || stored === "dark" ? stored : system);
  }, []);

  return null;
}
