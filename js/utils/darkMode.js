function applyInitialTheme() {
  const userPreference = localStorage.getItem("theme");
  const systemPreferenceIsDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const isDarkMode =
    userPreference === "dark" || (!userPreference && systemPreferenceIsDark);
  console.log("applyInitialTheme:", isDarkMode);

  document.documentElement.classList.toggle("dark", isDarkMode);

  // Use the correct selectors with '#' to target the elements by id
  document.querySelector("#theme-sun").classList.toggle("hidden", isDarkMode);
  document.querySelector("#theme-moon").classList.toggle("hidden", !isDarkMode);

  console.log("Sun classes:", document.querySelector("#theme-sun").classList);
  console.log("Moon classes:", document.querySelector("#theme-moon").classList);
}

applyInitialTheme();

function toggleTheme() {
  const isDarkMode = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  document.querySelector("#theme-sun").classList.toggle("hidden", isDarkMode);
  document.querySelector("#theme-moon").classList.toggle("hidden", !isDarkMode);
}

const themeToggleButton = document.querySelector("#theme-toggle");
themeToggleButton.addEventListener("click", toggleTheme);
