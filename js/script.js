import { fetchPosts } from "./api.js";
import { showMessage } from "./utils/message.js";

const newListingContainer = document.getElementById("new-listing-container");
const endingSoonContainer = document.getElementById("ending-soon-container");
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
    [newListingContainer, endingSoonContainer, allPostsContainer].forEach((c) =>
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

  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const endingToday = posts
    .filter((p) => p.endsAt > now && p.endsAt <= endOfToday)
    .sort((a, b) => a.endsAt - b.endsAt);

  const allListings = newListings;

  initCarousel(newListings);
  renderSection(endingToday, endingSoonContainer, "No listings ending today.");
  renderSection(allListings, allPostsContainer, "No listings available.");
}

function initCarousel(postsData) {
  const latestPosts = postsData.slice(0, 9);
  let carouselHTML = "";
  latestPosts.forEach((post) => {
    carouselHTML += `
      <div class="carousel-item flex-shrink-0 w-64 px-2">
        <div class="bg-white border border-black dark:border-white 
                    text-black dark:text-white p-4 rounded-lg">
          <h2 class="text-lg font-semibold mb-2">${post.title}</h2>
          <p class="text-sm mb-2">
            By ${
              post.seller?.name || "Unknown"
            } on ${post.created.toLocaleDateString()}
          </p>
          ${
            post.media?.[0]
              ? `<img src="${post.media[0].url}"
                      alt="${post.media[0].alt || ""}"
                      class="w-full h-40 object-cover mb-4 rounded" />`
              : ""
          }
          <button 
            class="read-more mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onclick="goToPost('${post.id}')"
          >
            Read More
          </button>
        </div>
      </div>`;
  });
  console.log(postsData);

  const slideContainer = newListingContainer.querySelector(".carousel-slide");
  slideContainer.innerHTML = carouselHTML;

  let currentIndex = 0;
  const totalItems = latestPosts.length;
  const items = slideContainer.querySelectorAll(".carousel-item");

  const style = getComputedStyle(items[0]);
  const itemWidth =
    items[0].offsetWidth +
    parseFloat(style.marginLeft) +
    parseFloat(style.marginRight);

  const prevBtn = newListingContainer.querySelector(".prev");
  const nextBtn = newListingContainer.querySelector(".next");

  prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    slideContainer.style.transform = `translateX(${
      -currentIndex * itemWidth
    }px)`;
  };
  nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % totalItems;
    slideContainer.style.transform = `translateX(${
      -currentIndex * itemWidth
    }px)`;
  };
}

function renderSection(posts, container, emptyMessage) {
  const MAX_LEN = 100;
  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML = `<p class="text-gray-500 italic">${emptyMessage}</p>`;
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className =
      "bg-white border border-black dark:border-white text-black dark:text-white " +
      "p-4 rounded-lg mb-4 cursor-pointer";

    const desc = post.description || "";
    const shortDesc =
      desc.length > MAX_LEN ? desc.slice(0, MAX_LEN) + "…" : desc;

    card.innerHTML = `
      <h2 class="text-lg font-semibold mb-2">${post.title}</h2>

      <p class="text-sm mb-2">${shortDesc}</p>

      ${
        post.media?.[0]
          ? `<img src="${post.media[0].url}"
                  alt="${post.media[0].alt || ""}"
                  class="max-w-full h-auto mb-4 mx-auto rounded" />`
          : ""
      }

      ${
        desc.length > MAX_LEN
          ? `<button class="text-blue-500 text-xs mb-2" onclick="goToPost('${post.id}')">
               Read more
             </button>`
          : ""
      }

      <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Listed: ${post.created.toLocaleDateString()}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Ends: ${post.endsAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p class="text-xs text-gray-600 dark:text-gray-300">
        Bids: ${post._count?.bids ?? 0}
      </p>
    `;

    container.appendChild(card);
  });
}

displayPosts(() => fetchPosts({ _seller: true, _bids: true }));
