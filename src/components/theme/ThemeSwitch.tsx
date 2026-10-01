"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { applyTheme, currentTheme, subscribeToTheme, type Theme } from "./theme-mode";

export function ThemeSwitch() {
  const theme = useSyncExternalStore<Theme | null>(subscribeToTheme, currentTheme, () => null);

  return (
    <div
      className="switch"
      role="group"
      aria-label="Tema"
      data-active={theme === "dark" ? 1 : 0}
      data-ready={theme !== null}
    >
      <span className="switch-thumb" aria-hidden />
      <button
        type="button"
        className="switch-option"
        aria-label="Tema claro"
        aria-pressed={theme === "light"}
        onClick={() => applyTheme("light")}
      >
        <Sun className="switch-icon" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="switch-option"
        aria-label="Tema escuro"
        aria-pressed={theme === "dark"}
        onClick={() => applyTheme("dark")}
      >
        <Moon className="switch-icon" aria-hidden="true" />
      </button>
    </div>
  );
}
