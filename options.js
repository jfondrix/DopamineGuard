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
  const status = document.getElementById("status");
  const saveButton = document.getElementById("save");
  const resetButton = document.getElementById("reset");
  const modeActive = document.getElementById("modeActive");
  const modePause = document.getElementById("modePause");
  const modeDisabled = document.getElementById("modeDisabled");
  const pauseMinutes = document.getElementById("pauseMinutes");
  const pauseStatus = document.getElementById("pauseStatus");

  const data = await chrome.storage.local.get(["blockedSites", "blockMessage", "enabled", "pauseResumeAt"]);

  sitesTextarea.value = (data.blockedSites || DEFAULT_SITES).join("\n");
  messageTextarea.value = data.blockMessage || DEFAULT_MESSAGE;

  const isPaused = data.enabled === false && data.pauseResumeAt && data.pauseResumeAt > Date.now();
  const isDisabled = data.enabled === false && !isPaused;
  modeActive.checked = !isPaused && !isDisabled;
  modePause.checked = isPaused;
  modeDisabled.checked = isDisabled;
  if (isPaused) {
    const remaining = Math.ceil((data.pauseResumeAt - Date.now()) / 60000);
    pauseStatus.textContent = `Blocking paused — resumes in ~${remaining} minute${remaining !== 1 ? "s" : ""}.`;
  }

  modeActive.addEventListener("change", async () => {
    await chrome.storage.local.set({ enabled: true, pauseResumeAt: null });
    pauseStatus.textContent = "";
    showStatus("Blocking active.");
  });

  modePause.addEventListener("change", async () => {
    const minutes = parseInt(pauseMinutes.value, 10) || 3;
    const resumeAt = Date.now() + minutes * 60 * 1000;
    await chrome.storage.local.set({ enabled: false, pauseResumeAt: resumeAt });
    pauseStatus.textContent = `Blocking paused for ${minutes} minute${minutes !== 1 ? "s" : ""}. Resumes automatically.`;
  });

  pauseMinutes.addEventListener("change", async () => {
    if (modePause.checked) {
      const minutes = parseInt(pauseMinutes.value, 10) || 3;
      const resumeAt = Date.now() + minutes * 60 * 1000;
      await chrome.storage.local.set({ enabled: false, pauseResumeAt: resumeAt });
      pauseStatus.textContent = `Blocking paused for ${minutes} minute${minutes !== 1 ? "s" : ""}. Resumes automatically.`;
    }
  });

  modeDisabled.addEventListener("change", async () => {
    await chrome.storage.local.set({ enabled: false, pauseResumeAt: null });
    pauseStatus.textContent = "";
    showStatus("Blocking disabled.");
  });

  saveButton.addEventListener("click", async () => {
    const sites = sitesTextarea.value
      .split("\n")
      .map(site => site.trim())
      .filter(site => site.length > 0)
      .map(cleanSite);

    const message = messageTextarea.value.trim() || DEFAULT_MESSAGE;

    await chrome.storage.local.set({ blockedSites: sites, blockMessage: message });
    showStatus("Saved.");
  });

  resetButton.addEventListener("click", async () => {
    sitesTextarea.value = DEFAULT_SITES.join("\n");
    messageTextarea.value = DEFAULT_MESSAGE;
    modeActive.checked = true;
    modePause.checked = false;
    modeDisabled.checked = false;
    pauseStatus.textContent = "";

    await chrome.storage.local.set({
      blockedSites: DEFAULT_SITES,
      blockMessage: DEFAULT_MESSAGE,
      enabled: true,
      pauseResumeAt: null
    });

    showStatus("Reset to defaults.");
  });

  function showStatus(text) {
    status.textContent = text;
    setTimeout(() => { status.textContent = ""; }, 2000);
  }
});

function cleanSite(site) {
  return site
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase();
}