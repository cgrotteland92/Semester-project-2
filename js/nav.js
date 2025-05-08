import { displayLoggedInUser, getLoggedInUser } from "./auth/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  menuToggle.addEventListener("change", () => {
    navMenu.classList.toggle("hidden");
  });

  const userInfoElement = document.getElementById("user-info");
  if (userInfoElement) {
    displayLoggedInUser(userInfoElement);
  }

  const profileLink = document.getElementById("nav-profile-link");
  const user = getLoggedInUser();
  const username = user?.data?.name || user?.name;
  if (profileLink && username) {
    profileLink.href = `/account/profile.html?user=${encodeURIComponent(
      username
    )}`;
  }
});
