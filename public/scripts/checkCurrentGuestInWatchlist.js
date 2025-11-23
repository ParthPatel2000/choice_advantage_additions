// content script for FindReservationWithAccountNumber.do

// 1️⃣ Get the account number from the URL
const urlParams = new URLSearchParams(window.location.search);
const accountNumber = urlParams.get("accountNumber");

if (!accountNumber) {
  console.warn("No accountNumber found in URL.");
} else {
  // 2️⃣ Ask background for matches cache
  chrome.runtime.sendMessage({ action: "get_matches_cache" }, (matches) => {
    if (!matches || !matches.length) {
      console.log("No matches cached in background.");
      return;
    }

    // 3️⃣ Find if this account number is in the matches
    const match = matches.find(m => m.reservationNumber === accountNumber);
    if (match) {
      console.log(`⚠ WATCH LIST MEMBER FOUND: ${match.first_name} ${match.last_name} → ${match.reason}`);

      // 4️⃣ Notify background of the watchlist match
      chrome.runtime.sendMessage({ type: "WATCH_LIST_MEMBER_FOUND", match });
    } else {
      console.log(`Account ${accountNumber} is not on the watch list.`);
    }
  });
}
