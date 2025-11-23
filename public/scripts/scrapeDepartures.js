(function () {
    console.log("[Departures] Script Injected: waiting for departures list...");

    // --- Wait for an element ---
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

    async function scrapeDepartures() {
        try {
            const tbody = await waitForElement("#departuresList");
            console.log("[Departures] departuresList found, waiting for rows...");

            // Wait for table rows
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
            console.log(`[Departures] Found ${rows.length} rows, scraping...`);

            const departures = [];

            rows.forEach((row, i) => {
                // Example:
                // <td id="guestNameCell_x"> <a id="guestName_0" onclick="someFunc('123456')" >
                const link = row.querySelector("td[id^='guestNameCell'] a[id^='guestName']");
                if (!link) return;

                // Extract reservation number from onclick="xxx('123456')"
                const reservationNumber =
                    link.getAttribute("onclick")?.match(/'(\d+)'/)?.[1] || null;

                const rawName = link.textContent.trim();
                const parsed = splitName(rawName);

                departures.push({
                    index: i,
                    raw_name: link.textContent.trim(),
                    last_name: parsed.last_name,
                    first_name: parsed.first_name,
                    reservationNumber
                });
            });

            console.log("[Departures] SCRAPED:", departures);

            // 🔥 SEND TO BACKGROUND
            chrome.runtime.sendMessage({
                type: "DEPARTURES_DATA",
                payload: departures
            });

        } catch (err) {
            console.error("[Departures] ERROR:", err);
        }
    }

    scrapeDepartures();
})();
