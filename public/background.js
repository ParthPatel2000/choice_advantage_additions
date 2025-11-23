import {checkArrivalsAgainstLists} from './scripts/checkArrivalsAgainstLists.js'

// defaults
let arrivalsCache = [];
let departuresCache = [];
let stayoversCache = [];
let guestInfoCache = {};
let cashDepFolioBalance = 0;
let scriptQueue = [];
let matches = [];
let currentTabId = null;

const responses_list = ["FOLIO_VIEW_BUTTON_CLICKED", "POST_CHARGE_CLICKED", "POST_CHARGE_SKIPPED", 
                        "GUEST_REFUND_POSTED", "FILL_GUEST_INFO_DONE", "ADD_FOLIO_CLICKED", "CASH_DEP_FOLIO_CREATED",
                        "POST_PAYMENT_CLICKED", "SECURITY_DEPOSIT_POSTED"];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.type) console.log("Message Type:", msg.type);
  if(msg.payload) console.log("Message Payload:", msg.payload);
  if(msg.action) console.log("Message Action:", msg.action);

  // Handle msg.type
  switch (msg.type) {  
    case "ARRIVALS_DATA":
      console.log("📥 RECEIVED arrivals data in background:", msg.payload);
    
      arrivalsCache = msg.payload;
    
      matches = checkArrivalsAgainstLists(arrivalsCache);
      console.log("Matching arrivals:", matches);
    
      // send notifications for each match
      matches.forEach(match => {
        chrome.notifications.create({
          type: "basic",
          iconUrl: chrome.runtime.getURL("icons/notification32.png"), // <-- your PNG
          title: `Match: ${match.reason || "NA"}`,
          message: `${match.first_name} ${match.last_name}`
        });
      });    
      break;

    case "WATCH_LIST_MEMBER_FOUND":
      console.log("WATCH LIST MEMBER FOUND:")
      break;

    case "DEPARTURES_DATA":
      console.log("📥 RECEIVED departures data:", msg.payload);
      departuresCache = msg.payload;
      break;

    case "GUEST_INFO_DATA":
      console.log("📥 Received guest info data:", msg.payload);
      guestInfoCache = { ...guestInfoCache, ...msg.payload };
      runNextScript();
      break;

    case "STAYOVERS_DATA":
      console.log("📥 Received stayovers data:", msg.payload);
      stayoversCache = msg.stayovers || [];
      console.log("💾 Stayovers saved:", stayoversCache);
      break;

    case "CASH_DEP_FOLIO_BALANCE":
      console.log("📥 Cash Deposit folio balance received:", msg.payload);
      cashDepFolioBalance = msg.payload;
      guestInfoCache["cashDep"] = cashDepFolioBalance ? cashDepFolioBalance.balance : 0;
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
      if(msg.type) console.log("Unhandeled messsage: ", msg.type);
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

    case "POST_DEPOSIT_USING_CUSTOM_FOLIO_BUTTON":
      console.log("Starting deposit workflow.")
      
      guestInfoCache["cashDep"] = 60;
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentTabId = tabs[0].id;
        const hasCashDep = !!(guestInfoCache && guestInfoCache.cashDep);

        console.log("Adding Deposit");
        // --- Conditional RUN ---  
        if (hasCashDep) {
          // If deposit exists, add the rest of steps
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
      break;
      
    case "POST_GUEST_REFUND_BUTTON":
      console.log("Starting refund workflow")

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        currentTabId = tabs[0].id;
        scriptQueue = [
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
      console.log("⏳ Waiting for:",next.waitForMessage || null);
      return;
    }

    // no wait, continue immediately
    runNextScript();

  }, delay);
}

