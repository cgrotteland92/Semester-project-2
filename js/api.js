const BASE_API_URL = "https://v2.api.noroff.dev";
const profilesURL = `${BASE_API_URL}/auction/profiles`;

export const headers = {
  "Content-Type": "application/json",
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2dyb3R0ZWxhbmQiLCJlbWFpbCI6ImNocmdybzAyMTIyQHN0dWQubm9yb2ZmLm5vIiwiaWF0IjoxNzQ0MzAwNDgyfQ.n3AMABfJbCbzD3ROEmeh77Gn7ETHGPkA-rY6rvfQ9VE",
  "X-Noroff-API-Key": "0b0117c2-c40e-44f7-aa5a-6f18167b328c",
};
/* --------------------- AUTH & USER ENDPOINTS --------------------- */
/**
 * Fetch a single user profile by name.
 * @param {string} profileName - The profile's id or name.
 * @returns {Promise<Object>}
 */
export async function getUserProfile(profileName) {
  try {
    const response = await fetch(`${profilesURL}/${profileName}`, {
      method: "GET",
      headers,
    });
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
 * @param {string} profileName - The profile's id or name.
 * @returns {Promise<Object>}
 */
export async function getUserPosts(profileName) {
  try {
    const response = await fetch(`${profilesURL}/${profileName}/listings`, {
      method: "GET",
      headers,
    });
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
 * Update a user’s profile (bio, avatar, banner).
 * @param {string} profileName
 * @param {Object} payload – any of { bio, avatar: {url,alt}, banner: {url,alt} }
 * @returns {Promise<Object>} the updated { data, meta }
 */
export async function updateUserProfile(profileName, payload) {
  try {
    const res = await fetch(`${profilesURL}/${profileName}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
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

/**
 * Create a new auction listing.
 * @param {Object} listingData - The listing data to create
 * @param {string} listingData.title - Title of the listing (required)
 * @param {string} [listingData.description] - Description of the listing
 * @param {Array<string>} [listingData.tags] - Array of tags for the listing
 * @param {Array<string>} [listingData.media] - Array of media URLs for the listing
 * @param {string} listingData.endsAt - ISO date string for when the auction ends (required)
 * @returns {Promise<Object>} - The created listing data
 */
export async function createListing(listingData) {
  try {
    // Validate required fields
    if (!listingData.title) {
      throw new Error("Listing title is required");
    }

    if (!listingData.endsAt) {
      throw new Error("Auction end date is required");
    }

    const response = await fetch(`${BASE_API_URL}/auction/listings`, {
      method: "POST",
      headers,
      body: JSON.stringify(listingData),
    });

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
      headers,
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch listings (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error; // rethrow so displayPosts can catch
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
