// Supplied by the user. Preserve the selected Google Sheets tab.
export const SOT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1jS5ZrhEXdMcBtnpB6aYJvjcmZCUjNdd16WRhz0xnkYM/edit?gid=134991562#gid=134991562";
export const SOT_SHEET_NAME = "Components SOT";

export function getSotUrl(sourceUrl?: string): string {
  if (!sourceUrl) return SOT_SHEET_URL;
  try {
    const url = new URL(sourceUrl);
    if (url.protocol === "https:" && url.hostname === "docs.google.com" && /^\/spreadsheets\/d\/[a-zA-Z0-9_-]+(?:\/|$)/.test(url.pathname)) {
      return url.toString();
    }
  } catch { /* Use the configured source when a source record has an invalid URL. */ }
  return SOT_SHEET_URL;
}
