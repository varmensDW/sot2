export type ProductArt = "pendant" | "black" | "bulb" | "driver" | "cable";
export type ActionKind = "update" | "add" | "have" | "verify" | "mapping" | "unavailable" | "review";

export interface CustomerIssue {
  id: string;
  receivedAt: string;
  sku: string | null;
  product: string;
  art: ProductArt;
  account: string;
  platform: "Amazon" | "eBay" | "Shopify";
  market: string;
  stage: "Pre-sale" | "Post-sale" | "Unknown";
  topic: string;
  summary: string;
  quote: string;
  translation?: string;
  photos: number;
  action: ActionKind;
  nextAction: string;
  sotValue: string;
  listingValue: string;
  proposedValue: string | null;
  field: string;
  evidence: string;
  instruction: string;
  verified: boolean;
  candidates?: { sku: string; label: string; value: string }[];
  listingTitle: string;
  listingUrl?: string;
  sotUrl?: string;
  demoCorrectionStatus?: "in_progress";
}

export const actionLabels: Record<ActionKind, string> = {
  update: "Update SOT", add: "Add to SOT", have: "Have SOT", verify: "Verify detail",
  mapping: "Identify variant", unavailable: "Waiting for source", review: "Needs review",
};
