(function () {
    console.log("[FillGuestInfo SPA] Script Injected: checking guest info...");

    let done = false;
    let debounceTimer = null;

    function setInputValue(el, value) {
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function fillAndSave(guestData) {
        if (done) return;
        if (!guestData) return;

        const firstNameInput = document.querySelector("#guestFirstName");
        const lastNameInput = document.querySelector("#guestLastName");

        const currentFirst = firstNameInput?.value?.trim();
        const currentLast = lastNameInput?.value?.trim();

        if (!currentFirst || !currentLast) return;

        const matchesName =
            guestData.firstName?.trim().toLowerCase() === currentFirst.toLowerCase() &&
            guestData.lastName?.trim().toLowerCase() === currentLast.toLowerCase();

        if (!matchesName) {
            console.log("[FillGuestInfo SPA] First/Last name mismatch — skipping.");
            return;
        }

        console.log("[FillGuestInfo SPA] Name matches — filling guest info...");

        // Fill fields
        setInputValue(document.querySelector("#guestAddressOne"), guestData.address);
        setInputValue(document.querySelector("#homeCity"), guestData.city);
        setInputValue(document.querySelector("#guestHomeZip"), guestData.zip);
        setInputValue(document.querySelector("input[name='homePhone']"), guestData.phone);

        const stateSelect = document.querySelector("#homeState");
        if (stateSelect && guestData.state) {
            stateSelect.value = guestData.state;
            stateSelect.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("[FillGuestInfo SPA] State set:", guestData.state);
        }

        const saveBtn = document.querySelector("#saveChangesEnabled");

        if (!saveBtn) {
            console.warn("[FillGuestInfo SPA] Save button not found yet — waiting...");
            return;
        }

        console.log("[FillGuestInfo SPA] Clicking Save Changes...");

        // 🔥 PREVENT ANY FURTHER EXECUTION **IMMEDIATELY**
        done = true;
        observer.disconnect();

        // Send completion message exactly once
        chrome.runtime.sendMessage({ type: "FILL_GUEST_INFO_DONE" });
        if (guestData.cashDep) { chrome.runtime.sendMessage({ action: "POST_DEPOSIT" }); }

        // Click the button
        saveBtn.click();
    }

    function tryFillGuestInfo() {
        if (done) return;

        const guestTab = document.querySelector("#Guest_Info");
        const guestBlock = document.querySelector("#reservationGuestGuaranteeAddressBlock");

        if (!guestTab || !guestBlock) return;

        guestTab.click();

        chrome.runtime.sendMessage({ action: "get_guest_info" }, fillAndSave);
    }

    // --- Debounced MutationObserver (prevents spam) ---
    const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            tryFillGuestInfo();
        }, 120);
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

    // First run
    tryFillGuestInfo();
})();
