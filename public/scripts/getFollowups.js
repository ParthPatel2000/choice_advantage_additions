(function () {
    console.log("getFollowups.js loaded");

    // --- Logging helper ---
    const log = (...args) => console.log("[StayoverMatcher]", ...args);

    // --- Helper: normalize name (trim + uppercase for case-insensitive matching) ---
    function normalize(str) {
        return (str || "").trim().toUpperCase();
    }

    // --- Start matching process ---
    function runStayoverMatch() {

        chrome.runtime.sendMessage({ action: "get_arrivals_cache" }, (arrivals) => {
            if (!Array.isArray(arrivals)) arrivals = [];
            log(`📥 Arrivals:`, arrivals);

            chrome.runtime.sendMessage({ action: "get_departures_cache" }, (departures) => {
                if (!Array.isArray(departures)) departures = [];
                log(`📥 Departures:`, departures);

                // Convert departures into a quick lookup map
                const departureMap = new Map();
                departures.forEach(dep => {
                    const key = normalize(dep.last_name) + "|" + normalize(dep.first_name);
                    departureMap.set(key, true);
                });

                const stayovers = [];

                arrivals.forEach(arr => {
                    const key = normalize(arr.last_name) + "|" + normalize(arr.first_name);

                    if (departureMap.has(key)) {
                        stayovers.push({
                            first_name: arr.first_name,
                            last_name: arr.last_name
                        });
                    }
                });

                log("🏨 Stayovers found:", stayovers);

                // --- Send back to background to save ---
                chrome.runtime.sendMessage({
                    type: "STAYOVERS_DATA",
                    stayovers
                });

            });
        });
    }

    // Run immediately
    runStayoverMatch();
})();
