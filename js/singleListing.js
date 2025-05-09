import { getSingleListing, updateListing, deleteListing } from "./api.js";
import { getLoggedInUser } from "./auth/auth.js";
import { showMessage } from "./utils/message.js";
import { showSkeletonLoader } from "./utils/skeletonLoader.js";

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
    const { data } = await getSingleListing(id);
    console.log("Listing data:", data);
    skeleton.classList.add("hidden");
    container.classList.remove("hidden");
    if (data.media?.length) {
      const mediaEl = document.getElementById("listing-media");
      mediaEl.src = data.media[0].url;
      mediaEl.alt = data.media[0].alt || data.title;
    }
    document.getElementById("listing-title").textContent = data.title;
    document.getElementById("listing-description").textContent =
      data.description || "";
    const tagsDiv = document.getElementById("listing-tags");
    tagsDiv.innerHTML = "";
    (data.tags || []).forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      span.className =
        "px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs";
      tagsDiv.appendChild(span);
    });
    document.getElementById("listing-created").textContent = new Date(
      data.created
    ).toLocaleString();
    document.getElementById("listing-endsAt").textContent = new Date(
      data.endsAt
    ).toLocaleString();
    document.getElementById("listing-updated").textContent = new Date(
      data.updated
    ).toLocaleString();
    document.getElementById("listing-bids").textContent = data._count.bids;

    container.classList.remove("hidden");

    const currentUser = getLoggedInUser();
    console.log("Current user object:", currentUser);
    console.log("Seller info:", data.seller);

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

    console.log(
      `Comparing: Current user "${currentUsername}" with seller "${sellerName}"`
    );

    if (currentUsername && sellerName && currentUsername === sellerName) {
      console.log("✅ User is the seller - showing edit controls");

      actionsBar.classList.remove("hidden");
      actionsBar.classList.add("flex");

      toggleBtn.style.display = "inline-block";
      deleteBtn.style.display = "inline-block";

      toggleBtn.addEventListener("click", () => {
        console.log("Toggle button clicked");
        if (editSection.classList.contains("hidden")) {
          editSection.classList.remove("hidden");
          editSection.classList.add("flex");
          console.log("Edit section shown");
        } else {
          editSection.classList.add("hidden");
          editSection.classList.remove("flex");
          console.log("Edit section hidden");
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
        console.log("Form submitted");

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

        console.log("Update payload:", payload);

        if (!Object.keys(payload).length) {
          showMessage(msg, "No changes detected.", true);
          return;
        }

        try {
          const result = await updateListing(data.id, payload);
          console.log("Update result:", result);
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
      console.log("❌ User is not the seller of this listing");
    }
  } catch (err) {
    console.error("Error fetching listing:", err);
    container.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
    container.classList.remove("hidden");
  }
});
