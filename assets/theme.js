const button = document.getElementById("themeButton");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let preference = null;
try { preference = localStorage.getItem("theme"); } catch { /* Storage is optional. */ }
if (preference !== "light" && preference !== "dark") preference = null;

function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0a0a0a" : "#ffffff");
  button.textContent = dark ? "Tema claro" : "Tema oscuro";
  button.setAttribute("aria-pressed", String(dark));
}

applyTheme(preference || (systemTheme.matches ? "dark" : "light"));
button.addEventListener("click", () => {
  preference = document.documentElement.classList.contains("dark") ? "light" : "dark";
  applyTheme(preference);
  try { localStorage.setItem("theme", preference); } catch { /* Keep session choice. */ }
});
systemTheme.addEventListener("change", event => {
  if (!preference) applyTheme(event.matches ? "dark" : "light");
});
