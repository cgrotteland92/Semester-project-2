/**
 * Gets the logged-in user data from localStorage.
 * @returns {Object|null} The user data if valid JSON, or null otherwise.
 */
export function getLoggedInUser() {
  try {
    const raw = localStorage.getItem("loggedInUser");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to parse loggedInUser, clearing invalid data.", error);
    localStorage.removeItem("loggedInUser");
    return null;
  }
}

/**
 * Logs out the current user by clearing storage and redirecting to login.
 */
export function logoutUser() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("loggedInUser");
  window.location.href = "/account/login.html";
}

/**
 * Renders the user menu based on login status.
 * @param {HTMLElement} userInfoElement - The container (e.g., a <ul>) to populate.
 */
export function displayLoggedInUser(userInfoElement) {
  userInfoElement.textContent = "";

  const user = getLoggedInUser();

  if (user) {
    const name = user.name || user.data?.name || "";
    const firstName = name.split(" ")[0] || "";

    const liGreeting = document.createElement("li");
    liGreeting.textContent = firstName ? `Hi, ${firstName}` : "Welcome";
    userInfoElement.appendChild(liGreeting);

    const liLogout = document.createElement("li");
    const logoutLink = document.createElement("a");
    logoutLink.id = "logout-btn";
    logoutLink.href = "account/login.html";
    logoutLink.textContent = "Logout";
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logoutUser();
    });
    liLogout.appendChild(logoutLink);
    userInfoElement.appendChild(liLogout);
  } else {
    const liLogin = document.createElement("li");
    const loginLink = document.createElement("a");
    loginLink.href = "/account/login.html";
    loginLink.textContent = "Login";
    liLogin.appendChild(loginLink);
    userInfoElement.appendChild(liLogin);
  }
}
