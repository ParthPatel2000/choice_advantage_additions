// Normalize names (trim + uppercase)
function normalize(str) {
  return (str || "").trim().toUpperCase();
}

export default function generateKey(last_name, first_name) {
  const key = `${normalize(last_name)}|${normalize(first_name)}`;
  return key
}