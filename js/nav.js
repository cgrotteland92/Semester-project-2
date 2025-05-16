import { getLoggedInUser, logoutUser } from "./auth/auth.js";
import { getUserProfile } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const burgerBtn = document.getElementById("burger-menu-btn");
  const navMenu = document.getElementById("nav-menu");

  // ─── BURGER MENU TOGGLE ─────────────────────────────
  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (
        !navMenu.classList.contains("hidden") &&
        !navMenu.contains(e.target) &&
        e.target !== burgerBtn
      ) {
        navMenu.classList.add("hidden");
      }
    });
  } else {
    console.warn("Menu elements not found:", { burgerBtn, navMenu });
  }

  // ─── USER AUTH & PROFILE DISPLAY ────────────────────
  const nameEl = document.getElementById("nav-user-name");
  const creditsEl = document.getElementById("nav-user-credits");
  const creditsDisplay = document.getElementById("nav-user-credits-display");
  const profileLink = document.getElementById("nav-profile-link");
  const loginLogoutBtn = document.getElementById("nav-login-logout");

  const authUser = getLoggedInUser()?.data;

  if (authUser) {
    if (nameEl && creditsEl && creditsDisplay && profileLink) {
      nameEl.textContent = authUser.name || "User";
      profileLink.href = `/account/profile.html?user=${encodeURIComponent(
        authUser.name
      )}`;
      creditsDisplay.classList.remove("hidden");

      try {
        const { data: profile } = await getUserProfile(authUser.name);
        const credits =
          typeof profile.credits === "number" ? profile.credits : 0;
        creditsEl.textContent = `${credits.toLocaleString()} 🪙`;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        creditsEl.textContent = "0 🪙";
      }
    }

    if (loginLogoutBtn) {
      loginLogoutBtn.textContent = "Sign Out";
      loginLogoutBtn.addEventListener("click", handleLogout);
    }
  } else {
    creditsDisplay?.classList.add("hidden");
    if (loginLogoutBtn) {
      loginLogoutBtn.textContent = "Log In";
      loginLogoutBtn.href = "/account/login.html";
      loginLogoutBtn.removeEventListener("click", handleLogout);
    }
  }

  function handleLogout(e) {
    e.preventDefault();
    e.stopPropagation();
    logoutUser();
    window.location.href = "/account/login.html";
  }

  const currentPath = window.location.pathname;

  document.querySelectorAll("#nav-menu a").forEach((link) => {
    const linkPath = new URL(link.href).pathname;
    if (
      linkPath === currentPath ||
      (linkPath === "/index.html" && currentPath === "/")
    ) {
      link.classList.add(
        "text-yellow-400",
        "font-semibold",
        "border-yellow-400"
      );
    }
  });
});
