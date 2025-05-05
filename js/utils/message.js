/**
 * Displays a simple text message in the given container.
 * @param {HTMLElement} container
 * @param {string} message
 */
export function showMessage(container, message, isError = false) {
  container.innerHTML = "";

  const p = document.createElement("p");
  p.textContent = message;

  p.className = isError ? "text-red-500 italic" : "text-green-500 italic";

  container.appendChild(p);
}
