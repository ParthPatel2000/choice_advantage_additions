(function () {
    console.log("selectFolioAndScrape.js loaded");

    let clicked = false;
    let lastCheckTime = 0;

    // --- CONFIG ---
    const TEXT_REGEX = /cash dep/i;
    const CHECK_INTERVAL = 300; // ms
    const TIMEOUT = 3000;      // 3 seconds max search time

    function findCashDepFolio() {
        return Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink'))
            .find(a => TEXT_REGEX.test(a.textContent.trim())) || null;
    }

    function getFolioBalance(folio) {
        if (!folio) return null;
        const match = folio.textContent.match(/\(([\d,.]+)\)/);
        if (match) return parseFloat(match[1].replace(/,/g, ""));
        return 0;
    }

    function sendBalanceToBackground(folio, balance) {
        chrome.runtime.sendMessage({
            type: "CASH_DEP_FOLIO_BALANCE",
            payload: {
                balance: balance
            }
        }, () => {
            console.log("💌 Sent folio balance to background:", balance);
        });
    }

    function clickFolio(folio) {
        if (!folio || clicked) return;
        clicked = true;

        const balance = getFolioBalance(folio);
        console.log("✔ Cash Deposit folio found:", folio.textContent.trim());
        console.log("💰 Folio balance:", balance);

        // --- Send balance first ---
        sendBalanceToBackground(folio, balance);

        // --- Then click ---
        folio.click();
    }

    // --- CONTINUOUS POLLING SAFEGUARD ---
    const startTime = Date.now();
    const interval = setInterval(() => {
        const now = Date.now();

        // ---- FIXED TIMEOUT CHECK (runs even on early return) ----
        if (!clicked && now - startTime > TIMEOUT) {
            console.log("⏳ Timeout — could not find Cash Deposit folio.");
            chrome.runtime.sendMessage({ type: "NO_CASH_DEP_FOLIO" });
            clearInterval(interval);
            observer.disconnect();
            return;
        }

        // Throttle DOM scans
        if (now - lastCheckTime < CHECK_INTERVAL) {
            return;
        }
        lastCheckTime = now;

        const folio = findCashDepFolio();
        if (folio) {
            clickFolio(folio);
            clearInterval(interval);
            observer.disconnect();
        }
    }, CHECK_INTERVAL);

    // --- MUTATION OBSERVER FOR SPA DYNAMIC CHANGES ---
    const observer = new MutationObserver(() => {
        if (clicked) return;
        const folio = findCashDepFolio();
        if (folio) {
            clickFolio(folio);
            observer.disconnect();
            clearInterval(interval);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // --- Immediate check ---
    const immediate = findCashDepFolio();
    if (immediate) {
        clickFolio(immediate);
        observer.disconnect();
        clearInterval(interval);
    }
})();
