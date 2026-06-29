const DEFAULT_SITES = [
  "facebook.com",
  "youtube.com",
  "bridgebase.com",
  "mbl.is",
  "visir.is",
  "cnbc.com",
  "marketwatch.com",
  "ruv.is",
  "oilprice.com"
];

const DEFAULT_MESSAGE = "Get your dopamine from exercise and completing your projects, not this.";

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(["blockedSites", "blockMessage", "enabled"]);

  if (!data.blockedSites) {
    await chrome.storage.local.set({ blockedSites: DEFAULT_SITES });
  }

  if (!data.blockMessage) {
    await chrome.storage.local.set({ blockMessage: DEFAULT_MESSAGE });
  }

  if (typeof data.enabled === "undefined") {
    await chrome.storage.local.set({ enabled: true });
  }

  await updateBlockingRules();
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local") {
    await updateBlockingRules();
  }
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local" && changes.pauseResumeAt) {
    const resumeAt = changes.pauseResumeAt.newValue;
    if (resumeAt) {
      const delayInMinutes = Math.max((resumeAt - Date.now()) / 60000, 0.1);
      chrome.alarms.create("resumeBlocking", { delayInMinutes });
    }
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "resumeBlocking") {
    await chrome.storage.local.set({ enabled: true, pauseResumeAt: null });
  }
});

async function updateBlockingRules() {
  const data = await chrome.storage.local.get(["blockedSites", "enabled"]);
  const sites = data.blockedSites || DEFAULT_SITES;
  const enabled = data.enabled !== false;

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);

  if (!enabled || sites.length === 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: []
    });
    return;
  }

  const rules = sites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/blocked.html"
      }
    },
    condition: {
      regexFilter: `^https?://([^/]*\\.)?${escapeRegex(site)}(/|$).*`,
      resourceTypes: ["main_frame"]
    }
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: rules
  });
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}