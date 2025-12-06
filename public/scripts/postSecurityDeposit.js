
(function () {
    console.log("autoSecurityDeposit.js loaded (SPA-safe)");

    // ========= HELPERS =========

    // Waits for a selector every animation frame — SPA-safe
    function waitForFresh(selector, timeout = 8000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();

            function check() {
                const el = document.querySelector(selector);

                // Must be a LIVE element currently in DOM
                if (el && document.contains(el)) {
                    return resolve(() => document.querySelector(selector)); 
                    // Returning a *function* that fetches the freshest element
                }

                if (Date.now() - start > timeout) {
                    return reject("Timeout waiting for: " + selector);
                }

                requestAnimationFrame(check);
            }

            check();
        });
    }

    function setInputValue(el, value) {
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "0" }));
    }

    // Re-fetch element before every interaction
    function fresh(selector) {
        return document.querySelector(selector);
    }

    // ========= MAIN WORKFLOW =========

    async function run() {
        console.log("SPA-safe: waiting for transactionCode select...");

        // 1️⃣ Wait for select (gets a getter function)
        const getSelect = await waitForFresh('select[name="transactionCode"]');

        console.log("Select found. Setting Security Deposit...");

        // 2️⃣ Select freshest DOM version
        const select = getSelect();
        select.value = "SD";
        select.dispatchEvent(new Event("change", { bubbles: true }));

        // 3️⃣ Get guest info from background
        console.log("Requesting cashDep from background...");

        const guestInfo = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: "get_guest_info" }, (response) => {
                resolve(response);
            });
        });

        if (!guestInfo || guestInfo.cashDep == null) {
            console.warn("No guest info/cashDep, aborting.");
            return;
        }

        const amount = guestInfo.cashDep; // RAW USD VALUE

        console.log("cashDep received:", amount);

        // 4️⃣ Wait for amount input — SPA SAFE
        const getAmountInput = await waitForFresh('input[name="amount"]');

        // 5️⃣ Set the raw amount
        console.log("Setting amount:", amount);
        setInputValue(getAmountInput(), amount);

        // 6️⃣ Wait for Save button — SPA SAFE
        const getSaveBtn = await waitForFresh('#saveButton');

        console.log("Clicking Save...");
        chrome.runtime.sendMessage({ type: "SECURITY_DEPOSIT_POSTED" });
        // getSaveBtn().click();

        console.log("✔ SPA-safe Security Deposit automation complete");
    }

    run().catch(err => console.error("Error in SPA automation:", err));

})();
