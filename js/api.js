const BASE_API_URL = "https://v2.api.noroff.dev";

export const headers = {
  "Content-Type": "application/json",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2dyb3R0ZWxhbmQiLCJlbWFpbCI6ImNocmdybzAyMTIyQHN0dWQubm9yb2ZmLm5vIiwiaWF0IjoxNzM3NDc3MDA5fQ.dHnh1IVZQAFkYS-n0eeQsnBpM1tZB2tLkvtQu5JLRtQ",
  "X-Noroff-API-Key": "38bdac0c-896c-444c-b4c6-ebbb84f542ea",
};
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

/**
 * Login a user.
 * @param {Object} userData - The login credentials.
 */
export async function loginUser(userData) {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    });
    if (!response.ok)
      throw new Error("Failed to login user: " + response.status);
    return await response.json();
  } catch (error) {
    console.error("Error logging in user:", error.message);
  }
}
