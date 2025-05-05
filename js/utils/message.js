/**
 * Displays a simple text message in the given container.
 * @param {HTMLElement} container
 * @param {string} message
 */
export function showMessage(container, message) {
  container.innerHTML = ""; // clear any existing content
  const p = document.createElement("p");
  p.textContent = message;
  p.className = "text-red-500 italic"; // or whatever styling you like
  container.appendChild(p);
}
