// pageRouter.js


// Wait until at least one identifier is visible
function waitForPageAndInject() {
    console.log(document.title);
    chrome.storage.local.get(["uiButtonsFlag"], (res) => {

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
                identifier: () => {
                    const isPage = document.title === "Guest Folio"
                    if (res?.uiButtonsFlag) return isPage;
                    return false;
                },
                script: 'scripts/injectButtonsInFolioView.js'
            },
            {
                identifier: () => {
                    const isPage = document.title === "Reservation Information"
                    if (res?.uiButtonsFlag) return isPage;
                    return false;
                },
                script: 'scripts/injectDepositButtons.js'
            }
        ];


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
    })
}

waitForPageAndInject();
