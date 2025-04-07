const BASE_API_URL = "https://v2.api.noroff.dev";

/* --------------------- AUTH & USER ENDPOINTS --------------------- */

/**
 * Register a new user.
 * @param {Object} userData - The data for registration.
 */
export async function registerUser(userData) {
  const response = await fetch(`${BASE_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(
      `Registration failed: ${response.status} ${response.statusText} - ${errorDetails}`
    );
  }
  return await response.json();
}
