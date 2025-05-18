import { fetchPosts } from "./api.js";
import { showMessage } from "./utils/message.js";
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

const allPostsContainer = document.getElementById("listing-container");

async function displayPosts(fetchFunction) {
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

    const limitedPosts = validPosts.slice(0, 9);
    gallerySection(limitedPosts, allPostsContainer, "No listings available.");
  } catch (error) {
    console.error("Error displaying posts:", error);
    showMessage(
      allPostsContainer,
      "Error loading posts. Please try again later.",
      true
    );
  }
}

function gallerySection(posts, container, emptyMessage) {
  container.innerHTML = "";
  if (posts.length === 0) {
    container.innerHTML = `<p class=\"text-gray-500 italic\">${emptyMessage}</p>`;
    return;
  }

  posts.forEach((post) => {
    const link = document.createElement("a");
    link.href = `/post/listing.html?id=${encodeURIComponent(post.id)}`;
    link.className = "block break-inside-avoid mb-4 relative group";

    const mediaItem = post.media?.[0];
    const img = document.createElement("img");
    img.src = mediaItem?.url || "";
    img.alt = mediaItem?.alt || post.title;
    img.className = "w-full object-cover rounded-lg";
    link.appendChild(img);

    const overlay = document.createElement("div");
    overlay.className = `
      absolute inset-x-0 bottom-0
      bg-black bg-opacity-50
      text-white text-sm flex items-center space-x-2
      p-2 rounded-b-lg
      opacity-0 group-hover:opacity-100
      transition-opacity duration-200
    `;

    const avatar = document.createElement("img");
    avatar.src = post.seller?.avatar?.url || "";
    avatar.alt = post.seller?.name || "";
    avatar.className =
      "w-6 h-6 rounded-full border-2 border-white flex-shrink-0";
    overlay.appendChild(avatar);

    const nameLink = document.createElement("a");
    nameLink.href = `/account/profile.html?user=${encodeURIComponent(
      post.seller?.name
    )}`;
    nameLink.textContent = post.seller?.name || "Unknown";
    nameLink.className = "hover:underline";
    nameLink.addEventListener("click", (e) => e.stopPropagation());
    overlay.appendChild(nameLink);

    link.appendChild(overlay);
    container.appendChild(link);
  });

  const ad = document.createElement("div");
  ad.className =
    "mt-8 col-span-full bg-secondary rounded-lg shadow p-6 text-center";

  const adTitle = document.createElement("h3");
  adTitle.textContent = "✨ Free Delivery!";
  adTitle.className = "text-xl font-semibold mb-2";
  ad.appendChild(adTitle);

  const adCopy = document.createElement("p");
  adCopy.textContent = "Sign up today and get free delivery on all your bids.";
  adCopy.className = "text-headers-700 mb-4";
  ad.appendChild(adCopy);

  const adButton = document.createElement("a");
  adButton.href = "/account/register.html";
  adButton.textContent = "Sign Up";
  adButton.className =
    "inline-block px-4 py-2 bg-[#DA7756] hover:bg-[#da7756ab] text-white rounded transition";
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
