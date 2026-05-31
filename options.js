const DEFAULT_SITES = [
  "facebook.com",
  "youtube.com",
  "bridgebase.com",
  "mbl.is",
  "visir.is",
  "ruv.is",
  "cnbc.com",
  "marketwatch.com",
  "oilprice.com"
];

const DEFAULT_MESSAGE = "Get your dopamine from exercise and completing your projects, not this.";

document.addEventListener("DOMContentLoaded", async () => {
  const sitesTextarea = document.getElementById("sites");
  const messageTextarea = document.getElementById("message");
  const enabledCheckbox = document.getElementById("enabled");
  const status = document.getElementById("status");
  const saveButton = document.getElementById("save");
  const resetButton = document.getElementById("reset");

  const data = await chrome.storage.local.get(["blockedSites", "blockMessage", "enabled"]);

  sitesTextarea.value = (data.blockedSites || DEFAULT_SITES).join("\n");
  messageTextarea.value = data.blockMessage || DEFAULT_MESSAGE;
  enabledCheckbox.checked = data.enabled !== false;

  saveButton.addEventListener("click", async () => {
    const sites = sitesTextarea.value
      .split("\n")
      .map(site => site.trim())
      .filter(site => site.length > 0)
      .map(cleanSite);

    const message = messageTextarea.value.trim() || DEFAULT_MESSAGE;

    await chrome.storage.local.set({
      blockedSites: sites,
      blockMessage: message,
      enabled: enabledCheckbox.checked
    });

    showStatus("Saved.");
  });

  resetButton.addEventListener("click", async () => {
    sitesTextarea.value = DEFAULT_SITES.join("\n");
    messageTextarea.value = DEFAULT_MESSAGE;
    enabledCheckbox.checked = true;

    await chrome.storage.local.set({
      blockedSites: DEFAULT_SITES,
      blockMessage: DEFAULT_MESSAGE,
      enabled: true
    });

    showStatus("Reset to defaults.");
  });

  function showStatus(text) {
    status.textContent = text;
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  }
});

function cleanSite(site) {
  return site
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();
}