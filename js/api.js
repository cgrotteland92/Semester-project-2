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
 * @returns {Promise<Object>} - The API response with created user info.
 */
export async function registerUser(userData) {
  const response = await fetch(`${BASE_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => "");
    throw new Error(
      `Registration failed: ${response.status} ${response.statusText} - ${errorDetails}`
    );
  }

  return response.json();
}

/**
 * Login a user.
 * @param {Object} userData - The login credentials.
 * @returns {Promise<Object>} - The API response with JWT token.
 */
export async function loginUser(userData) {
  const response = await fetch(`${BASE_API_URL}/auth/login`, {
    method: "POST",
    headers,
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Login failed: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  return response.json();
}

/* --------------------- LISTINGS ENDPOINTS --------------------- */

/**
 * Fetch auction listings.
 * @param {Object} params - Query parameters as key/value pairs.
 * @returns {Promise<Object>} - The API response with listings data.
 */
export async function fetchPosts(params = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";
  const url = `${BASE_API_URL}/auction/listings${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch listings: ${response.status} ${response.statusText} - ${errorDetails}`
    );
  }

  return response.json();
}

/**
 * Fetch a single auction listing by ID.
 * @param {string} postId - The ID of the listing.
 * @returns {Promise<Object>} - The API response with listing data.
 */
export async function fetchSinglePost(postId) {
  const url = `${BASE_API_URL}/auction/listings/${postId}`;
  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorDetails = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch listing ${postId}: ${response.status} ${response.statusText} - ${errorDetails}`
    );
  }

  return response.json();
}

/**
 * Create a new auction listing.
 * @param {Object} postData - The listing payload.
 * @returns {Promise<Object>} - The API response with created listing data.
 */
export async function createPost(postData) {
  const response = await fetch(`${BASE_API_URL}/auction/listings`, {
    method: "POST",
    headers,
    body: JSON.stringify(postData),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg =
      (body && (body.message || body.error)) ||
      `${response.status} ${response.statusText}`;
    throw new Error(
      `Failed to create listing: ${response.status} ${response.statusText} - ${errorMsg}`
    );
  }

  return body;
}
