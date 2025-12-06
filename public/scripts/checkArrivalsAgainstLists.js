/**
 * Checks arrivals against DNR + Inspectors from Chrome local storage
 * (using array-of-arrays format)
 * Returns a Promise that resolves to an array of matches
 */
export async function checkArrivalsAgainstLists(arrivals) {
  console.log("🔍 Fetching DNR list from chrome.storage.local...");

  const { dnrList } = await chrome.storage.local.get("dnrList");
  const list = dnrList || [];

  if (list.length < 1) {
    console.log("⚠ DNR list is empty or only contains headers");
    return [];
  }

  const matches = [];
  console.log("🔍 Checking arrivals against lists...");

  // Skip header row
  const dataRows = list;

  arrivals.forEach(arrival => {
    console.log(`🔍 Checking ${arrival.last_name}, ${arrival.first_name}...`);

    const matchRow = dataRows.find(
      row =>
        row[1].toUpperCase() === arrival.last_name.toUpperCase() &&
        row[0].toUpperCase() === arrival.first_name.toUpperCase()
    );

    if (matchRow) {
      const match = {
        last_name: arrival.last_name,
        first_name: arrival.first_name,
        reservationNumber: arrival.reservationNumber,
        list: matchRow[2] || "DNR/INSPECTOR",
        level:matchRow[3],
        reason:matchRow[4]
      };
      matches.push(match);      
      console.log(`⚠ Match found: ${match.last_name}, ${match.first_name} → ${match.list}`);
    }
  });

  return matches;
}
