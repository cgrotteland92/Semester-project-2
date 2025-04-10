const BASE_API_URL = "https://v2.api.noroff.dev";

export const headers = {
  "Content-Type": "application/json",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2dyb3R0ZWxhbmQiLCJlbWFpbCI6ImNocmdybzAyMTIyQHN0dWQubm9yb2ZmLm5vIiwiaWF0IjoxNzQ0MzAwNDgyfQ.n3AMABfJbCbzD3ROEmeh77Gn7ETHGPkA-rY6rvfQ9VE",
  "X-Noroff-API-Key": "0b0117c2-c40e-44f7-aa5a-6f18167b328c",
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

/* --------------------- POSTS ENDPOINTS --------------------- */

export async function fetchPosts() {
  try {
    const response = await fetch(`${BASE_API_URL}/auction/listings`, {
      method: "GET",
      headers,
    });
    if (!response.ok)
      throw new Error("Failed to get listings: " + response.status);
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error.message);
  }
}

export async function fetchSinglePost(postId) {
  try {
    const response = await fetch(`${BASE_API_URL}/auction/listings/${postId}`, {
      method: "GET",
      headers,
    });
    if (!response.ok)
      throw new Error("Failed to get listing: " + response.status);
    return await response.json();
  } catch (error) {
    console.error("Error fetching post:", error.message);
  }
}
