document.addEventListener("DOMContentLoaded", function () {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.id.replace("tab-", "");

      tabButtons.forEach((btn) => {
        btn.classList.remove("border-[#DA7756]");
        btn.classList.add("border-transparent");
      });
      button.classList.remove("border-transparent");
      button.classList.add("border-[#DA7756]");

      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });
      document.getElementById(`content-${tabId}`).classList.remove("hidden");
    });
  });
});
