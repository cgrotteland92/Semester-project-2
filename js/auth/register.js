// script.js
import { registerUser } from "../api.js";
import { showMessage } from "../utils/message.js";

const registerForm = document.getElementById("register-form");
const msgBanner = document.getElementById("registerMessage");
const fieldset = registerForm.querySelector("fieldset");
const submitButton = registerForm.querySelector("button");

function validateEmail(email) {
  return email.endsWith("@stud.noroff.no");
}
function validatePassword(pw) {
  return pw.length >= 8;
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgBanner.classList.add("hidden");
  msgBanner.textContent = "";

  const { username, email, password } = registerForm.elements;
  const userData = {
    name: username.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
  };

  if (!validateEmail(userData.email)) {
    return showMessage(msgBanner, "Email must end with @stud.noroff.no", true);
  }
  if (!validatePassword(userData.password)) {
    return showMessage(
      msgBanner,
      "Password must be at least 8 characters",
      true
    );
  }

  fieldset.disabled = true;
  const prevText = submitButton.textContent;
  submitButton.textContent = "Registering…";

  try {
    const newUser = await registerUser(userData);
    console.log("✅ Registered user:", newUser);

    showMessage(
      msgBanner,
      "Registration successful! Redirecting to login…",
      false
    );
    setTimeout(() => (window.location.href = "./login.html"), 1000);
  } catch (err) {
    console.error("Error registering user:", err);
    if (err.message.includes("Profile already exists")) {
      showMessage(
        msgBanner,
        "An account with that email already exists. Redirecting to login…",
        true
      );
      setTimeout(() => (window.location.href = "./login.html"), 2000);
    } else {
      showMessage(
        msgBanner,
        err.message || "Registration failed. Please try again.",
        true
      );
    }
  } finally {
    fieldset.disabled = false;
    submitButton.textContent = prevText;
  }
});
