import type { CustomerIssue } from "./types";

// UI-only fixtures and transitions. This module never reads or writes a source.
export type CorrectionStatus = "waiting_sync" | "checking" | "sync_error" | "ready" | "sending" | "received" | "in_progress" | "published" | "failed";
export type SyncPreview = "updated" | "pending" | "error";
export type ToolPreview = "in_progress" | "published" | "failed";
export interface DemoCorrection {
  id: string;
  issueId: string;
  sku: string;
  product: string;
  kind: "update" | "add" | "listing";
  field: string;
  before: string;
  after: string | null;
  reason: string;
  status: CorrectionStatus;
  sotVerified: boolean;
  verifiedAt?: string;
  sentAt?: string;
  receivedAt?: string;
  publishedAt?: string;
  confirmedBy?: string;
  updatedAt: string;
  error?: string;
  syncPreview?: SyncPreview;
  sendError?: boolean;
  history: { label: string; at: string }[];
}
export type CorrectionMap = Record<string, DemoCorrection>;
export type DemoAction =
  | { type: "restore"; records: CorrectionMap }
  | { type: "reset"; records: CorrectionMap }
  | { type: "check"; issueId: string; outcome: SyncPreview; at: string }
  | { type: "sync_complete"; issueId: string; at: string }
  | { type: "send"; issueId: string; fail: boolean; at: string }
  | { type: "send_complete"; issueId: string; at: string }
  | { type: "tool"; issueId: string; outcome: ToolPreview; at: string }
  | { type: "retry"; issueId: string; at: string };

export const correctionLabels: Record<CorrectionStatus, string> = {
  waiting_sync: "Waiting for SOT sync", checking: "Checking SOT sync", sync_error: "Sync check failed",
  ready: "Ready to send", sending: "Sending correction", received: "Received by listing tool",
  in_progress: "In progress", published: "Published", failed: "Failed",
};
export const kindLabels = { update: "SOT update", add: "SOT addition", listing: "Listing only" };
const sampleTime = "2026-11-06T04:00:00.000Z";

export function createDemoCorrections(issues: CustomerIssue[]): CorrectionMap {
  return Object.fromEntries(issues.filter(issue => issue.sku && ["update", "add", "have"].includes(issue.action)).map(issue => {
    const listingOnly = issue.action === "have";
    const record: DemoCorrection = {
      id: `COR-${issue.id.slice(2)}`, issueId: issue.id, sku: issue.sku!, product: issue.product,
      kind: listingOnly ? "listing" : issue.action === "add" ? "add" : "update",
      field: issue.field, before: listingOnly ? issue.listingValue : issue.sotValue,
      after: issue.proposedValue, reason: issue.summary,
      status: listingOnly ? "ready" : "waiting_sync", sotVerified: listingOnly && issue.verified,
      verifiedAt: listingOnly ? sampleTime : undefined, updatedAt: sampleTime,
      history: [{ label: listingOnly ? "Existing SOT value verified in sample" : "Waiting for the sample SOT edit", at: sampleTime }],
    };
    if (issue.demoCorrectionStatus) {
      record.status = issue.demoCorrectionStatus;
      record.sentAt = sampleTime;
      record.receivedAt = sampleTime;
      record.history = [
        { label: "Correction sent by Product team (demo)", at: sampleTime },
        { label: "Listing tool acknowledged receipt", at: sampleTime },
        { label: "Related listings are being updated in the listing tool", at: sampleTime },
      ];
    }
    return [issue.id, record];
  }));
}

export function canSend(record: DemoCorrection) {
  return record.status === "ready" && record.sotVerified && !!record.sku && !!record.after;
}

export function correctionReducer(state: CorrectionMap, action: DemoAction): CorrectionMap {
  if (action.type === "reset" || action.type === "restore") return action.records;
  const current = state[action.issueId];
  if (!current) return state;
  let record: DemoCorrection = { ...current, updatedAt: action.at };
  let event = "";
  switch (action.type) {
    case "check":
      if (current.kind === "listing" || !["waiting_sync", "sync_error", "ready"].includes(current.status)) return state;
      record = { ...record, status: "checking", sotVerified: false, error: undefined, syncPreview: action.outcome };
      break;
    case "sync_complete":
      if (current.status !== "checking") return state;
      if (current.syncPreview === "pending") {
        record.status = "waiting_sync";
        event = "SOT sync still pending · nothing sent";
      } else if (current.syncPreview === "error") {
        record.status = "sync_error";
        record.error = "Sample source could not be reached. The correction has not been sent.";
        event = "Sample sync check failed";
      } else {
        // The cable length is a deliberately synthetic, verified example for this UI demo.
        record = { ...record, status: "ready", after: current.kind === "add" ? "150 cm" : current.after, sotVerified: true, verifiedAt: action.at };
        event = "Sample SOT sync verified · ready to send";
      }
      break;
    case "send":
      if (!canSend(current)) return state;
      record = { ...record, status: "sending", sentAt: action.at, sendError: action.fail, error: undefined };
      event = "Sending correction · waiting for receipt";
      break;
    case "send_complete":
      if (current.status !== "sending") return state;
      if (current.sendError) {
        record = { ...record, status: "failed", error: "Sample delivery failed before acknowledgement. Retry this correction using the same correction ID." };
        event = "Delivery failed · no listing-tool receipt";
      } else {
        record = { ...record, status: "received", receivedAt: action.at, error: undefined };
        event = "Listing tool acknowledged receipt (demo)";
      }
      break;
    case "tool": {
      if (!current.receivedAt || !["received", "in_progress", "failed"].includes(current.status)) return state;
      record.status = action.outcome;
      record.error = undefined;
      if (action.outcome === "in_progress") {
        event = "Related listings are being updated in the listing tool (demo)";
      } else if (action.outcome === "published") {
        record.publishedAt = action.at;
        record.confirmedBy = "Listing team (demo)";
        event = "Listing team confirmed ‘Updated related listings’ · published (demo)";
      } else {
        record.error = "The listing tool reported a problem. Completion has not been confirmed.";
        event = "Listing-tool processing failed (demo)";
      }
      break;
    }
    case "retry":
      if (current.status !== "failed") return state;
      if (!current.receivedAt) {
        record = { ...record, status: "sending", sendError: false, error: undefined };
        event = "Retrying delivery with the same correction ID";
      } else {
        record = { ...record, status: "in_progress", error: undefined };
        event = "Correction retry requested in the listing tool (demo)";
      }
      break;
  }
  if (event) record.history = [...current.history, { label: event, at: action.at }].slice(-12);
  return { ...state, [action.issueId]: record };
}

export function demoTime(value?: string) {
  return value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" }).format(new Date(value)) : "Not sent";
}
