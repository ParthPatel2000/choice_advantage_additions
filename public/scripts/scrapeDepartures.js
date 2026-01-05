(function () {
    console.log("[Departures] Script Injected: waiting for departures list...");

    function splitName(raw) {
        const [last, first] = raw.split(",").map(s => s.trim());
        return { first_name: first, last_name: last };
    }

    function scrapeDepartures() {
        try {
            const tbody = document.querySelector("#departuresList");

        
            const rows = tbody.querySelectorAll("tr");
            console.log(`[Departures] Found ${rows.length} rows, scraping...`);

            const departures = [];

            rows.forEach((row, i) => {
                // Example:
                // <td id="guestNameCell_x"> <a id="guestName_0" onclick="someFunc('123456')" >
                const link = row.querySelector("td[id^='guestNameCell'] a[id^='guestName']");
                if (!link) return;

                const room = row.querySelector('p[id^="guestRoomNumber"]')?.textContent.trim() || "";
                
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
                    room,
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
