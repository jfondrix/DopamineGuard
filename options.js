document.addEventListener("DOMContentLoaded", async () => {
  const textarea = document.getElementById("sites");
  const status = document.getElementById("status");
  const saveButton = document.getElementById("save");

  const data = await chrome.storage.local.get("blockedSites");

  textarea.value = (data.blockedSites || []).join("\n");

  saveButton.addEventListener("click", async () => {
    const sites = textarea.value
      .split("\n")
      .map(site => site.trim())
      .filter(site => site.length > 0)
      .map(site => site.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]);

    await chrome.storage.local.set({ blockedSites: sites });

    status.textContent = "Saved.";
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  });
});