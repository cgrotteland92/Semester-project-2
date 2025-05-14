import { fetchPosts } from "./api.js";
import { showMessage } from "./utils/message.js";
import { renderEndsAt } from "./utils/timeRemaining.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";

const slides = [
  "https://images.unsplash.com/photo-1545518514-ce8448f542b3?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1604242692760-2f7b0c26856d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1611222777277-61319d63ca94?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1551201602-3f9456f0fbf8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1470940511639-1068d7764233?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];
let currentSlide = 0;
const welcomeImg = document.getElementById("welcome-image");
if (welcomeImg) {
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    welcomeImg.src = slides[currentSlide];
  }, 5000);
}

const newListingContainer = document.getElementById("new-listing-container");
const allPostsContainer = document.getElementById("listing-container");

let allListings = [];
let currentPage = 1;
const pageSize = 12;

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

  const sortedPosts = posts.sort((a, b) => b.created - a.created);
  allListings = sortedPosts;
  console.log("Sorted posts:", sortedPosts);

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
 * Renders the listing grid.
 */
function renderSection(posts, container, emptyMessage) {
  const MAX_LEN = 100;
  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML = `<p class="text-gray-500 italic">${emptyMessage}</p>`;
    return;
  }

  posts.forEach((post, i) => {
    if (i === 12) {
      const ad = document.createElement("div");
      ad.className =
        "col-span-full bg-blue-100 rounded-lg shadow p-6 text-center";

      const adImg = document.createElement("img");
      adImg.src = "https://source.unsplash.com/600x200/?auction,featured";
      adImg.alt = "Premium Listings";
      adImg.className = "w-full h-40 object-cover rounded mb-4";
      ad.appendChild(adImg);

      const adTitle = document.createElement("h3");
      adTitle.textContent = "Sponsored";
      adTitle.className = "text-2xl font-semibold mb-2";
      ad.appendChild(adTitle);

      const adCopy = document.createElement("p");
      adCopy.textContent = "Check out our premium listings!";
      adCopy.className = "text-gray-700 mb-4";
      ad.appendChild(adCopy);

      const adButton = document.createElement("a");
      adButton.href = "/premium";
      adButton.textContent = "Learn More";
      adButton.className = "px-4 py-2 bg-green-500 text-white rounded-lg";
      ad.appendChild(adButton);

      container.appendChild(ad);
    }

    const link = document.createElement("a");
    link.href = `/post/listing.html?id=${encodeURIComponent(post.id)}`;
    link.className = "block";

    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow p-4 flex flex-col h-full";

    const mediaItem = post.media?.[0];
    if (mediaItem) {
      const img = document.createElement("img");
      img.src = mediaItem.url;
      img.alt = mediaItem.alt || post.title;
      img.className = "w-full h-60 object-cover rounded-md mb-3";
      card.appendChild(img);
    }

    const title = document.createElement("h3");
    title.textContent = post.title;
    title.className = "font-semibold text-lg mb-2 truncate";
    card.appendChild(title);

    const sellerWrapper = document.createElement("p");
    sellerWrapper.className = "flex items-center text-gray-600 text-sm mb-2";

    const avatarImg = document.createElement("img");
    avatarImg.src = post.seller?.avatar?.url;
    avatarImg.alt =
      post.seller?.avatar?.alt || post.seller?.name || "Seller avatar";
    avatarImg.className = "w-6 h-6 rounded-full mr-2";
    sellerWrapper.appendChild(avatarImg);

    const sellerLink = document.createElement("a");
    sellerLink.textContent = post.seller?.name || "Unknown";
    sellerLink.href = `/account/profile.html?user=${encodeURIComponent(
      post.seller?.name
    )}`;
    sellerLink.className = "hover:underline";
    sellerLink.addEventListener("click", (e) => e.stopPropagation());
    sellerWrapper.appendChild(sellerLink);

    card.appendChild(sellerWrapper);

    const fullText = post.description || "";
    const desc = document.createElement("p");
    desc.className = "text-gray-700 text-sm flex-grow truncate";
    if (fullText.length > MAX_LEN) {
      const shortText = fullText.slice(0, MAX_LEN) + "... ";
      desc.textContent = shortText;

      const moreText = document.createElement("span");
      moreText.textContent = "Read more";
      moreText.className = "text-blue-500 underline text-sm cursor-pointer";
      moreText.addEventListener("click", () => {
        if (moreText.textContent === "Read more") {
          desc.textContent = fullText + " ";
          moreText.textContent = "Show less";
        } else {
          desc.textContent = shortText;
          moreText.textContent = "Read more";
        }
        desc.appendChild(moreText);
      });
      desc.appendChild(moreText);
    } else {
      desc.textContent = fullText;
    }
    card.appendChild(desc);

    const tagsDiv = document.createElement("div");
    tagsDiv.className = "flex flex-wrap mt-2";
    (post.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      span.className =
        "px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-2 mb-2";
      tagsDiv.appendChild(span);
    });
    card.appendChild(tagsDiv);

    const endsAt = document.createElement("p");
    const endDate = new Date(post.endsAt);
    endsAt.textContent = renderEndsAt(endDate);
    endsAt.title = `Ends at ${endDate.toLocaleString()}`;
    endsAt.className = "text-gray-500 text-xs mt-2";
    card.appendChild(endsAt);

    link.appendChild(card);
    container.appendChild(link);
  });
}

const stored = localStorage.getItem("user");
const user = stored ? JSON.parse(stored) : null;
const filter =
  user && user.name
    ? { seller: user.name, _seller: true, _bids: true }
    : { _seller: true, _bids: true };

displayPosts(() => fetchPosts(filter));
