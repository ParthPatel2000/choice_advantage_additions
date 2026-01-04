import { checkArrivalsAgainstLists } from './scripts/checkArrivalsAgainstLists.js'
import { initializeWatchlistIndex } from './scripts/utils/initializeWatchlistIndex.js';
import generateKey from './scripts/utils/generateKey.js';
import { storage } from './storage.js';

let arrivalsCache = [];
let departuresCache = [];
let stayoversCache = [];
let guestInfoCache = {};
let matches = [];

let scriptQueue = [];
let currentTabId = null;

//Getters
(async () => {
  arrivalsCache = await storage.get("arrivalsCache") || [];
  departuresCache = await storage.get("departuresCache") || [];
  stayoversCache = await storage.get("stayoversCache") || [];
  guestInfoCache = await storage.get("guestInfoCache") || {};
  matches = await storage.get("matches") || [];
})();

// Run this on startup / install
chrome.runtime.onStartup.addListener(() => checkAndInitializeIndex());
chrome.runtime.onInstalled.addListener(() => checkAndInitializeIndex());

function checkAndInitializeIndex() {
  chrome.storage.local.get(["dnrList", "watchlistIndex"]).then((res) => {
    const { dnrList, watchlistIndex } = res;

    if (dnrList && (!watchlistIndex || Object.keys(watchlistIndex).length === 0)) {
      console.log("Initializing watchlist index because it's missing");
      initializeWatchlistIndex();
    }
  });
}

async function clearAllCaches() {
  await storage.remove("arrivalsCache");
  await storage.remove("departuresCache");
  await storage.remove("stayoversCache");
  await storage.remove("guestInfoCache");
  await storage.remove("matches");
}

const responses_list = ["FOLIO_VIEW_BUTTON_CLICKED", "POST_CHARGE_CLICKED", "POST_CHARGE_SKIPPED",
  "GUEST_REFUND_POSTED", "FILL_GUEST_INFO_DONE", "ADD_FOLIO_CLICKED", "CASH_DEP_FOLIO_CREATED",
  "POST_PAYMENT_CLICKED", "SECURITY_DEPOSIT_POSTED"];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type) console.log("Message Type:", msg.type);
  if (msg.payload) console.log("Message Payload:", msg.payload);
  if (msg.action) console.log("Message Action:", msg.action);

  // Handle msg.type
  switch (msg.type) {
    case "ARRIVALS_DATA":
      arrivalsCache = msg.payload;
      storage.set("arrivalsCache", arrivalsCache);

      checkArrivalsAgainstLists(arrivalsCache).then(result => {
        matches = result;
        console.log("Matching arrivals:", matches);
        storage.set("matches", matches);

        if (matches.length === 0) return;
        const alerts = matches
          .map((match) => {
            return {
              text: `${match.last_name}, ${match.first_name}` +
                `${match.list ? `\nis on ${match.list} list.` : ""}` +
                `${match.unknown_rate_plan ? `\n${match.unknown_rate_plan} - not allowed.` : ""} `,
              level: match.level
            }
          });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "NEW_DNR_ALERT",
            payload: {
              alerts
            }
          });
        });

      });
      break;


    case "WATCH_LIST_MEMBER_FOUND":
      console.log("WATCH LIST MEMBER FOUND:", msg.level, msg.list)
      const pre_text = `Guest is on ${msg.list} list.\n`;
      const final_text = msg.reason ? pre_text + "Reason: " + msg.reason : pre_text;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "NEW_DNR_ALERT",
          payload: {
            text: final_text,
            level: msg.level,
            list: msg.list
          }
        });
      });
      break;

    case "DEPARTURES_DATA":
      console.log("📥 RECEIVED departures data:", msg.payload);
      departuresCache = msg.payload;
      storage.set("departuresCache", departuresCache)
      break;

    case "GUEST_INFO_DATA":
      console.log("📥 Received guest info data:", msg.payload);
      guestInfoCache = { ...guestInfoCache, ...msg.payload };
      storage.set("guestInfoCache", guestInfoCache)
      runNextScript();
      break;

    case "STAYOVERS_DATA":
      console.log("📥 Received stayovers data:", msg.payload);
      stayoversCache = msg.stayovers || [];
      storage.set("stayoversCache", stayoversCache)
      console.log("💾 Stayovers saved:", stayoversCache);
      break;

    case "CASH_DEP_FOLIO_BALANCE":
      console.log("📥 Cash Deposit folio balance received:", msg.payload);
      guestInfoCache["cashDep"] = msg.payload?.balance || 0;
      storage.set("guestInfoCache", guestInfoCache)
      runNextScript();
      break;

    case "NO_CASH_DEP_FOLIO":
      console.log("📥 No cash deposit folio found.");
      scriptQueue = scriptQueue.filter(step =>
        !["scripts/clickPostCharge.js",
          "scripts/postGuestRefund.js"].includes(step.file)
      );
      break;

    default:
      if (responses_list.includes(msg.type)) {
        console.log("📥 Received response:", msg.type);
        runNextScript();
        break;
      }
      if (msg.type) console.log("Unhandeled messsage: ", msg.type);
      break;
  }

  // Handle msg.action
  switch (msg.action) {
    case "get_guest_info":
      sendResponse(guestInfoCache || null);
      return true;

    case "get_arrivals_cache":
      sendResponse(arrivalsCache || null);
      return true;

    case "get_departures_cache":
      sendResponse(departuresCache || null);
      return true;

    case "get_stayovers_cache":
      sendResponse(stayoversCache || null);
      return true;

    case "get_matches_cache":
      sendResponse(matches || null);
      return true;

    case "inject_script":
      // console.log("Script Injection Requested:", msg.script);
      if (!sender.tab?.id) return;

      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: [msg.script]
      });

      return true;


    case "stop_bots":
      scriptQueue = [];
      console.log("Stopping All bots.");
      break;

    case "start_scrape_bot":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentTabId = tabs[0].id;
        scriptQueue = [
          { file: "scripts/scrapeDetails.js", waitForMessage: "GUEST_INFO_DATA" },
          { file: "scripts/openFoliosView.js", waitForMessage: "FOLIO_VIEW_BUTTON_CLICKED", delayBeforeRun: 250 },
          { file: "scripts/selectFolioAndScrape.js", waitForMessage: ["CASH_DEP_FOLIO_BALANCE", "NO_CASH_DEP_FOLIO"], delayBeforeRun: 1000 },
          { file: "scripts/clickPostCharge.js", waitForMessage: "POST_CHARGE_CLICKED", delayBeforeRun: 1000 },
          { file: "scripts/postGuestRefund.js", waitForMessage: "GUEST_REFUND_POSTED", delayBeforeRun: 3000 },
        ];
        runNextScript();
      });
      break;

    case "start_fill_bot":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentTabId = tabs[0].id;
        const hasCashDep = !!(guestInfoCache && guestInfoCache.cashDep);

        console.log("Starting bot. Cash deposit exists?", hasCashDep);

        // --- BASE scripts that always run ---
        scriptQueue = [
          { file: "scripts/fillDetails.js", waitForMessage: "FILL_GUEST_INFO_DONE" },
          { file: "scripts/openFoliosView.js", waitForMessage: "FOLIO_VIEW_BUTTON_CLICKED", delayBeforeRun: 3000 },
          // { file: "scripts/selectFolioAndScrape.js", waitForMessage: ["CASH_DEP_FOLIO_BALANCE", "NO_CASH_DEP_FOLIO"], delayBeforeRun: 3000 },
        ];

        // --- Conditional branching ---  
        if (hasCashDep) {
          // If deposit exists, add the rest of steps
          scriptQueue.push(
            { file: "scripts/clickAddFolio.js", waitForMessage: "ADD_FOLIO_CLICKED", delayBeforeRun: 3000 },
            { file: "scripts/createCashDepFolio.js", waitForMessage: "CASH_DEP_FOLIO_CREATED", delayBeforeRun: 3000 },
            { file: "scripts/clickPostPayment.js", waitForMessage: "POST_PAYMENT_CLICKED", delayBeforeRun: 3000 },
            { file: "scripts/postSecurityDeposit.js", waitForMessage: "SECURITY_DEPOSIT_POSTED", delayBeforeRun: 3000 },
          );
        } else {
          console.warn("⚠ No cashDep in guestInfoCache — skipping deposit workflow.");
        }

        runNextScript();
      });
      break;

    case "POST_DEPOSIT_SLT_0":
      handleDepositSlot(0);
      break;

    case "POST_DEPOSIT_SLT_1":
      handleDepositSlot(1);
      break;


    case "POST_GUEST_REFUND_BUTTON":
      console.log("Starting refund workflow")

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentTabId = tabs[0].id;
        scriptQueue = [
          { file: "scripts/openFoliosView.js", waitForMessage: "FOLIO_VIEW_BUTTON_CLICKED", delayBeforeRun: 1500 },
          { file: "scripts/selectFolioAndScrape.js", waitForMessage: ["CASH_DEP_FOLIO_BALANCE", "NO_CASH_DEP_FOLIO"], delayBeforeRun: 1000 },
          { file: "scripts/clickPostCharge.js", waitForMessage: "POST_CHARGE_CLICKED", delayBeforeRun: 1000 },
          { file: "scripts/postGuestRefund.js", waitForMessage: "GUEST_REFUND_POSTED", delayBeforeRun: 1500 },
        ];
        runNextScript();
      });

      break;

    case "ADD_CASH_DEP_FOLIO":
      console.log("Starting ADD FOLIO workflow.")

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentTabId = tabs[0].id;

        console.log("Adding FOLIO");

        // If deposit exists, add the rest of steps
        scriptQueue = [
          { file: "scripts/openFoliosView.js", waitForMessage: "FOLIO_VIEW_BUTTON_CLICKED", delayBeforeRun: 1500 },
          { file: "scripts/clickAddFolio.js", waitForMessage: "ADD_FOLIO_CLICKED", delayBeforeRun: 1500 },
          { file: "scripts/createCashDepFolio.js", waitForMessage: "CASH_DEP_FOLIO_CREATED", delayBeforeRun: 1500 },
          { file: "scripts/clickPostPayment.js", waitForMessage: "POST_PAYMENT_CLICKED", delayBeforeRun: 1500 },
        ]

        runNextScript();
      });
      break;

    default:
      break;
  }
});

function handleDepositSlot(slotIndex) {
  console.log(`Starting Slot ${slotIndex + 1} deposit workflow.`);

  chrome.storage.local.get("depositButtons", (result) => {
    const depositButtons =
      Array.isArray(result.depositButtons) && result.depositButtons.every(v => typeof v === 'string')
        ? result.depositButtons
        : ["60", "100"]; // default fallback

    const cashDepValue = depositButtons[slotIndex] ?? "0";
    guestInfoCache["cashDep"] = cashDepValue;
    storage.set("guestInfoCache", guestInfoCache)

    console.log(`Using cash deposit value for Slot ${slotIndex}: `, guestInfoCache["cashDep"]);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      currentTabId = tabs[0].id;
      if (guestInfoCache.cashDep) {
        scriptQueue = [
          { file: "scripts/openFoliosView.js", waitForMessage: "FOLIO_VIEW_BUTTON_CLICKED", delayBeforeRun: 1500 },
          { file: "scripts/clickAddFolio.js", waitForMessage: "ADD_FOLIO_CLICKED", delayBeforeRun: 1500 },
          { file: "scripts/createCashDepFolio.js", waitForMessage: "CASH_DEP_FOLIO_CREATED", delayBeforeRun: 1500 },
          { file: "scripts/clickPostPayment.js", waitForMessage: "POST_PAYMENT_CLICKED", delayBeforeRun: 1500 },
          { file: "scripts/postSecurityDeposit.js", waitForMessage: "SECURITY_DEPOSIT_POSTED", delayBeforeRun: 1500 },
        ];
      } else {
        console.warn("⚠ No cashDep in guestInfoCache — skipping deposit workflow.");
      }
      runNextScript();
    });
  });
}



function runNextScript() {
  if (!scriptQueue.length) {
    console.log("No more scripts to run.");
    return;
  }

  const next = scriptQueue.shift();

  const delay = next.delayBeforeRun || 0;

  setTimeout(() => {
    chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: [next.file]
    });
    console.log("🚀 Injected:", next.file);

    // set expected message(s)
    if (next.waitForMessage) {
      console.log("⏳ Waiting for:", next.waitForMessage || null);
      return;
    }

    // no wait, continue immediately
    runNextScript();

  }, delay);
}

// Main function to compute stayovers
async function computeStayovers() {
  const data = await chrome.storage.local.get(["arrivalsCache", "departuresCache"]);
  const arrivals = Array.isArray(data.arrivalsCache) ? data.arrivalsCache : [];
  const departures = Array.isArray(data.departuresCache) ? data.departuresCache : [];

  // Build departure lookup
  const departureMap = new Map();
  departures.forEach(dep => {
    // const key = `${normalize(dep.last_name)}|${normalize(dep.first_name)}`;
    const key = generateKey(dep.last_name, dep.first_name);
    departureMap.set(key, dep.room);
  });

  console.log("Departures map:", departureMap)


  // Build stayover list
  const stayovers = [];
  arrivals.forEach(arr => {
    const key = generateKey(arr.last_name, arr.first_name);
    console.log("Arrival key:", key)
    if (departureMap.has(key)) {
      console.log("found key:", key)
      stayovers.push({
        first_name: arr.first_name,
        last_name: arr.last_name,
        room: departureMap.get(key),
      });
    }
  });

  // Save to storage
  await chrome.storage.local.set({ stayoversCache: stayovers });
  console.log("Stayovers updated:", stayovers);
}

// Listen for changes to arrivals or departures
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.arrivalsCache || changes.departuresCache) {
    computeStayovers();
  }
});

