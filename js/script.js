import { fetchPosts } from "./api.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";

const allPostsContainer = document.getElementById("listing-container");

/**
 * Fetches posts using the provided fetch function and renders them.
 * @param {Function} fetchFunction - Either fetchPosts or fetchPostsFromFollowing.
 */
async function displayPosts(fetchFunction) {
  //showSkeletonLoader();
  try {
    const postsResponse = await fetchFunction();

    if (!postsResponse) {
      throw new Error("No posts available");
    }

    renderPosts(postsResponse);
  } catch (error) {
    console.log(error);
    console.error("Error displaying posts:", error.message);
    showMessage(
      allPostsContainer,
      "Error loading posts. Please try again later."
    );
  }
}

function renderPosts(postsResponse) {
  const allPostsContainer = document.getElementById("listing-container");
  allPostsContainer.innerHTML = "";

  postsResponse.data.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className =
      "bg-white border border-black dark:border-white text-black dark:text-white p-4 rounded-lg cursor-pointer mb-4";

    // Create and append title element
    const title = document.createElement("h2");
    title.textContent = post.title;
    title.className = "text-lg font-semibold mb-2";
    postElement.appendChild(title);

    // Media element
    if (post.media && Array.isArray(post.media) && post.media.length > 0) {
      const mediaImg = document.createElement("img");
      mediaImg.src = post.media[0].url;
      mediaImg.alt = post.media[0].alt || "Post image";
      mediaImg.className = "max-w-full h-auto my-5 mx-auto";
      postElement.appendChild(mediaImg);
    }

    // Description
    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = post.description;
    descriptionEl.className = "text-sm mb-2";
    postElement.appendChild(descriptionEl);
    // Tags

    if (post.tags && post.tags.length > 0) {
      const tagsEl = document.createElement("p");
      tagsEl.textContent = "Tags: " + post.tags.join(", ");
      tagsEl.className = "text-xs text-gray-600 dark:text-gray-300 mb-2";
      postElement.appendChild(tagsEl);
    }

    // Creation date
    if (post.created) {
      const dateEl = document.createElement("p");
      dateEl.textContent =
        "Listed: " + new Date(post.created).toLocaleDateString();
      dateEl.className = "text-sm text-gray-500 dark:text-gray-400 mb-3";
      postElement.appendChild(dateEl);
    }

    // Bid count
    if (post._count && typeof post._count.bids === "number") {
      const bidCountEl = document.createElement("p");
      bidCountEl.textContent = "Bids: " + post._count.bids;
      bidCountEl.className = "text-xs text-gray-600 dark:text-gray-300";
      postElement.appendChild(bidCountEl);
    }

    allPostsContainer.appendChild(postElement);
  });
}

displayPosts(fetchPosts);
