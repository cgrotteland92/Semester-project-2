import { getLoggedInUser } from "./auth/auth.js";
import { getUserProfile } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("change", () => {
      navMenu.classList.toggle("hidden");
    });
  }

  const avatarBtn = document.getElementById("nav-avatar-btn");
  const avatarImg = document.getElementById("nav-avatar");
  const userMenu = document.getElementById("nav-user-menu");
  const nameEl = document.getElementById("nav-user-name");
  const creditsEl = document.getElementById("nav-user-credits");

  const authUser = getLoggedInUser()?.data;
  if (avatarBtn && avatarImg && userMenu && nameEl && creditsEl && authUser) {
    avatarImg.src = authUser.avatar?.url || "/images/avatar-placeholder.png";
    avatarImg.alt = authUser.name;
    nameEl.textContent = authUser.name;

    try {
      const { data: profile } = await getUserProfile(authUser.name);
      const credits = typeof profile.credits === "number" ? profile.credits : 0;
      creditsEl.textContent = `${credits.toLocaleString()} 🪙`;
    } catch {
      creditsEl.textContent = "0 Coins";
    }

    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
      if (!userMenu.classList.contains("hidden")) {
        userMenu.classList.add("hidden");
      }
    });
  }

  const profileLink = document.getElementById("nav-profile-link");
  if (profileLink && authUser?.name) {
    profileLink.href = `/account/profile.html?user=${encodeURIComponent(
      authUser.name
    )}`;
  }
});
