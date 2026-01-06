// clickPostCharge.js
(function () {
    console.log("selectPaymentOrChargeForCashDep_charge.js loaded (SPA robust)");

    let actionDone = false; // prevents double triggers in SPA reloads

    function findCashDepFolio() {
        return Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink'))
            .find(a => /cash\s*dep/i.test(a.textContent.trim())) || null;
    }

    function hasParenthesesBalance(folio) {
        // If "(xx.xx)" exists → there is a balance → trigger charge
        return /\([\d,\.]+\)/.test(folio.textContent);
    }

    function clickPostCharge() {
        if (actionDone) return false; // safety

        const btn = Array.from(document.querySelectorAll('a'))
            .find(a => a.textContent.trim() === "Post Charge");

        if (btn) {
            console.log("Post Charge button found. Clicking...");
            actionDone = true;
            chrome.runtime.sendMessage({type: "POST_CHARGE_CLICKED"});
            btn.click();
            return true;
        }
        return false;
    }

    function handleFolio() {
        if (actionDone) return;

        const folio = findCashDepFolio();
        if (!folio) return;

        const parenthesesPresent = hasParenthesesBalance(folio);

        if (parenthesesPresent) {
            console.log("Balance parentheses detected. Triggering Post Charge.");

            if (clickPostCharge()) return;

            waitForChargeButton();
        } else {
            console.log("No parentheses → deposit exists → Doing nothing.");
            chrome.runtime.sendMessage({type: "POST_CHARGE_SKIPPED"});
        }
    }

    function waitForChargeButton() {
        if (actionDone) return;

        const obs = new MutationObserver(() => {
            if (clickPostCharge()) obs.disconnect();
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
