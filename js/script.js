import { fetchPosts, createPost } from "./api.js";
import { showMessage } from "./utils/message.js";
import { formatTimeRemaining } from "./utils/timeRemaining.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";

const newListingContainer = document.getElementById("new-listing-container");
const allPostsContainer = document.getElementById("listing-container");

let allListings = [];

/**
 * Turns an end date into either "Ended" or a countdown string.
 */
function renderEndsAt(date) {
  const now = Date.now();
  return date.getTime() < now
    ? "Ended"
    : `Ends in: ${formatTimeRemaining(date)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const btnToggle = document.getElementById("btnToggleCreatePost");
  const formSection = document.getElementById("createPostSection");
  const form = document.getElementById("formCreatePost");
  const msgBanner = document.getElementById("postMessage");
  const submitButton = document.getElementById("btnSubmitPost");

  btnToggle.addEventListener("click", () => {
    formSection.classList.toggle("hidden");
    msgBanner.classList.add("hidden");
    msgBanner.textContent = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = "Submitting…";
    msgBanner.classList.add("hidden");

    const titleInput = document.getElementById("postTitle");
    const descriptionInput = document.getElementById("postDescription");
    const tagsInput = document.getElementById("postTags");
    const mediaUrlInput = document.getElementById("postMediaUrl");
    const mediaAltInput = document.getElementById("postMediaAlt");
    const endsAtInput = document.getElementById("postEndsAt");

    const endsAtRaw = endsAtInput.value;
    const postData = {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      tags: tagsInput.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      media: mediaUrlInput.value
        ? [{ url: mediaUrlInput.value.trim(), alt: mediaAltInput.value.trim() }]
        : [],
      endsAt: new Date(endsAtRaw).toISOString(),
    };

    try {
      const result = await createPost(postData);
      console.log("Post creation result:", result);

      if (result) {
        await displayPosts(() => fetchPosts({ _seller: true, _bids: true }));
        showMessage(msgBanner, "Post created successfully!", false);
        form.reset();

        allPostsContainer.scrollIntoView({ behavior: "smooth" });

        const sortFilter = document.getElementById("sort-filter");
        if (sortFilter) sortFilter.value = "newest";
      } else {
        throw new Error("No result returned from createPost");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      showMessage(msgBanner, "Failed to create listing: " + err.message, true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
  });
});

/**
 * Fetches posts using the provided fetch function and renders them,
 * showing skeleton loaders while waiting.
 */
async function displayPosts(fetchFunction) {
  console.log("Fetching posts...");
  if (newListingContainer) {
    newListingContainer.innerHTML = "";
    showSkeletonLoader(newListingContainer, 5);
  }
  if (allPostsContainer) {
    allPostsContainer.innerHTML = "";
    showSkeletonLoader(allPostsContainer, 5);
  }

  try {
    const postsResponse = await fetchFunction();
    console.log("Fetched posts:", postsResponse);
    if (!postsResponse || !Array.isArray(postsResponse.data)) {
      throw new Error("No posts available");
    }
    renderPosts(postsResponse.data);
    setupFilter();
  } catch (error) {
    console.error("Error displaying posts:", error);
    // Display error banners in both sections
    [newListingContainer, allPostsContainer].forEach((c) => {
      if (c)
        showMessage(c, "Error loading posts. Please try again later.", true);
    });
  }
}

/**
 * Parses dates, sorts posts newest-first, and renders sections.
 */
function renderPosts(data) {
  console.log("Rendering posts with data:", data);
  const posts = data.map((p) => ({
    ...p,
    created: new Date(p.created),
    endsAt: new Date(p.endsAt),
  }));

  // Sort descending by creation date
  const sortedPosts = posts.sort((a, b) => b.created - a.created);
  allListings = sortedPosts;
  console.log("Sorted posts:", sortedPosts);

  initCarousel(sortedPosts);
  renderSection(sortedPosts, allPostsContainer, "No listings available.");
}

/**
 * Sets up sorting/filtering.
 */
function setupFilter() {
  const sortFilter = document.getElementById("sort-filter");
  if (!sortFilter) return;

  sortFilter.addEventListener("change", () => {
    const value = sortFilter.value;
    const now = Date.now();
    let filtered = [...allListings];

    if (value === "newest") {
      filtered.sort((a, b) => b.created - a.created);
    } else if (value === "oldest") {
      filtered.sort((a, b) => a.created - b.created);
    } else if (value === "ended") {
      filtered = filtered.filter((p) => p.endsAt.getTime() < now);
    }

    renderSection(filtered, allPostsContainer, "No listings available.");
  });
}

/**
 * Builds the carousel slides.
 */
function initCarousel(posts) {
  const MAX_TITLE = 50;
  const carousel = document.getElementById("newListingCarousel");
  carousel.classList.add("flex", "overflow-x-hidden", "relative", "w-full");

  carousel.innerHTML = posts
    .slice(0, 9)
    .map(
      (post) => `
      <div class="carousel-slide snap-start flex-shrink-0 w-full px-2">
        <div class="bg-white border border-black text-black p-4 rounded-lg">
          <h2 class="text-lg font-semibold mb-2 break-all">
            ${
              post.title.length > MAX_TITLE
                ? post.title.slice(0, MAX_TITLE) + "…"
                : post.title
            }
          </h2>
          <p class="text-sm mb-2">
            By ${
              post._seller?.name || "Unknown"
            } on ${post.created.toLocaleDateString()}
          </p>
          <p class="text-sm mb-2 text-red-600">
            ${renderEndsAt(post.endsAt)}
          </p>
          ${
            post.media?.[0]
              ? `<img src="${post.media[0].url}" alt="${
                  post.media[0].alt || ""
                }" class="w-full max-h-64 object-contain mb-4 rounded" />`
              : ""
          }
          <button
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onclick="goToPost('${post.id}')"
          >Read More</button>
        </div>
      </div>`
    )
    .join("");

  const prev = document.getElementById("prevNew");
  const next = document.getElementById("nextNew");

  prev.addEventListener("click", () => {
    carousel.scrollBy({ left: -carousel.clientWidth, behavior: "smooth" });
  });
  next.addEventListener("click", () => {
    carousel.scrollBy({ left: carousel.clientWidth, behavior: "smooth" });
  });

  carousel.addEventListener("scroll", () => {
    const slideIndex = Math.round(carousel.scrollLeft / carousel.clientWidth);
    prev.classList.toggle("opacity-50", slideIndex === 0);
    next.classList.toggle("opacity-50", slideIndex === posts.length - 1);
  });
}

/**
 * Renders the listing grid.
 */
function renderSection(posts, container, emptyMessage) {
  const MAX_LEN = 100;
  const MAX_TITLE = 38;
  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML = `<p class="text-gray-500 italic">${emptyMessage}</p>`;
    return;
  }

  posts.forEach((post) => {
    const desc = post.description || "";
    const shortDesc =
      desc.length > MAX_LEN ? desc.slice(0, MAX_LEN) + "…" : desc;
    const card = document.createElement("div");

    card.className =
      "bg-white border border-black text-black p-4 rounded-lg mb-4 cursor-pointer";

    card.innerHTML = `
      <h2 class="text-lg font-semibold mb-2 break-all">
        ${
          post.title.length > MAX_TITLE
            ? post.title.slice(0, MAX_TITLE) + "…"
            : post.title
        }
      </h2>
      ${
        post.media?.[0]
          ? `<img src="${post.media[0].url}" alt="${
              post.media[0].alt || ""
            }" class="w-full max-h-56 object-contain mb-4 rounded" />`
          : ""
      }
      <p class="text-sm mb-2 break-all">${shortDesc}</p>
      ${
        desc.length > MAX_LEN
          ? `<button class="text-blue-500 text-xs mb-2" onclick="goToPost('${post.id}')">Read more</button>`
          : ""
      }
      <p class="text-xs text-gray-500 mb-1">
        By ${
          post.seller?.name || "Unknown"
        } · Listed: ${post.created.toLocaleDateString()}
      </p>
      <p class="text-xs text-gray-500 mb-3">
        ${renderEndsAt(post.endsAt)}
      </p>
      <p class="text-xs text-gray-600">
        Bids: ${post._count?.bids ?? 0}
      </p>
    `;

    container.appendChild(card);
  });
}

const stored = localStorage.getItem("user");
const user = stored ? JSON.parse(stored) : null;
const filter =
  user && user.name
    ? { seller: user.name, _seller: true, _bids: true }
    : { _seller: true, _bids: true };

displayPosts(() => fetchPosts(filter));
