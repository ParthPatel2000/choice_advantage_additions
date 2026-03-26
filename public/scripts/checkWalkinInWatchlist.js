(function () {
    // Normalize names (trim + uppercase)
    function normalize(str) {
        return (str || "").trim().toUpperCase();
    }

    function generateKey(last_name, first_name) {
        return `${normalize(last_name)}|${normalize(first_name)}`;
    }

    // debounce so we only check after typing stops
    function debounce(fn, delay = 500) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

    function runCheck() {
        const firstName = document.querySelector("#guestFirstName")?.value;
        const lastName = document.querySelector("#guestLastName")?.value;

        if (!firstName || !lastName) return;

        chrome.storage.local.get("watchlistIndex").then((res) => {
            if (!res?.watchlistIndex) return;

            const currentGuestKey = generateKey(lastName, firstName);

            console.log(res.watchlistIndex[currentGuestKey] ?? "not found");

            if (res.watchlistIndex[currentGuestKey]) {
                const watchListEntry = res.watchlistIndex[currentGuestKey];

                console.log(
                    `⚠ WATCH LIST MEMBER FOUND (by name): ${firstName} ${lastName} → ${watchListEntry[4]}`
                );

                chrome.runtime.sendMessage({
                    type: "WATCH_LIST_MEMBER_FOUND",
                    list: watchListEntry[2],
                    level: watchListEntry[3],
                    reason: watchListEntry[4],
                });
            }
        });
    }

    const debouncedCheck = debounce(runCheck, 600);

    function initWatcher() {
        // wait for page/inputs to exist (important for walk-in flow)
        if (!document.querySelector("#guestBlock")) {
            setTimeout(initWatcher, 500);
            return;
        }

        const firstInput = document.querySelector("#guestFirstName");
        const lastInput = document.querySelector("#guestLastName");

        if (!firstInput || !lastInput) {
            setTimeout(initWatcher, 500);
            return;
        }

        console.log("👀 Walk-in watchlist checker initialized");

        // listen for typing
        firstInput.addEventListener("input", debouncedCheck);
        lastInput.addEventListener("input", debouncedCheck);
    }

    initWatcher();
})();