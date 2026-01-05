// back.js

// List of page identifiers and scripts to inject
const pageScripts = [
    {
        // Example: Arrivals page
        identifier: () => document.forms['ViewArrivalsListForm'] !== undefined,
        script: 'scripts/scrapeArrivals.js'
    },
    {
        identifier: () => document.querySelector("#Guest_Info_Body") !== null,
        script: 'scripts/checkCurrentGuestInWatchlist.js'
    },
    {
        identifier: () => document.title === "View Departures List",
        script: 'scripts/scrapeDepartures.js'
    },
    {
        identifier: () => document.title === "Guest Folio",
        script: 'scripts/injectDepositButtons.js'
    },
    {
        identifier: () => document.title === "Reservation Information",
        script: 'scripts/injectDepositButtons.js'
    }
];

// Wait until at least one identifier is visible
function waitForPageAndInject() {
    console.log(document.title);
    const interval = setInterval(() => {
        for (const page of pageScripts) {
            try {
                if (page.identifier()) {
                    clearInterval(interval);
                    // Ask background to inject
                    chrome.runtime.sendMessage({ action: 'inject_script', script: page.script });
                    console.log('Requested injection:', page.script);
                    // return;
                }
            } catch (err) { }
        }
    }, 100);
}

waitForPageAndInject();
