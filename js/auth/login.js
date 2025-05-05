import { loginUser } from "../api.js";

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const fieldset = loginForm.querySelector("fieldset");
  const button = loginForm.querySelector("button");
  const previousButtonText = button.textContent;

  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    button.textContent = "Logging in...";
    fieldset.disabled = true;
    const userData = await loginUser({ email, password });

    if (userData) {
      alert("Login successful!");
      console.log("User logged in:", userData);

      localStorage.setItem("authToken", userData.accessToken);
      localStorage.setItem("loggedInUser", JSON.stringify(userData));

      console.log("Redirecting to index...");
      window.location.href = "/index.html";
    }
  } catch (error) {
    console.error("Error logging in user:", error.message);
    alert("Login failed. Please try again.");
  } finally {
    fieldset.disabled = false;
    button.textContent = previousButtonText;
  }
});
