(function () {
    console.log("[GuestInfo] Script Injected: waiting for Guest Info tab...");

    // --- Wait for any element ---
    function waitForElement(selector, timeout = 8000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(timer);
                    resolve(el);
                } else if (Date.now() - start > timeout) {
                    clearInterval(timer);
                    reject(`[GuestInfo] Timeout: ${selector} not found`);
                }
            }, 200);
        });
    }

    async function scrapeGuestInfo() {
        try {
            // 1️⃣ Wait for Guest Info tab
            const guestTab = await waitForElement("#Guest_Info");
            console.log("[GuestInfo] Guest Info tab found, clicking it...");
            guestTab.click();

            // 2️⃣ Wait for guest block
            const guestBlock = await waitForElement("#reservationGuestGuaranteeAddressBlock");
            console.log("[GuestInfo] Guest guarantee block loaded, scraping data...");

            // 3️⃣ Scrape fields
            const firstName = document.querySelector("#guestFirstName")?.value || null;
            const lastName = document.querySelector("#guestLastName")?.value || null;
            const address = document.querySelector("#guestAddressOne")?.value || null;
            const city = document.querySelector("#homeCity")?.value || null;
            const zip = document.querySelector("#guestHomeZip")?.value || null;
            const phone = document.querySelector("input[name='homePhone']")?.value || null;

            const stateSelect = document.querySelector("#homeState");
            const state = stateSelect?.value || null;

            const guestData = { firstName, lastName, address, city, zip, phone, state };
            console.log("[GuestInfo] SCRAPED GUEST DATA:", guestData);

            // 🔥 SEND DATA TO BACKGROUND
            chrome.runtime.sendMessage({
                type: "GUEST_INFO_DATA",
                payload: guestData
            });

            return guestData;

        } catch (err) {
            console.error("[GuestInfo] ERROR:", err);
        }
    }

    scrapeGuestInfo();
})();
