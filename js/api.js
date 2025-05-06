const BASE_API_URL = "https://v2.api.noroff.dev";

export const headers = {
  "Content-Type": "application/json",
  "X-Noroff-API-Key": "709242f2-a89a-4bd9-b050-1aa5b87af76b",
};

/**
 * If the user is logged in, return { Authorization: 'Bearer …' }, else {}
 */
function authHeaders() {
  const stored = localStorage.getItem("user");
  if (!stored) return {};
  const { accessToken } = JSON.parse(stored);
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/* --------------------- AUTH & USER ENDPOINTS --------------------- */

/**
 * Register a new user.
 * @param {Object} userData
 * @returns {Promise<Object>} new user profile (no token)
 */
export async function registerUser(userData) {
  const res = await fetch(`${BASE_API_URL}/auth/register`, {
    method: "POST",
    headers: { ...headers },
    body: JSON.stringify(userData),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      body?.errors?.[0]?.message ||
      body?.message ||
      `Registration failed: ${res.status} ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return body.data;
}

/**
 * Login a user.
 * @param {Object} userData
 * @returns {Promise<Object>} user profile including accessToken
 */
export async function loginUser(userData) {
  const res = await fetch(`${BASE_API_URL}/auth/login`, {
    method: "POST",
    headers: { ...headers },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Login failed: ${res.status} ${res.statusText} – ${errText}`
    );
  }

  const json = await res.json();
  console.log("🔍 loginUser raw payload:", json);

  const payload = json.data;
  const token = payload.accessToken;
  if (!token) throw new Error("Login succeeded but no token returned.");

  // Store the entire user profile (with accessToken) in localStorage
  localStorage.setItem("user", JSON.stringify(payload));
  console.log("🔒 Stored user/token in localStorage:", token);

  return payload;
}

/* --------------------- LISTINGS ENDPOINTS --------------------- */

/**
 * Fetch auction listings.
 * @param {Object} params
 * @returns {Promise<Object>} listings data
 */
export async function fetchPosts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${BASE_API_URL}/auction/listings${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    headers: { ...headers, ...authHeaders() },
  });
  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch listings: ${res.status} ${res.statusText} – ${details}`
    );
  }

  return res.json();
}

/**
 * Fetch a single listing by ID.
 * @param {string} postId
 * @returns {Promise<Object>} listing data
 */
export async function fetchSinglePost(postId) {
  const url = `${BASE_API_URL}/auction/listings/${postId}`;
  const res = await fetch(url, {
    headers: { ...headers, ...authHeaders() },
  });
  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch listing ${postId}: ${res.status} ${res.statusText} – ${details}`
    );
  }
  return res.json();
}

/**
 * Create a new auction listing.
 * @param {Object} postData
 * @returns {Promise<Object>} created listing
 */
export async function createPost(postData) {
  const res = await fetch(`${BASE_API_URL}/auction/listings`, {
    method: "POST",
    headers: { ...headers, ...authHeaders() },
    body: JSON.stringify(postData),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg =
      body?.errors?.[0]?.message ||
      body?.message ||
      `${res.status} ${res.statusText}`;
    throw new Error(
      `Failed to create listing: ${res.status} ${res.statusText} – ${errorMsg}`
    );
  }

  return body;
}
