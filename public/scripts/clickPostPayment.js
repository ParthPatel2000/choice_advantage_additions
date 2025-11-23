(function () {
    console.log("selectPaymentOrChargeForCashDep.js loaded (SPA robust)");

    let actionDone = false; // prevents double triggers in SPA reloads

    function findCashDepFolio() {
        return Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink'))
            .find(a => /cash\s*dep/i.test(a.textContent.trim())) || null;
    }

    function hasParenthesesBalance(folio) {
        // If "(xx.xx)" exists → NO deposit
        return /\([\d,\.]+\)/.test(folio.textContent);
    }

    function clickPostPayment() {
        if (actionDone) return false; // safety

        const btn = document.querySelector('a[onclick*="GFpostPayment"]');
        if (btn) {
            console.log("Post Payment found. Clicking...");
            chrome.runtime.sendMessage({ type: "POST_PAYMENT_CLICKED" });
            actionDone = true;
            btn.click();
            return true;
        }
        return false;
    }

    function handleFolio() {
        if (actionDone) return; // if already handled, skip

        const folio = findCashDepFolio();
        if (!folio) return;

        const parenthesesPresent = hasParenthesesBalance(folio);

        if (!parenthesesPresent) {
            console.log("Deposit detected. Triggering Post Payment.");

            if (clickPostPayment()) return;

            // If the button is not yet rendered, keep watching
            waitForPaymentButton();
        } else {
            console.log("Parentheses present → No deposit → Doing nothing.");
        }
    }

    function waitForPaymentButton() {
        if (actionDone) return;

        const obs = new MutationObserver(() => {
            if (clickPostPayment()) {
                obs.disconnect();
            }
        });

        obs.observe(document.body, { childList: true, subtree: true });
    }

    // Persistent SPA-safe observer
    const globalObserver = new MutationObserver(() => {
        handleFolio();
    });

    globalObserver.observe(document.body, { childList: true, subtree: true });

    // Immediate pass
    handleFolio();
})();
