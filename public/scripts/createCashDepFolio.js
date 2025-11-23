(function () {
    console.log("createCashDepFolioView.js loaded");

    let done = false;
    const CHECK_INTERVAL = 300; // ms
    const TIMEOUT = 15000;      // 15 seconds max wait
    const startTime = Date.now();

    // --- Helpers ---
    function waitForElement(selector) {
        return document.querySelector(selector) || null;
    }

    function fillInput(inputEl, value) {
        if (!inputEl) return false;
        inputEl.value = value;
        inputEl.dispatchEvent(new Event("input", { bubbles: true }));
        inputEl.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
    }

    function checkCheckbox(checkboxEl) {
        if (!checkboxEl) return false;
        if (!checkboxEl.checked) {
            checkboxEl.checked = true;
            checkboxEl.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return true;
    }

    function clickButton(buttonEl) {
        if (!buttonEl) return false;
        chrome.runtime.sendMessage({type:"CASH_DEP_FOLIO_CREATED"})
        buttonEl.click();
        console.log("✔ Save Changes button clicked:", buttonEl);
        return true;
    }

    // --- Main polling loop ---
    const interval = setInterval(() => {
        if (done) return;

        // 1️⃣ Wait for folio view name input
        const nameInput = waitForElement('input[name="folioViewConfiguration.viewName"]');

        if (!nameInput) {
            if (Date.now() - startTime > TIMEOUT) {
                console.warn("⏳ Timeout — folio view name input not found");
                clearInterval(interval);
            }
            return;
        }

        // 2️⃣ Fill in 'CASH DEP'
        fillInput(nameInput, "CASH DEP");

        // 3️⃣ Check the MS transaction code checkbox
        const msCheckbox = waitForElement('input[name="folioViewConfiguration.transactionCodes"][value="MS"]');
        if (!msCheckbox) {
            console.warn("⚠ MS transaction code checkbox not found yet");
            return;
        }
        checkCheckbox(msCheckbox);

        // 4️⃣ Click Save Changes button
        const saveButton = waitForElement('a.CHI_Button#save');
        if (!saveButton) {
            console.warn("⚠ Save Changes button not found yet");
            return;
        }

        clickButton(saveButton);
        done = true;
        clearInterval(interval);

    }, CHECK_INTERVAL);

})();
