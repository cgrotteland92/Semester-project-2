import { fetchPosts } from "./api.js";
import { showMessage } from "./utils/message.js";

const newListingContainer = document.getElementById("new-listing-container");
const allPostsContainer = document.getElementById("listing-container");

/**
 * Fetches posts using the provided fetch function and renders them.
 */
async function displayPosts(fetchFunction) {
  try {
    const postsResponse = await fetchFunction();
    if (!postsResponse || !Array.isArray(postsResponse.data)) {
      throw new Error("No posts available");
    }
    renderPosts(postsResponse.data);
  } catch (error) {
    console.error("Error displaying posts:", error);
    [newListingContainer, allPostsContainer].forEach((c) =>
      showMessage(c, "Error loading posts. Please try again later.")
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

  const allListings = newListings;

  initCarousel(newListings);
  renderSection(allListings, allPostsContainer, "No listings available.");
}

/**
 * Builds your carousel—one full-width slide at a time.
 */
function initCarousel(posts) {
  const carousel = document.getElementById("newListingCarousel");

  // Make sure the carousel container has these styles
  carousel.classList.add("flex", "overflow-x-hidden", "relative", "w-full");

  // build each slide at 100% of the carousel's width
  carousel.innerHTML = posts
    .slice(0, 9)
    .map(
      (post) => `
    <div class="carousel-slide snap-start flex-shrink-0 w-full px-2">
      <div class="bg-white border border-black 
                  text-black p-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-2">${post.title}</h2>
        <p class="text-sm mb-2">
          By ${
            post.seller?.name || "Unknown"
          } on ${post.created.toLocaleDateString()}
        </p>
        <p class="text-sm mb-2 text-red-600">
          Ends in: ${formatTimeRemaining(post.endsAt)}
        </p>
        ${
          post.media?.[0]
            ? `<img src="${post.media[0].url}"
                    alt="${post.media[0].alt || ""}"
                    class="w-full h-64 object-cover mb-4 rounded" />`
            : ""
        }
        <button
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          onclick="goToPost('${post.id}')"
        >Read More</button>
      </div>
    </div>
  `
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

  let slideIndex = 0;
  const slides = carousel.querySelectorAll(".carousel-slide");

  function updateSlidePosition() {
    slideIndex = Math.round(carousel.scrollLeft / carousel.clientWidth);

    if (slideIndex === 0) {
      prev.classList.add("opacity-50");
    } else {
      prev.classList.remove("opacity-50");
    }

    if (slideIndex === slides.length - 1) {
      next.classList.add("opacity-50");
    } else {
      next.classList.remove("opacity-50");
    }
  }

  carousel.addEventListener("scroll", updateSlidePosition);
}

/**
 * Renders a grid of cards into container.
 */
function renderSection(posts, container, emptyMessage) {
  const MAX_LEN = 100;
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
      "bg-white  border border-black  text-black " +
      "p-4 rounded-lg mb-4 cursor-pointer";

    card.innerHTML = `
      <h2 class="text-lg font-semibold mb-2">${post.title}</h2>
      <p class="text-sm mb-2">${shortDesc}</p>
      ${
        desc.length > MAX_LEN
          ? `<button class="text-blue-500 text-xs mb-2" onclick="goToPost('${post.id}')">
               Read more
             </button>`
          : ""
      }
      ${
        post.media?.[0]
          ? `<img src="${post.media[0].url}"
                  alt="${post.media[0].alt || ""}"
                  class="max-w-full h-auto mb-4 mx-auto rounded" />`
          : ""
      }
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
        By ${
          post.seller?.name || "Unknown"
        } · Listed: ${post.created.toLocaleDateString()}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Ends in: ${formatTimeRemaining(post.endsAt)}
      </p>
      <p class="text-xs text-gray-600 dark:text-gray-300">
        Bids: ${post._count?.bids ?? 0}
      </p>
    `;

    container.appendChild(card);
  });
}

function formatTimeRemaining(endDate) {
  const now = new Date();
  const diff = endDate - now;
  if (diff <= 0) return "Ended";

  const msInMin = 60 * 1000;
  const msInHour = 60 * msInMin;
  const msInDay = 24 * msInHour;

  const days = Math.floor(diff / msInDay);
  const hours = Math.floor((diff % msInDay) / msInHour);
  const mins = Math.floor((diff % msInHour) / msInMin);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins) parts.push(`${mins}m`);
  return parts.join(" ") || "Less than a minute";
}

displayPosts(() => fetchPosts({ _seller: true, _bids: true }));
