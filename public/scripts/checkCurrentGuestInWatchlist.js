(function () {
    // Normalize names (trim + uppercase)
    function normalize(str) {
        return (str || "").trim().toUpperCase();
    }

    function generateKey(last_name, first_name) {
        const key = `${normalize(last_name)}|${normalize(first_name)}`;
        return key
    }
    if (document.querySelector("#Guest_Info_Body")) {
        // console.log("Guest Info Page")
        // console.log(document.querySelectorAll("#Guest_Info_Body"))
        const firstName = document.querySelector("#guestFirstName")?.value
        const lastName = document.querySelector("#guestLastName")?.value

        chrome.storage.local.get("watchlistIndex").then(
            (res) => {
                if (!res?.watchlistIndex) return;
                const currentGuestKey = generateKey(lastName, firstName);
                console.log(res.watchlistIndex[currentGuestKey] ?? "not FOund")
                if (res.watchlistIndex[currentGuestKey]) {
                    const watchListEntry = res.watchlistIndex[currentGuestKey];
                    console.log(`⚠ WATCH LIST MEMBER FOUND (by name): ${firstName} ${lastName} → ${watchListEntry[4]}`);
                    chrome.runtime.sendMessage({ type: "WATCH_LIST_MEMBER_FOUND", list: watchListEntry[2], level: watchListEntry[3], reason: watchListEntry[4] });
                }
            }
        )
    }
})()

