(function () {
    console.log("[Arrivals] Script Injected: waiting for arrivals list...");

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
                    reject(`Timeout: ${selector} not found`);
                }
            }, 200);
        });
    }

    function splitName(raw) {
        const [last, first] = raw.split(",").map(s => s.trim());
        return { first_name: first, last_name: last };
    }


    async function scrapeArrivals() {
        try {
            const tbody = await waitForElement("#arrivalsList");
            console.log("[Arrivals] arrivalsList found, waiting for rows...");

            function waitForRows() {
                return new Promise((resolve) => {
                    const checker = setInterval(() => {
                        const rows = tbody.querySelectorAll("tr");
                        if (rows.length > 0) {
                            clearInterval(checker);
                            resolve(rows);
                        }
                    }, 200);
                });
            }

            const rows = await waitForRows();
            console.log(`[Arrivals] Found ${rows.length} rows, scraping...`);

            const names = [];

            rows.forEach((row, i) => {
                const link = row.querySelector("a[id^='guestName']");
                if (!link) return;

                
                const rawName = link.textContent.trim();
                const parsed = splitName(rawName);
                
                names.push({
                    index: i,
                    raw_name: link.textContent.trim(),
                    last_name: parsed.last_name,
                    first_name: parsed.first_name,
                    reservationNumber: link.getAttribute("name")
                });
        
            });

            console.log("[Arrivals] SCRAPED NAMES:", names);

            // 🔥 SEND DATA TO BACKGROUND.JS
            chrome.runtime.sendMessage({
                type: "ARRIVALS_DATA",
                payload: names
            });

        } catch (err) {
            console.error("[Arrivals] ERROR:", err);
        }
    }

    scrapeArrivals();
})();
