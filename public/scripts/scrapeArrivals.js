(function () {
    function splitName(raw) {
        const [last, first] = raw.split(",").map(s => s.trim());
        return { first_name: first, last_name: last };
    }


    function scrapeArrivals() {
        try {
            const tbody = document.querySelector("#arrivalsList");
            
            const rows = tbody.querySelectorAll("tr");
            console.log(`[Arrivals] Found ${rows.length} rows, scraping...`);

            const names = [];

            rows.forEach((row, i) => {
                const link = row.querySelector("a[id^='guestName']");
                const rate_plan = row.querySelector("p[id^='ratePlan']").textContent.trim()
                if (!link) return;


                const rawName = link.textContent.trim();
                const parsed = splitName(rawName);

                names.push({
                    index: i,
                    raw_name: link.textContent.trim(),
                    last_name: parsed.last_name,
                    first_name: parsed.first_name,
                    rate_plan,
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
