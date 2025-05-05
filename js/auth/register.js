import { registerUser } from "../api.js";

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fieldset = registerForm.querySelector("fieldset");
  const button = registerForm.querySelector("button");
  const previousButtonText = button.textContent;

  const userData = {
    name: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
  };

  // Remember to add message container for error/success messages

  if (!userData.email.endsWith("@stud.noroff.no")) {
    alert("Email must end with @stud.noroff.no");
    return;
  }

  if (userData.password.length < 8) {
    alert("Password must be at least 8 characters long");
    return;
  }

  try {
    const registeredUser = await registerUser(userData);

    if (registeredUser) {
      alert("Thank you for signing up!");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error registering user:", error);
    alert("Registration failed. Please try again.");
  } finally {
    fieldset.disabled = false;
    button.textContent = previousButtonText;
  }
});
