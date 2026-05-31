const DEFAULT_MESSAGE = "Get your dopamine from exercise and completing your projects, not this.";

document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get("blockMessage");
  document.getElementById("message").textContent = data.blockMessage || DEFAULT_MESSAGE;
});