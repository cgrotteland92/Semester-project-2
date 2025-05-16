import { renderEndsAt } from "./timeRemaining.js";

export function renderSection(posts, container, emptyMessage) {
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
    title.className = "font-semibold text-lg text-headers mb-2 truncate";
    card.appendChild(title);

    const sellerWrapper = document.createElement("p");
    sellerWrapper.className = "flex items-center text-headers text-sm mb-2";

    const avatarImg = document.createElement("img");
    avatarImg.src = post.seller?.avatar?.url;
    avatarImg.alt =
      post.seller?.avatar?.alt || post.seller?.name || "Seller avatar";
    avatarImg.className = "w-8 h-8 rounded-full mr-2";
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
    desc.className = "text-headers text-sm flex-grow truncate";
    if (fullText.length > MAX_LEN) {
      const shortText = fullText.slice(0, MAX_LEN) + "... ";
      desc.textContent = shortText;

      const moreText = document.createElement("span");
      moreText.textContent = "Read more";
      moreText.className = "text-headers underline text-sm cursor-pointer";
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
        "px-2 py-1 bg-[#DA7756] text-white rounded-full text-xs mr-2 mb-2";
      tagsDiv.appendChild(span);
    });
    card.appendChild(tagsDiv);

    const endsAt = document.createElement("p");
    const endDate = new Date(post.endsAt);
    endsAt.textContent = renderEndsAt(endDate);
    endsAt.title = ` Ends at ${new Date(post.endsAt).toLocaleString()}`;
    endsAt.className = "text-headers text-xs mt-2";
    card.appendChild(endsAt);

    link.appendChild(card);
    container.appendChild(link);
  });
}
