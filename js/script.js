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

async function displayPosts(fetchFunction) {
  if (newListingContainer) showSkeletonLoader(newListingContainer, 5);
  if (allPostsContainer) showSkeletonLoader(allPostsContainer, 5);

  try {
    const postsResponse = await fetchFunction();
    if (!postsResponse || !Array.isArray(postsResponse.data)) {
      throw new Error("No posts available");
    }

    const now = Date.now();
    const validPosts = postsResponse.data
      .map((p) => ({
        ...p,
        created: new Date(p.created),
        endsAt: new Date(p.endsAt),
      }))
      .filter((p) => p.endsAt.getTime() > now)
      .sort((a, b) => b.created - a.created);

    allListings = validPosts;

    const limitedPosts = validPosts.slice(0, 6);
    renderSection(limitedPosts, allPostsContainer, "No listings available.");
  } catch (error) {
    console.error("Error displaying posts:", error);
    showMessage(
      allPostsContainer,
      "Error loading posts. Please try again later.",
      true
    );
  }
}

function renderSection(posts, container, emptyMessage) {
  const MAX_LEN = 100;
  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML = `<p class="text-gray-500 italic">${emptyMessage}</p>`;
    return;
  }

  posts.forEach((post) => {
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

  const viewAll = document.createElement("a");
  viewAll.href = "/post/allPosts.html";
  viewAll.textContent = "→ Browse listings";
  viewAll.className =
    "block mt-8 text-center text-indigo-600 font-semibold hover:underline";
  container.appendChild(viewAll);

  const ad = document.createElement("div");
  ad.className =
    "mt-8 col-span-full bg-yellow-100 rounded-lg shadow p-6 text-center";

  const adTitle = document.createElement("h3");
  adTitle.textContent = "✨ Promote Your Auction!";
  adTitle.className = "text-xl font-semibold mb-2";
  ad.appendChild(adTitle);

  const adCopy = document.createElement("p");
  adCopy.textContent =
    "Boost your visibility by upgrading to a premium listing.";
  adCopy.className = "text-gray-700 mb-4";
  ad.appendChild(adCopy);

  const adButton = document.createElement("a");
  adButton.href = "/premium";
  adButton.textContent = "Learn More";
  adButton.className =
    "inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition";
  ad.appendChild(adButton);

  container.appendChild(ad);
}

const stored = localStorage.getItem("user");
const user = stored ? JSON.parse(stored) : null;

const filter = {
  _active: true,
  limit: 100,
  ...(user && user.name
    ? { seller: user.name, _seller: true, _bids: true }
    : { _seller: true, _bids: true }),
};

displayPosts(() => fetchPosts(filter));
