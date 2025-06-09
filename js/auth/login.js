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

    const response = await loginUser({ email, password });

    if (response && response.data) {
      alert("Login successful!");

      localStorage.setItem("loggedInUser", JSON.stringify(response.data));

      window.location.href = "/index.html";
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Error logging in user:", error.message);
    alert(`Login failed: ${error.message}`);
  } finally {
    fieldset.disabled = false;
    button.textContent = previousButtonText;
  }
});
