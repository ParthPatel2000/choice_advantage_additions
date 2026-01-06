
// List of scripts keyed by workflow flag
const WORKFLOWS = {
  createFolioWorkflow: ["scripts/workflows/createBlankCashDepFolio.js"],
  refundBotWorkflow: ["scripts/workflows/postRefund.js"],
  cashDepBotWorkflow: ["scripts/workflows/postDeposit.js"]
};

// Helper to inject scripts into a tab
async function injectScripts(tabId, files) {
  if (!files || !files.length) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files
    });
    console.log("Injected scripts:", files, "into tab", tabId);
  } catch (err) {
    console.error("Failed to inject scripts:", err);
  }
}

// Check flags and inject scripts for a tab
export async function runWorkflowsForTab(tab) {
  if (!tab?.url?.startsWith("https://www.choiceadvantage.com/choicehotels/")) return;

  const res = await chrome.storage.local.get(Object.keys(WORKFLOWS));

  for (const [flag, scripts] of Object.entries(WORKFLOWS)) {
    if (res[flag]) {
      injectScripts(tab.id, scripts);
    }
  }
}

