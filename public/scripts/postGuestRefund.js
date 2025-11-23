(function () {
    console.log("guestRefundAuto.js loaded");

    let done = false;

    function selectGuestRefund() {
        const sel = document.querySelector('select[name="transactionCode"]');
        if (!sel) return false;

        const option = sel.querySelector('option[value="GR"]');
        if (!option) return false;

        sel.value = "GR";
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        console.log("Guest Refund selected");
        return true;
    }

    function setRefundAmount() {
        const amt = document.querySelector('input[name="amount"]');
        if (!amt) return false;

        // Use HTML default value instead of current value
        let val = amt.getAttribute("value"); // e.g., "-60.00"
        if (!val) return false;

        val = val.replace("-", ""); // remove negative sign
        amt.value = val;

        amt.dispatchEvent(new Event("keyup", { bubbles: true }));
        console.log("Amount set to:", val);
        return true;
    }

    function uncheckAutoView() {
        const box = document.querySelector('input[name="autoViewSelect"]');
        if (!box) return false;

        if (box.checked) {
            box.checked = false;
            box.dispatchEvent(new Event("click", { bubbles: true }));
            console.log("autoViewSelect unchecked");
        }
        return true;
    }

    function clickSave() {
        const btn = document.getElementById("saveButton");
        if (!btn) return false;

        console.log("Clicking Save...");
        chrome.runtime.sendMessage({ type: "GUEST_REFUND_POSTED" });
        btn.click();
        return true;
    }

    function run() {
        if (done) return;

        if (!selectGuestRefund()) return;
        if (!setRefundAmount()) return;
        if (!uncheckAutoView()) return;
        if (!clickSave()) return;

        done = true;
        console.log("Guest Refund automation complete.");
    }

    // SPA-safe: watch until all elements appear
    const obs = new MutationObserver(run);
    obs.observe(document.body, { childList: true, subtree: true });

    // immediate attempt
    run();
})();
