const STORAGE_KEY = "am-clients-theme";

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

function initializeThemeToggle() {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : systemPrefersDark ? "dark" : "light";

  applyTheme(initialTheme);

  document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]").forEach((button) => {
    button.onclick = () => {
      const nextTheme =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";

      window.localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    };
  });
}

document.addEventListener("astro:page-load", initializeThemeToggle);
initializeThemeToggle();
