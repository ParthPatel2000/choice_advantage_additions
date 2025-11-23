import { dnr } from "../data/dnr.js";
import { inspectors } from "../data/inspectors.js";

function isInList(arrival, list) {
  return list.some(
    entry =>
      entry.last_name.toUpperCase() === arrival.last_name.toUpperCase() &&
      entry.first_name.toUpperCase() === arrival.first_name.toUpperCase()
  );
}

/**
 * Checks arrivals against DNR + Inspectors
 * Returns an array of matches instead of just printing
 */
export function checkArrivalsAgainstLists(arrivals) {
  
  const matches = [];
  console.log("🔍 Checking arrivals against lists...");
  arrivals.forEach(arrival => {
    console.log(`🔍 Checking ${arrival.last_name}, ${arrival.first_name}...`)
    let reason = null;
    if (isInList(arrival, dnr)) reason = "DNR";
    else if (isInList(arrival, inspectors)) reason = "INSPECTOR";

    if (reason) {
      const match = {
        last_name: arrival.last_name,
        first_name: arrival.first_name,
        reservationNumber: arrival.reservationNumber,
        reason
      };
      matches.push(match);

      console.log(`⚠ Match found: ${match.last_name}, ${match.first_name} → ${reason}`);
    }
  });

  return matches; // ✅ now you can store or send them
}
