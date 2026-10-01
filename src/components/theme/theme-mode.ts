export type Theme = "light" | "dark";

const THEME_KEY = "theme";

/**
 * Runs in <head> before the first paint: a saved choice wins, otherwise the page follows the
 * system through CSS. Without it, a reader who chose a theme would see the other one flash.
 */
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/** The theme on screen: the saved choice, or the system's when there is none. */
export function currentTheme(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private windows may refuse storage; the theme still applies to this visit.
  }
}

/** Calls back whenever the theme on screen changes: a choice here or a change in the system. */
export function subscribeToTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  system.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    system.removeEventListener("change", onChange);
  };
}
