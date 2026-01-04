//initializeWatchlistIndex.js
import generateKey from "./generateKey";

export default function initializeWatchlistIndex() {
    chrome.storage.local.get("dnrList").then(
        (res) => {
            if (!res?.dnrList) return;
            const watchlistIndex = {};
            res.dnrList.forEach(element => {
                watchlistIndex[generateKey(element[1], element[0])] = element;
            });
            console.log("initializing Watchlist Index:", watchlistIndex)
            chrome.storage.local.set({ watchlistIndex });
        }
    )
}