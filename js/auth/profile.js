import {
  getUserProfile,
  getUserPosts,
  getUserBids,
  getUserWins,
  updateUserProfile,
  createListing,
} from "../api.js";
import { getLoggedInUser } from "./auth.js";
import { showSkeletonLoader } from "../utils/skeletonLoader.js";
import { formatTimeRemaining, renderEndsAt } from "../utils/timeRemaining.js";
import { showMessage } from "../utils/message.js";

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
  loadUserBids(username);
  loadUserWins(username);

  if (username === me) {
    setupEditProfile(username);
    setupCreateListing();
  }
});

/**
 * Fetches all bids by this user and renders them in a card grid.
 */
async function loadUserBids(username) {
  const container = document.getElementById("bids-grid");
  if (!container) return;
  container.innerHTML = "";
  showSkeletonLoader(container, 3);

  try {
    const { data: bids } = await getUserBids(username);
    container.innerHTML = "";

    if (bids.length === 0) {
      showMessage(container, "No bids placed yet.");
      return;
    }

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

    bids.forEach((bid) => {
      const card = document.createElement("div");
      card.className =
        "bg-white shadow rounded-lg overflow-hidden flex flex-col";

      const body = document.createElement("div");
      body.className = "p-4 flex-1 flex flex-col";
      const title = document.createElement("h3");
      title.textContent = bid.listing.title;
      title.className = "font-semibold text-lg mb-2 truncate";
      body.appendChild(title);

      const amount = document.createElement("p");
      amount.textContent = `Your bid: ${Number(
        bid.amount
      ).toLocaleString()} 🪙`;
      amount.className = "text-gray-600 text-sm mb-4";
      body.appendChild(amount);

      const link = document.createElement("a");
      link.href = `/post/listing.html?id=${encodeURIComponent(bid.listing.id)}`;
      link.className =
        "mt-auto inline-block bg-black text-white px-3 py-2 rounded hover:bg-gray-800 text-center";
      link.textContent = "View Listing";
      body.appendChild(link);

      card.appendChild(body);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch (err) {
    console.error("Could not load user bids:", err);
    showMessage(container, "Error loading bids.", true);
  }
}

/**
 * Fetches all listings a user has won and renders them in a card grid.
 */
async function loadUserWins(username) {
  const container = document.getElementById("wins-grid");
  if (!container) return;
  container.innerHTML = "";
  showSkeletonLoader(container, 3);

  try {
    const { data: wins } = await getUserWins(username);
    container.innerHTML = "";

    if (wins.length === 0) {
      showMessage(container, "No wins yet.");
      return;
    }

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

    wins.forEach((win) => {
      const card = document.createElement("div");
      card.className =
        "bg-white shadow rounded-lg overflow-hidden flex flex-col";

      const body = document.createElement("div");
      body.className = "p-4 flex-1 flex flex-col";
      const title = document.createElement("h3");
      title.textContent = win.title;
      title.className = "font-semibold text-lg mb-2 truncate";
      body.appendChild(title);

      const date = document.createElement("p");
      date.textContent = `Won on: ${new Date(win.endsAt).toLocaleDateString()}`;
      date.className = "text-gray-600 text-sm mb-4";
      body.appendChild(date);

      const link = document.createElement("a");
      link.href = `/post/listing.html?id=${encodeURIComponent(win.id)}`;
      link.className =
        "mt-auto inline-block bg-[#DA7756] hover:bg-[#da7756ab] text-white px-3 py-2 rounded text-center";
      link.textContent = "View Listing";
      body.appendChild(link);

      card.appendChild(body);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch (err) {
    console.error("Could not load user wins:", err);
    showMessage(container, "Error loading wins.", true);
  }
}

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
    const container = document.getElementById("profile-section");
    if (container) {
      showMessage(container, "Error loading profile.", true);
    }
  }
}

/**
 * Fetches user posts and renders them in the posts grid
 */
async function loadUserPosts(username) {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;

  showSkeletonLoader(grid, 3);
  grid.className = "grid grid-cols-1 md:grid-cols-2 gap-8";

  try {
    const { data: posts } = await getUserPosts(username);
    grid.innerHTML = "";

    if (posts.length === 0) {
      showMessage(grid, "No listings yet.");
      return;
    }

    posts.forEach((post) => {
      const link = document.createElement("a");
      link.href = `/post/listing.html?id=${encodeURIComponent(post.id)}`;
      link.className = "block";

      const card = document.createElement("div");
      card.className =
        "bg-white shadow rounded-lg p-6 flex space-x-6 " +
        "items-start hover:shadow-2xl transition duration-200";

      const img = document.createElement("img");
      if (post.media?.[0]) {
        img.src = post.media[0].url;
        img.alt = post.media[0].alt || post.title;
      }
      img.className =
        "w-40 h-40 object-cover rounded-md flex-shrink-0 bg-gray-100";
      card.appendChild(img);

      const details = document.createElement("div");
      details.className = "flex-1 flex flex-col";

      const title = document.createElement("h3");
      title.textContent = post.title;
      title.className = "font-semibold text-xl text-headers mb-2";
      details.appendChild(title);

      const desc = document.createElement("p");
      desc.className = "text-gray-700 text-sm text-headers flex-grow mb-3";
      const fullText = post.description || "";
      const shortText =
        fullText.length > 120 ? fullText.slice(0, 120) + "…" : fullText;
      desc.textContent = shortText;
      details.appendChild(desc);

      const meta = document.createElement("div");
      meta.className = "flex items-center text-gray-500 text-sm space-x-4";

      const time = document.createElement("span");
      time.innerHTML = `<i class="far fa-clock mr-1"></i>${formatTimeRemaining(
        new Date(post.endsAt)
      )}`;
      time.title = `Ends at ${new Date(post.endsAt).toLocaleString()}`;
      meta.appendChild(time);

      const bids = document.createElement("span");
      bids.innerHTML = `${post._count.bids || 0} bid${
        post._count.bids === 1 ? "" : "s"
      }`;
      meta.appendChild(bids);

      details.appendChild(meta);

      card.appendChild(details);
      link.appendChild(card);
      grid.appendChild(link);
    });
  } catch (err) {
    console.error("Could not load user posts:", err);
    grid.innerHTML = "";
    showMessage(grid, "Error loading posts.", true);
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

  const createBtn = document.getElementById("show-create-listing");
  const form = document.getElementById("create-listing-form");
  const cancelBtn = document.getElementById("cancel-create-listing");
  const feedback = document.getElementById("create-feedback");

  if (!createBtn || !form || !cancelBtn || !feedback) return;

  form.hidden = true;
  createBtn.hidden = false;

  createBtn.addEventListener("click", () => {
    form.hidden = false;
    createBtn.hidden = true;
  });

  cancelBtn.addEventListener("click", () => {
    form.style.display = "none";
    create.style.display = "";
    feedback.style.display = "none";
    feedback.textContent = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.style.display = "none";
    feedback.textContent = "";

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
      showMessage(feedback, "Title is required.", true);
      feedback.style.display = "block";
      return;
    }
    if (!endsAt) {
      showMessage(feedback, "End date/time is required.", true);
      feedback.style.display = "block";
      return;
    }

    try {
      const newListing = await createListing({
        title,
        description,
        tags,
        media,
        endsAt,
      });
      showMessage(feedback, `✅ Created listing ID: ${newListing.data.id}`);
      feedback.style.display = "block";
      form.reset();
    } catch (err) {
      console.error("Error creating listing:", err);
      showMessage(feedback, `❌ ${err.message}`, true);
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
  btnToggle.id = "edit-profile-button";
  btnToggle.className =
    "absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow text-headers hover:bg-gray-100";
  const icon = document.createElement("i");
  icon.className = "fas fa-pencil-alt mr-2";
  btnToggle.appendChild(icon);

  btnToggle.appendChild(document.createTextNode("Edit Profile"));

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
      showMessage(
        section,
        "Please change at least one field before saving.",
        true
      );
      return;
    }

    try {
      await updateUserProfile(username, payload);
      form.style.display = "none";
      btnToggle.style.display = "block";
      await loadProfile(username);
    } catch (err) {
      console.error("Error updating profile:", err);
      showMessage(
        section,
        "Failed to update profile. Make sure your image URLs are public and valid.",
        true
      );
    }
  });
}
