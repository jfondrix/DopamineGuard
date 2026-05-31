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

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get("blockedSites");

  if (!data.blockedSites) {
    await chrome.storage.local.set({ blockedSites: DEFAULT_SITES });
  }

  await updateBlockingRules();
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local" && changes.blockedSites) {
    await updateBlockingRules();
  }
});

async function updateBlockingRules() {
  const data = await chrome.storage.local.get("blockedSites");
  const sites = data.blockedSites || DEFAULT_SITES;

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);

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