import { fetchPosts } from "./api.js";
import { showMessage } from "./utils/message.js";
import { formatTimeRemaining } from "./utils/timeRemaining.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";

// Correct container references
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

/**
 * Fetches posts using the provided fetch function and renders them,
 * showing skeleton loaders while waiting.
 */
async function displayPosts(fetchFunction) {
  // Show skeleton loaders immediately
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
    if (!postsResponse || !Array.isArray(postsResponse.data)) {
      throw new Error("No posts available");
    }
    renderPosts(postsResponse.data);
    setupFilter();
  } catch (error) {
    console.error("Error displaying posts:", error);
    [newListingContainer, allPostsContainer].forEach(
      (c) => c && showMessage(c, "Error loading posts. Please try again later.")
    );
  }
}

/**
 * Parses dates, splits into sections, and fires off render calls.
 */
function renderPosts(data) {
  const posts = data.map((p) => ({
    ...p,
    created: new Date(p.created),
    endsAt: new Date(p.endsAt),
  }));

  const newListings = [...posts].sort((a, b) => b.created - a.created);
  allListings = [...posts];

  initCarousel(newListings);
  renderSection(allListings, allPostsContainer, "No listings available.");
}

/**
 * Sets up sorting/filtering.
 */
function setupFilter() {
  const sortFilter = document.getElementById("sort-filter");
  if (!sortFilter) return;

  sortFilter.addEventListener("change", () => {
    const value = sortFilter.value;
    let filtered = [...allListings];
    const now = Date.now();

    switch (value) {
      case "newest":
        filtered.sort((a, b) => b.created - a.created);
        break;
      case "oldest":
        filtered.sort((a, b) => a.created - b.created);
        break;
      case "ended":
        filtered = filtered.filter((p) => p.endsAt.getTime() < now);
        break;
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
            post.seller?.name || "Unknown"
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

displayPosts(() => fetchPosts({ _seller: true, _bids: true }));
