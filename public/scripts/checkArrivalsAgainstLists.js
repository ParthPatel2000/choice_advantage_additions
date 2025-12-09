/**
 * Checks arrivals against DNR + Inspectors from Chrome local storage
 * (using array-of-arrays format)
 * Returns a Promise that resolves to an array of matches
 */
export async function checkArrivalsAgainstLists(arrivals) {
  console.log("🔍 Fetching DNR and ratePlans list from chrome.storage.local...");

  let { dnrList = [], ratePlans } = await chrome.storage.local.get(["dnrList", "ratePlans"]);

  if (dnrList.length < 1) {
    console.log("⚠ DNR list is empty");
  }

  if (!ratePlans) {
    ratePlans = [];
    await chrome.storage.local.set({ ratePlans });
  }

  const matches = [];
  console.log("🔍 Checking arrivals against lists...");

  arrivals.forEach(arrival => {
    console.log(`🔍 Checking ${arrival.last_name}, ${arrival.first_name}...`);

    let matchTypes = [];
    let match;
    if (dnrList.length > 0) {
      const DNRRow = dnrList.find(
        row =>
          row[1].toUpperCase() === arrival.last_name.toUpperCase() &&
          row[0].toUpperCase() === arrival.first_name.toUpperCase()
      );

      if (!ratePlans.includes(arrival.rate_plan)) {
        match = {
          last_name: arrival.last_name,
          first_name: arrival.first_name,
          reservationNumber: arrival.reservationNumber,
          unknown_rate_plan: arrival.rate_plan,
          level: "medium"
        };
        matchTypes.push("RATE_PLAN")
      }

      if (DNRRow) {
        match = {
          ...match,
          last_name: arrival.last_name,
          first_name: arrival.first_name,
          reservationNumber: arrival.reservationNumber,
          list: DNRRow[2] || "DNR/INSPECTOR",
          level: DNRRow[3],
          reason: DNRRow[4]
        };
        matchTypes.push("DNR/Watchlist")
      }
    }

    if (match) {
      matches.push(match);
      console.log(`⚠ Match found: ${match.last_name}, ${match.first_name} → ${matchTypes.join(", ")}`);
    }
  });

  return matches;
}
