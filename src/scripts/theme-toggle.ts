const STORAGE_KEY = "am-clients-theme";

type ThemeToggleRoot = HTMLButtonElement & {
  __themeToggleHandler?: () => void;
};

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    const isDark = theme === "dark";
    const label = button.querySelector<HTMLElement>("[data-theme-toggle-label]");

    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );

    if (label) {
      label.textContent = isDark ? "Light mode" : "Dark mode";
    }
  });
}

function cleanupThemeToggles() {
  document.querySelectorAll<ThemeToggleRoot>("[data-theme-toggle]").forEach((button) => {
    if (button.__themeToggleHandler) {
      button.removeEventListener("click", button.__themeToggleHandler);
    }
  });
}

function initializeThemeToggle() {
  cleanupThemeToggles();

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : systemPrefersDark ? "dark" : "light";

  applyTheme(initialTheme);

  document.querySelectorAll<ThemeToggleRoot>("[data-theme-toggle]").forEach((button) => {
    const handler = () => {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";

      window.localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    };
    button.__themeToggleHandler = handler;
    button.addEventListener("click", handler);
  });
}

document.addEventListener("astro:before-swap", cleanupThemeToggles);
document.addEventListener("astro:page-load", initializeThemeToggle);
initializeThemeToggle();
