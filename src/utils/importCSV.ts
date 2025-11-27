export const importCsv = async (file: File) => {
  const text = await file.text();

  const rows = text
    .split("\n")
    .map(r => r.trim())
    .filter(r => r.length);

  const parsed: string[][] = rows.map(r => r.split(","));
  return parsed;
};
