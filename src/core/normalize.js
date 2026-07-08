import { emptyRow } from "./schema.js";

// Converts raw adapter output into the standard schema row.
// raw = { platform, siteLink, company, jobTitle, companyLink, jd }
export function normalize(raw, rowNumber) {
  const row = emptyRow();
  const missingFields = [];

  row["Number"] = rowNumber ?? "";
  row["Date"] = new Date().toISOString().slice(0, 10);
  row["Platform"] = raw.platform || "";
  row["Site Link"] = raw.siteLink || "";
  row["Company"] = raw.company || (missingFields.push("Company"), "");
  row["Job title"] = raw.jobTitle || (missingFields.push("Job title"), "");
  row["Company Link"] = raw.companyLink || "";
  row["JD"] = raw.jd || (missingFields.push("JD"), "");

  return { row, missingFields };
}
