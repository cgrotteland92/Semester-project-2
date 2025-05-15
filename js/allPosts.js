import { fetchPosts } from "./api.js";
import { showMessage } from "./utils/message.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";
import { renderSection } from "./utils/renderSection.js";

const allListingsContainer = document.getElementById("all-listings-container");
const sortFilter = document.getElementById("sort-filter");

const stored = localStorage.getItem("user");
const user = stored ? JSON.parse(stored) : null;

// tell the API to only return active auctions, plus metadata we need
const apiFilter = {
  _active: true,
  limit: 100,
  ...(user && user.name
    ? { seller: user.name, _seller: true, _bids: true }
    : { _seller: true, _bids: true }),
};

let allListings = [];
let activeListings = [];
let endedListings = [];
let currentList = [];
let currentPage = 1;
const pageSize = 12;

async function displayPosts() {
  if (allListingsContainer) {
    allListingsContainer.innerHTML = "";
    showSkeletonLoader(allListingsContainer, 9);
  }

  try {
    const { data } = await fetchPosts(apiFilter);

    // parse dates + sort by creation descending
    allListings = data
      .map((p) => ({
        ...p,
        created: new Date(p.created),
        endsAt: new Date(p.endsAt),
      }))
      .sort((a, b) => b.created - a.created);

    // split active vs ended
    const now = Date.now();
    activeListings = allListings.filter((p) => p.endsAt.getTime() > now);
    endedListings = allListings.filter((p) => p.endsAt.getTime() <= now);

    // default to active
    currentList = [...activeListings];
    currentPage = 1;

    renderCurrentPage();
    setupFilter();
  } catch (err) {
    console.error("Error loading posts:", err);
    showMessage(
      allListingsContainer,
      "Error loading posts. Please try again later.",
      true
    );
  }
}

function renderCurrentPage() {
  const start = (currentPage - 1) * pageSize;
  const pageData = currentList.slice(start, start + pageSize);
  renderSection(pageData, allListingsContainer, "No listings available.");
  renderPagination();
}

function setupFilter() {
  if (!sortFilter) return;
  sortFilter.addEventListener("change", () => {
    const v = sortFilter.value;
    const now = Date.now();

    switch (v) {
      case "all":
        currentList = [...allListings];
        break;
      case "ended":
        currentList = [...endedListings].sort((a, b) => b.endsAt - a.endsAt);
        break;
      case "newest":
        currentList = [...activeListings].sort((a, b) => b.created - a.created);
        break;
      case "oldest":
        currentList = [...activeListings].sort((a, b) => a.created - b.created);
        break;
      case "popular":
        currentList = [...activeListings].sort(
          (a, b) => (b._count?.bids || 0) - (a._count?.bids || 0)
        );
        break;
      default:
        // fallback to active
        currentList = [...activeListings];
    }

    currentPage = 1;
    renderCurrentPage();
  });
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

  const totalPages = Math.ceil(currentList.length / pageSize);
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.textContent = "‹ Prev";
  prev.disabled = currentPage === 1;
  prev.className =
    "px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300";
  prev.onclick = () => {
    currentPage--;
    renderCurrentPage();
  };

  const info = document.createElement("span");
  info.textContent = `Page ${currentPage} of ${totalPages}`;

  const next = document.createElement("button");
  next.textContent = "Next ›";
  next.disabled = currentPage === totalPages;
  next.className =
    "px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300";
  next.onclick = () => {
    currentPage++;
    renderCurrentPage();
  };

  pg.append(prev, info, next);
}

// kick it all off!
displayPosts();
