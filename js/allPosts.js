import { fetchPosts } from "./api.js";
import { showMessage } from "./utils/message.js";
import { renderEndsAt } from "./utils/timeRemaining.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";
import { renderSection } from "./utils/renderSection.js"; // ✅ Import modular renderSection

const allListingsContainer = document.getElementById("all-listings-container");

let allListings = [];
let currentPage = 1;
const pageSize = 12;

async function displayPosts(fetchFunction) {
  console.log("Fetching posts...");

  if (allListingsContainer) {
    allListingsContainer.innerHTML = "";
    showSkeletonLoader(allListingsContainer, 5);
  }

  try {
    const postsResponse = await fetchFunction();
    allListings = postsResponse.data
      .map((p) => ({
        ...p,
        created: new Date(p.created),
        endsAt: new Date(p.endsAt),
      }))
      .sort((a, b) => b.created - a.created);

    currentPage = 1;
    renderCurrentPage();
    setupFilter(); // You can modularize this next if needed
  } catch (error) {
    console.error("Error displaying posts:", error);
    showMessage(
      allListingsContainer,
      "Error loading posts. Please try again later.",
      true
    );
  }
}

function renderCurrentPage() {
  const start = (currentPage - 1) * pageSize;
  const pagePosts = allListings.slice(start, start + pageSize);
  renderSection(pagePosts, allListingsContainer, "No listings available.");
  renderPagination();
}

function renderPagination() {
  let pg = document.getElementById("pagination");
  if (!pg) {
    pg = document.createElement("div");
    pg.id = "pagination";
    pg.className = "flex justify-center items-center space-x-4 mt-6";
    allListingsContainer.parentNode.appendChild(pg);
  }
  pg.innerHTML = "";

  const totalPages = Math.ceil(allListings.length / pageSize);
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "‹ Prev";
  prev.disabled = currentPage === 1;
  prev.className =
    "px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300";
  prev.addEventListener("click", () => {
    currentPage--;
    renderCurrentPage();
  });

  const info = document.createElement("span");
  info.textContent = `Page ${currentPage} of ${totalPages}`;

  const next = document.createElement("button");
  next.textContent = "Next ›";
  next.disabled = currentPage === totalPages;
  next.className =
    "px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300";
  next.addEventListener("click", () => {
    currentPage++;
    renderCurrentPage();
  });

  pg.append(prev, info, next);
}

displayPosts(fetchPosts);
