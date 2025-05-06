import { displayLoggedInUser } from "./auth/auth.js";

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
});
