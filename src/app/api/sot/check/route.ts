import { NextResponse } from "next/server";
import { sampleIssues } from "@/lib/sample-data";

// A live DB adapter has not been configured. Never turn a UI click or a Google
// Sheets visit into a verified correction. No SOT writes or queue mutations occur.
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ status: "INVALID_REQUEST", message: "A query identifier is required." }, { status: 400 });
  }
  const id = typeof body === "object" && body !== null && "issueId" in body ? body.issueId : null;
  if (typeof id !== "string" || !sampleIssues.some(issue => issue.id === id)) {
    return NextResponse.json({ status: "UNKNOWN_ISSUE", message: "This query could not be found." }, { status: 404 });
  }
  return NextResponse.json({
    status: "SOURCE_NOT_CONNECTED",
    verified: false,
    queued: false,
    message: "The database connection is not configured yet. Your sheet opens correctly, but its sync cannot be verified here. No listing correction has been queued.",
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
