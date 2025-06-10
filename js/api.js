const BASE_API_URL = "https://v2.api.noroff.dev";
const profilesURL = `${BASE_API_URL}/auction/profiles`;

export const headers = {
  "Content-Type": "application/json",
  "X-Noroff-API-Key": "0b0117c2-c40e-44f7-aa5a-6f18167b328c",
};

function authHeaders() {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No auth token, please login first");
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

// Helper function to check if user is authenticated
function isAuthenticated() {
  return localStorage.getItem("authToken") !== null;
}

/* --------------------- AUTH & USER ENDPOINTS --------------------- */
/**
 * Fetch a single user profile by name.
 * @param {string} profileName
 * @returns {Promise<Object>}
 */
export async function getUserProfile(profileName) {
  try {
    // Check if user is authenticated first
    if (!isAuthenticated()) {
      throw new Error("Authentication required. Please login first.");
    }

    const response = await fetch(`${profilesURL}/${profileName}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (response.status === 401) {
      // Token might be expired, clear it
      localStorage.removeItem("authToken");
      throw new Error("Authentication expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch profile (${response.status}): ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    throw error;
  }
}

/**
 * Fetch posts for a specific user/profile.
 * @param {string} profileName
 * @returns {Promise<Object>}
 */
export async function getUserPosts(profileName) {
  try {
    if (!isAuthenticated()) {
      throw new Error("Authentication required. Please login first.");
    }

    const response = await fetch(`${profilesURL}/${profileName}/listings`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      throw new Error("Authentication expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch user posts: " + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user posts:", error.message);
    throw error;
  }
}

/**
 * Update a user's profile (bio, avatar, banner).
 * @param {string} profileName
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function updateUserProfile(profileName, payload) {
  try {
    if (!isAuthenticated()) {
      throw new Error("Authentication required. Please login first.");
    }

    const res = await fetch(`${profilesURL}/${profileName}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (res.status === 401) {
      localStorage.removeItem("authToken");
      throw new Error("Authentication expired. Please login again.");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to update profile (${res.status}): ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Error updating user profile:", err);
    throw err;
  }
}

/**
 * Register a new user.
 * @param {Object} userData
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
 * Login a user and store the token.
 * @param {Object} userData
 */
export async function loginUser(userData) {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to login user: " + response.status);
    }

    const result = await response.json();

    if (result.data && result.data.accessToken) {
      localStorage.setItem("authToken", result.data.accessToken);
    }

    return result;
  } catch (error) {
    console.error("Error logging in user:", error.message);
    throw error;
  }
}

/* --------------------- POSTS ENDPOINTS --------------------- */

/**
 * Create a new auction listing.
 * @param {Object} listingData
 * @param {string} listingData.title
 * @param {string} [listingData.description]
 * @param {Array<string>} [listingData.tags]
 * @param {Array<string>} [listingData.media]
 * @param {string} listingData.endsAt
 * @returns {Promise<Object>}
 */
export async function createListing(listingData) {
  try {
    if (!isAuthenticated()) {
      throw new Error("Authentication required. Please login first.");
    }

    if (!listingData.title) {
      throw new Error("Listing title is required");
    }

    if (!listingData.endsAt) {
      throw new Error("Auction end date is required");
    }

    const response = await fetch(`${BASE_API_URL}/auction/listings`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(listingData),
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      throw new Error("Authentication expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create listing (${response.status}): ${
          errorData.errors?.[0]?.message || response.statusText
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating listing:", error.message);
    throw error;
  }
}

/**
 * Update an existing listing
 * @param {string} id
 * @param {Object} listingData
 * @returns {Promise<{data:Object}>}
 */
export async function updateListing(id, listingData) {
  if (!isAuthenticated()) {
    throw new Error("Authentication required. Please login first.");
  }

  const res = await fetch(
    `${BASE_API_URL}/auction/listings/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: authHeaders(), // Use authHeaders for authenticated requests
      body: JSON.stringify(listingData),
    }
  );

  if (res.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Authentication expired. Please login again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.errors?.[0]?.message || res.statusText;
    throw new Error(`Failed to update (${res.status}): ${msg}`);
  }
  return res.json();
}

/**
 * Deletes a listing by ID
 * @param {string} id - The ID of the listing to delete
 * @returns {Promise}
 */
export async function deleteListing(id) {
  if (!isAuthenticated()) {
    throw new Error("Authentication required. Please login first.");
  }

  const res = await fetch(
    `${BASE_API_URL}/auction/listings/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: authHeaders(), // Use authHeaders for authenticated requests
    }
  );

  if (res.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Authentication expired. Please login again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to delete listing (${res.status}): ${
        err.errors?.[0]?.message || res.statusText
      }`
    );
  }
}

export async function fetchPosts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      query.append(key, String(val));
    }
  });
  const url = `${BASE_API_URL}/auction/listings?${query.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers, // Public endpoint, no auth required
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch listings (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

/**
 * Fetch a single listing by ID
 * @param {string} id - Listing ID
 * @returns {Promise<{ data: Object }>}
 */
export async function getSingleListing(id, options = {}) {
  const params = new URLSearchParams();
  params.append("_seller", "true");
  if (options._bids) params.append("_bids", "true");
  const query = params.toString() ? `?${params}` : "";
  const url = `${BASE_API_URL}/auction/listings/${encodeURIComponent(
    id
  )}${query}`;
  const response = await fetch(url, { headers }); // Public endpoint
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to load listing (${response.status}): ${
        err.errors?.[0]?.message || response.statusText
      }`
    );
  }
  return response.json();
}

/**
 * Place a bid on a listing
 * @param {string} listingId
 * @param {number} amount
 * @returns {Promise<{ data: Object }>}
 */
export async function placeBid(listingId, amount) {
  if (!isAuthenticated()) {
    throw new Error("Authentication required. Please login first.");
  }

  const url = `${BASE_API_URL}/auction/listings/${encodeURIComponent(
    listingId
  )}/bids`;
  const resp = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });

  if (resp.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Authentication expired. Please login again.");
  }

  if (!resp.ok) {
    let msg = resp.statusText;
    try {
      const err = await resp.json();
      msg = err.message || msg;
    } catch {}
    throw new Error(`Bid failed: ${msg}`);
  }
  const { data } = await resp.json();
  return data;
}

/**
 * Get all bids made by a user
 * @param {string} profileName
 * @returns {Promise<{ data: Object }>}
 */
export async function getUserBids(profileName) {
  if (!isAuthenticated()) {
    throw new Error("Authentication required. Please login first.");
  }

  const url = new URL(
    `${BASE_API_URL}/auction/profiles/${encodeURIComponent(profileName)}/bids`
  );
  url.searchParams.append("_listings", "true");

  const res = await fetch(url.toString(), { headers: authHeaders() });

  if (res.status === 401) {
    localStorage.removeItem("authToken");
    throw new Error("Authentication expired. Please login again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.errors?.[0]?.message || `Failed to fetch bids (${res.status})`
    );
  }
  return res.json();
}

/**
 * Retrieve all listings a user has won.
 * @param {string} username
 * @returns {Promise<{ data: Array }>}
 */
export async function getUserWins(username) {
  if (!isAuthenticated()) {
    throw new Error("Authentication required. Please login first.");
  }

  const url = `${BASE_API_URL}/auction/profiles/${encodeURIComponent(
    username
  )}/wins`;
  try {
    const res = await fetch(url, { method: "GET", headers: authHeaders() });

    if (res.status === 401) {
      localStorage.removeItem("authToken");
      throw new Error("Authentication expired. Please login again.");
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch wins (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching user wins:", err);
    throw err;
  }
}

/**
 * Search listings by title or description.
 * @param {string} q
 * @returns {Promise<{ data: Listing[] }>}
 */
export function searchListings(q) {
  return fetch(
    `${BASE_API_URL}/auction/listings/search?q=${encodeURIComponent(q)}`,
    { headers }
  )
    .then((res) => {
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      return res.json();
    })
    .then((json) => {
      const listings = Array.isArray(json) ? json : json.data || [];
      return { data: listings };
    });
}
