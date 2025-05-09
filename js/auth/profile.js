import {
  getUserProfile,
  getUserPosts,
  updateUserProfile,
  createListing,
} from "../api.js";
import { getLoggedInUser } from "./auth.js";
import { showSkeletonLoader } from "../utils/skeletonLoader.js";

let currentProfileData = null;

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const paramUser = params.get("user");
  const me = getLoggedInUser()?.data?.name;
  const username = paramUser || me;

  if (!username) {
    window.location.href = "/account/login.html";
    return;
  }

  loadProfile(username);
  loadUserPosts(username);

  if (username === me) {
    setupEditProfile(username);
    setupCreateListing();
  }
});

/**
 * Fetches profile info and injects into the DOM & pre-fills the edit form
 */
async function loadProfile(username) {
  try {
    const { data } = await getUserProfile(username);
    currentProfileData = data;

    document.getElementById("profile-banner").src = data.banner.url;
    document.getElementById("profile-banner").alt = data.banner.alt;

    document.getElementById("profile-avatar").src = data.avatar.url;
    document.getElementById("profile-avatar").alt = data.avatar.alt;

    document.getElementById("profile-name").textContent = data.name;
    document.getElementById("profile-email").textContent = data.email;
    document.getElementById("profile-bio").textContent = data.bio;

    document.getElementById("count-listings").textContent =
      data._count.listings;
    document.getElementById("count-wins").textContent = data._count.wins;
    document.getElementById("count-credits").textContent = data.credits;

    const eb = document.getElementById("edit-bio");
    if (eb) eb.value = data.bio || "";
    const eBanner = document.getElementById("edit-banner-url");
    if (eBanner) eBanner.value = data.banner.url;
    const eAvatar = document.getElementById("edit-avatar-url");
    if (eAvatar) eAvatar.value = data.avatar.url;
  } catch (err) {
    console.error("Could not load profile:", err);
    const nameEl = document.getElementById("profile-name");
    if (nameEl) nameEl.textContent = "Error loading profile";
  }
}

/**
 * Fetches user posts and renders them in the posts grid
 */
async function loadUserPosts(username) {
  try {
    const { data: posts } = await getUserPosts(username);
    const grid = document.getElementById("posts-grid");
    grid.innerHTML = "";

    if (posts.length === 0) {
      grid.textContent = "No posts yet.";
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow p-4 flex flex-col";

      const mediaItem = post.media?.[0];
      if (mediaItem) {
        const img = document.createElement("img");
        img.src = mediaItem.url;
        img.alt = mediaItem.alt || post.title;
        img.className = "w-full h-40 object-cover rounded-md mb-3";
        card.appendChild(img);
      }

      const title = document.createElement("h3");
      title.textContent = post.title;
      title.className = "font-semibold text-lg mb-2";
      card.appendChild(title);

      const desc = document.createElement("p");
      desc.textContent = post.description || "";
      desc.className = "text-gray-700 text-sm flex-grow";
      card.appendChild(desc);

      const endsAt = document.createElement("p");
      endsAt.textContent = "Ends: " + new Date(post.endsAt).toLocaleString();
      endsAt.className = "text-gray-500 text-xs mt-2";
      card.appendChild(endsAt);

      const link = document.createElement("a");
      link.href = `/post/listing.html?id=${encodeURIComponent(post.id)}`;
      link.appendChild(card);

      grid.appendChild(link);
    });
  } catch (err) {
    console.error("Could not load user posts:", err);
    const grid = document.getElementById("posts-grid");
    if (grid) grid.textContent = "Error loading posts.";
  }
}

/**
 * Sets up the Create Listing form.
 */
function setupCreateListing() {
  const section = document.getElementById("create-listing-section");
  if (!section) {
    console.warn("No create-listing-section found in HTML.");
    return;
  }

  const toggleBtn = document.createElement("button");
  toggleBtn.id = "btnToggleCreate";
  toggleBtn.innerText = "Create Listing";
  toggleBtn.className =
    "bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-4";
  section.insertBefore(toggleBtn, section.firstChild);

  const form = document.getElementById("create-listing-form");
  const feedback = document.getElementById("create-feedback");
  const cancelBtn = document.getElementById("cancel-create-listing");

  toggleBtn.addEventListener("click", () => {
    form.style.display = "block";
    toggleBtn.style.display = "none";
  });

  cancelBtn?.addEventListener("click", () => {
    form.style.display = "none";
    toggleBtn.style.display = "block";
    feedback.style.display = "none";
    feedback.textContent = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "";
    feedback.className = "";
    feedback.style.display = "none";

    const title = form["listing-title"].value.trim();
    const description = form["listing-description"].value.trim();
    const tags = form["listing-tags"].value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const endsAtInput = form["listing-endsAt"].value;
    const endsAt = endsAtInput ? new Date(endsAtInput).toISOString() : null;

    const media = [];
    const urlFields = form.querySelectorAll(".media-url");
    const altFields = form.querySelectorAll(".media-alt");
    urlFields.forEach((input, i) => {
      const url = input.value.trim();
      const alt = altFields[i].value.trim();
      if (url) media.push({ url, alt: alt || "" });
    });

    if (!title) {
      feedback.textContent = "Title is required.";
      feedback.classList.add("text-red-500");
      feedback.style.display = "block";
      return;
    }
    if (!endsAt) {
      feedback.textContent = "End date/time is required.";
      feedback.classList.add("text-red-500");
      feedback.style.display = "block";
      return;
    }

    const payload = { title, description, tags, media, endsAt };

    try {
      const newListing = await createListing(payload);
      feedback.textContent = `✅ Created listing ID: ${newListing.data.id}`;
      feedback.classList.add("text-green-600");
      feedback.style.display = "block";
      form.reset();
    } catch (err) {
      console.error("Error creating listing:", err);
      feedback.textContent = `❌ ${err.message}`;
      feedback.classList.add("text-red-500");
      feedback.style.display = "block";
    }
  });
}

function setupEditProfile(username) {
  const section = document.getElementById("edit-profile");
  if (!section) {
    console.warn("No edit-profile section found in HTML.");
    return;
  }

  const btnToggle = document.createElement("button");
  btnToggle.id = "btnToggleEdit";
  btnToggle.innerText = "Edit Profile";
  btnToggle.className =
    "bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 mx-8 mb-4";
  section.insertBefore(btnToggle, section.firstChild);

  const form = document.getElementById("edit-profile-form");
  const cancelBtn = document.getElementById("cancel-edit");
  btnToggle.addEventListener("click", () => {
    form.style.display = "block";
    btnToggle.style.display = "none";
  });
  cancelBtn?.addEventListener("click", () => {
    form.style.display = "none";
    btnToggle.style.display = "block";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bioVal = document.getElementById("edit-bio").value.trim();
    const bannerVal = document.getElementById("edit-banner-url").value.trim();
    const avatarVal = document.getElementById("edit-avatar-url").value.trim();

    const payload = {};
    if (bioVal && bioVal !== currentProfileData.bio) payload.bio = bioVal;
    if (bannerVal && bannerVal !== currentProfileData.banner.url)
      payload.banner = {
        url: bannerVal,
        alt: currentProfileData.banner.alt || "",
      };
    if (avatarVal && avatarVal !== currentProfileData.avatar.url)
      payload.avatar = {
        url: avatarVal,
        alt: currentProfileData.avatar.alt || "",
      };

    if (Object.keys(payload).length === 0) {
      return alert("Please change at least one field before saving.");
    }

    try {
      await updateUserProfile(username, payload);
      form.style.display = "none";
      btnToggle.style.display = "block";
      await loadProfile(username);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(
        "Failed to update profile. Make sure your image URLs are public and valid."
      );
    }
  });
}
