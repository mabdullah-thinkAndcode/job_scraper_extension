export const OUTPUT_COLUMNS = [
  "Number",
  "Date",
  "Platform",
  "Site Link",
  "Company",
  "Job title",
  "Company Link",
  "JD"
];

export function emptyRow() {
  const row = {};
  OUTPUT_COLUMNS.forEach(col => (row[col] = ""));
  return row;
}
