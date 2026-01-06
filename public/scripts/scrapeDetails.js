(function () {
    console.log("[GuestInfo] Script Injected");

    function scrapeGuestInfo() {
        try {
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
