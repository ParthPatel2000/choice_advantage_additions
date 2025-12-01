export const importCsv = async (file: File) => {
  const text = await file.text();

  const rows = text
    .split("\n")
    .map(r => r.trim())
    .filter(r => r.length);

  const parsed: string[][] = rows.map(r => {
    const cols = r.split(",");
    // Pad to 5 columns
    while (cols.length < 5) cols.push("");
    // Optionally, truncate extra columns if more than 5
    return cols.slice(0, 5);
  });

  return parsed;
};
