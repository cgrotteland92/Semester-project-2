import {
  getSingleListing,
  updateListing,
  deleteListing,
  placeBid,
} from "./api.js";
import { getLoggedInUser } from "./auth/auth.js";
import { showMessage } from "./utils/message.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";
import { renderEndsAt } from "./utils/timeRemaining.js";

function renderBidHistory(bids) {
  const historyContainer = document.getElementById("bid-history");
  if (!historyContainer) {
    console.error("renderBidHistory: #bid-history element not found");
    return;
  }

  historyContainer.innerHTML = "";

  if (!Array.isArray(bids) || bids.length === 0) {
    showMessage(
      historyContainer,
      "No bids yet. Be the first to start the auction!"
    );
    return;
  }

  const sortedBids = [...bids].sort(
    (a, b) => Number(b.amount) - Number(a.amount)
  );

  sortedBids.forEach((bid) => {
    const item = document.createElement("div");
    item.className = "flex justify-between py-2 border-b";

    const bidderLink = document.createElement("a");
    const name = bid.bidder?.name || bid.bidderEmail || "Unknown";
    bidderLink.textContent = name;
    bidderLink.href = `/account/profile.html?user=${encodeURIComponent(name)}`;
    bidderLink.className = "font-medium hover:underline";

    const amountSpan = document.createElement("span");
    amountSpan.textContent = `${Number(bid.amount)} 🪙`;
    amountSpan.className = "text-headers font-semibold";

    item.append(bidderLink, amountSpan);
    historyContainer.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const skeleton = document.getElementById("skeleton-loader");
  const container = document.getElementById("single-listing-container");
  const actionsBar = document.getElementById("listing-actions");
  const toggleBtn = document.getElementById("btnToggleEditListing");
  const deleteBtn = document.getElementById("btnDeleteListing");
  const editSection = document.getElementById("editPostContainer");
  const form = document.getElementById("formEditPost");
  const msg = document.getElementById("editMessage");

  showSkeletonLoader(skeleton, 1);

  if (!id) {
    skeleton.classList.add("hidden");
    showMessage(msg, "No listing ID provided in URL", true);
    return;
  }

  try {
    const { data } = await getSingleListing(id, { _seller: true, _bids: true });

    skeleton.classList.add("hidden");
    container.classList.remove("hidden");

    const sellerEl = document.getElementById("listing-seller");
    if (sellerEl) {
      const sellerName =
        typeof data.seller === "string"
          ? data.seller
          : data.seller.name || data.seller.email;
      sellerEl.innerHTML = "";
      const link = document.createElement("a");
      link.href = `/account/profile.html?user=${encodeURIComponent(
        sellerName
      )}`;
      link.textContent = sellerName;
      link.className = "hover:underline font-medium";
      sellerEl.appendChild(link);
    }

    if (data.media?.length) {
      const mediaEl = document.getElementById("listing-media");
      mediaEl.src = data.media[0].url;
      mediaEl.alt = data.media[0].alt || data.title;
    }
    document.getElementById("listing-title").textContent = data.title;
    document.getElementById("listing-description").textContent =
      data.description || "";
    document.getElementById("listing-created").textContent = new Date(
      data.created
    ).toLocaleString();
    const endsAtEl = document.getElementById("listing-endsAt");
    const endsAtDate = new Date(data.endsAt);
    endsAtEl.textContent = renderEndsAt(endsAtDate);
    endsAtEl.title = `Ends at ${endsAtDate.toLocaleString()}`;
    document.getElementById("listing-updated").textContent = new Date(
      data.updated
    ).toLocaleString();
    document.getElementById("listing-bids").textContent = data._count.bids;

    renderBidHistory(data.bids);

    container.classList.remove("hidden");

    const currentUser = getLoggedInUser();

    let currentUsername = null;
    if (currentUser) {
      if (typeof currentUser === "string") {
        currentUsername = currentUser;
      } else if (currentUser.name) {
        currentUsername = currentUser.name;
      } else if (currentUser.data && currentUser.data.name) {
        currentUsername = currentUser.data.name;
      } else if (currentUser.email) {
        currentUsername = currentUser.email;
      }
    }

    let sellerName = null;
    if (data.seller) {
      if (typeof data.seller === "string") {
        sellerName = data.seller;
      } else if (data.seller.name) {
        sellerName = data.seller.name;
      } else if (data.seller.email) {
        sellerName = data.seller.email;
      }
    }

    const placeBidBtn = document.getElementById("placeBidBtn");
    const bidSection = document.getElementById("bid-section");
    const bidForm = document.getElementById("bid-form");
    const bidMessage = document.getElementById("bid-message");

    if (!currentUsername) {
      placeBidBtn.style.display = "none";
      return;
    }
    if (currentUsername === sellerName) {
      placeBidBtn.style.display = "none";
    } else {
      placeBidBtn.addEventListener("click", () => {
        bidSection.classList.toggle("hidden");
      });

      bidForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        bidMessage.textContent = "";

        const amountInput = document.getElementById("bid-amount");
        const submitBtn = bidForm.querySelector("button[type=submit]");
        const amount = parseFloat(amountInput.value);

        placeBidBtn.disabled = true;
        amountInput.disabled = true;
        submitBtn.disabled = true;

        try {
          const updated = await placeBid(id, amount);

          renderBidHistory(updated.bids);
          document.getElementById("listing-bids").textContent =
            updated._count.bids;

          bidMessage.textContent = "🎉 Bid placed!";
          bidMessage.className = "mt-2 text-green-600";

          setTimeout(() => {
            bidSection.classList.add("hidden");
            bidMessage.textContent = "";
          }, 2000);

          document.getElementById("bid-history").scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          bidForm.reset();
        } catch (err) {
          bidMessage.textContent = `Something went wrong: ${err.message}`;
          bidMessage.className = "mt-2 text-red-500";
        } finally {
          placeBidBtn.disabled = false;
          amountInput.disabled = false;
          submitBtn.disabled = false;
        }
      });
    }

    if (currentUsername && sellerName && currentUsername === sellerName) {
      actionsBar.classList.remove("hidden");
      actionsBar.classList.add("flex");

      toggleBtn.style.display = "inline-block";
      deleteBtn.style.display = "inline-block";

      toggleBtn.addEventListener("click", () => {
        if (editSection.classList.contains("hidden")) {
          editSection.classList.remove("hidden");
          editSection.classList.add("flex");
        } else {
          editSection.classList.add("hidden");
          editSection.classList.remove("flex");
        }

        document.getElementById("editPostId").value = data.id;
        document.getElementById("editTitle").value = data.title;
        document.getElementById("editDescription").value =
          data.description || "";
        document.getElementById("editTags").value = (data.tags || []).join(",");
        document.getElementById("editMediaUrl").value =
          data.media?.[0]?.url || "";
        document.getElementById("editMediaAlt").value =
          data.media?.[0]?.alt || "";
        document.getElementById("editEndsAt").value = data.endsAt.slice(0, 16);
      });

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.classList.add("hidden");

        const payload = {};
        const newTitle = document.getElementById("editTitle").value.trim();
        if (newTitle && newTitle !== data.title) payload.title = newTitle;

        const newDesc = document.getElementById("editDescription").value.trim();
        if (newDesc !== (data.description || "")) payload.description = newDesc;

        const newTags = document
          .getElementById("editTags")
          .value.split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        if (JSON.stringify(newTags) !== JSON.stringify(data.tags))
          payload.tags = newTags;

        const newEndsRaw = document.getElementById("editEndsAt").value;
        if (newEndsRaw) {
          const iso = new Date(newEndsRaw).toISOString();
          if (iso !== data.endsAt) payload.endsAt = iso;
        }

        const newUrl = document.getElementById("editMediaUrl").value.trim();
        if (newUrl) {
          payload.media = [
            {
              url: newUrl,
              alt: document.getElementById("editMediaAlt").value.trim(),
            },
          ];
        }

        if (!Object.keys(payload).length) {
          showMessage(msg, "No changes detected.", true);
          return;
        }

        try {
          const result = await updateListing(data.id, payload);
          msg.textContent = "Listing updated!";
          msg.className = "mb-4 text-green-600";
          msg.classList.remove("hidden");
          setTimeout(() => window.location.reload(), 800);
        } catch (err) {
          console.error("Update error:", err);
          msg.textContent = "Update failed: " + err.message;
          msg.className = "mb-4 text-red-500";
          msg.classList.remove("hidden");
        }
      });

      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        try {
          await deleteListing(data.id);
          showMessage(msg, "Listing deleted!");
          window.location.href = "/account/profile.html";
        } catch (err) {
          showMessage(msg, "Delete failed: " + err.message, true);
        }
      });
    } else {
      showMessage(msg, "❌ User is not the seller of this listing", true);
    }
  } catch (err) {
    console.error("Error fetching listing:", err);
    container.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    container.classList.remove("hidden");
  }
});
