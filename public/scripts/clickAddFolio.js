(function () {
    console.log("clickAddFolio.js loaded");

    // Helper: find link by text (case-sensitive)
    function findAddFolioButton() {
        return Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink'))
            .find(a => a.textContent.trim() === "Add Folio View") || null;
    }

    function clickButton(btn) {
        if (!btn) return false;
        console.log("✔ Add Folio View button found, clicking:", btn);
        chrome.runtime.sendMessage({ type: "ADD_FOLIO_CLICKED" });
        btn.click();
        return true;
    }

    // --- SPA-safe polling ---
    let clicked = false;
    const CHECK_INTERVAL = 300; // ms
    const TIMEOUT = 10000;      // 10 seconds
    const startTime = Date.now();

    const interval = setInterval(() => {
        if (clicked) return;

        const btn = findAddFolioButton();
        if (btn) {
            clicked = true;
            clickButton(btn);
            clearInterval(interval);
            return;
        }

        if (Date.now() - startTime > TIMEOUT) {
            console.warn("⏳ Timeout — Add Folio View button not found.");
            clearInterval(interval);
        }
    }, CHECK_INTERVAL);

    // --- MutationObserver for dynamically loaded button ---
    const observer = new MutationObserver(() => {
        if (clicked) return;
        const btn = findAddFolioButton();
        if (btn) {
            clicked = true;
            clickButton(btn);
            observer.disconnect();
            clearInterval(interval);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Immediate check in case already present
    const immediate = findAddFolioButton();
    if (immediate) {
        clicked = true;
        clickButton(immediate);
        observer.disconnect();
        clearInterval(interval);
    }
})();
