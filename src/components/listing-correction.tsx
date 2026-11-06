"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, CircleAlert, Clock3, FileCheck2, FlaskConical, LoaderCircle, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { canSend, correctionLabels, demoTime, kindLabels, type DemoCorrection } from "@/lib/correction-demo";
import { useCorrectionDemo } from "./correction-demo-provider";

export function CorrectionStatusBadge({ record }: { record: DemoCorrection }) {
  const Icon = record.status === "published" ? Check : ["failed", "sync_error"].includes(record.status) ? CircleAlert : ["checking", "sending"].includes(record.status) ? LoaderCircle : record.status === "ready" ? FileCheck2 : Clock3;
  return <span className={`correction-status status-${record.status}`} role="status"><Icon size={14} className={["checking", "sending"].includes(record.status) ? "animate-spin" : undefined}/>{correctionLabels[record.status]}</span>;
}

export function CorrectionValues({ record }: { record: DemoCorrection }) {
  return <div className="correction-values"><div><span>{record.kind === "listing" ? "On the listing" : "SOT before edit"}</span><strong>{record.before}</strong></div><ArrowRight size={18}/><div><span>Value to send</span><strong className={record.after ? "correction-new-value" : "correction-value-pending"}>{record.after ?? "Verify length and unit"}</strong></div></div>;
}

export function SendCorrectionButton({ record }: { record: DemoCorrection }) {
  const { dispatch } = useCorrectionDemo();
  const [open, setOpen] = useState(false);
  const [fail, setFail] = useState(false);
  return <>
    <Button className="correction-send" onClick={() => setOpen(true)} disabled={!canSend(record)}><Send size={16}/>Send to listing tool</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="correction-dialog"><DialogHeader><DialogTitle>Send listing correction</DialogTitle><DialogDescription>Review the SKU and exact value. The listing team will update all related listings and send one completion confirmation.</DialogDescription></DialogHeader>
      <div className="correction-demo-note"><FlaskConical size={16}/><span>UI preview only. No correction will leave this dashboard.</span></div>
      <dl className="correction-facts"><div><dt>Correction</dt><dd>{record.id}</dd></div><div><dt>SKU / variant</dt><dd>{record.sku}</dd></div><div><dt>Product field</dt><dd>{record.field}</dd></div><div><dt>Action</dt><dd>{kindLabels[record.kind]}</dd></div></dl>
      <CorrectionValues record={record}/>
      <p className="correction-reason">{record.reason}</p>
      <div className="correction-verified"><ShieldCheck size={16}/>{record.kind === "listing" ? "Existing SOT value verified in this sample. No SOT edit required." : "Changed SOT value verified in this sample."}</div>
      <details className="demo-controls"><summary><FlaskConical size={14}/>Preview controls</summary><label className="demo-checkbox"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)}/>Simulate a delivery failure</label></details>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!canSend(record)} onClick={() => { dispatch({ type: "send", issueId: record.issueId, fail, at: new Date().toISOString() }); setOpen(false); }}><Send size={16}/>Confirm &amp; send</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}

export function ListingToolAction({ record, onUpdates }: { record: DemoCorrection; onUpdates: () => void }) {
  const { dispatch } = useCorrectionDemo();
  if (!record.sentAt) return <SendCorrectionButton record={record}/>;
  if (record.status === "sending") return <Button disabled><LoaderCircle size={16} className="animate-spin"/>Sending…</Button>;
  if (record.status === "failed" && !record.receivedAt) return <Button variant="destructive" onClick={() => dispatch({type:"retry", issueId:record.issueId, at:new Date().toISOString()})}><RotateCcw size={16}/>Retry delivery</Button>;
  return <Button variant="outline" onClick={onUpdates}>{record.status === "published" ? "View confirmation" : "View listing updates"}<ArrowUpRight size={16}/></Button>;
}

export function CorrectionStatusSummary({ record }: { record: DemoCorrection }) {
  const message = record.status === "published"
    ? `All related listings updated. Confirmed by ${record.confirmedBy} · ${demoTime(record.publishedAt)}.`
    : record.receivedAt
      ? `Received ${demoTime(record.receivedAt)}. Waiting for the listing team’s completion confirmation.`
      : record.sentAt
        ? "Waiting for listing-tool receipt. Sending does not mark the correction published."
        : record.sotVerified
          ? record.kind === "listing" ? "SOT is correct. Send the existing value directly to the listing tool." : "SOT sync verified. Review and send the correction."
          : "Verify the synced SOT value to enable sending.";
  return <div className="correction-inline-status" data-testid="correction-status-summary">
    <div><CorrectionStatusBadge record={record}/><span>{record.id}</span></div>
    {record.error ? <p className="correction-error" role="alert"><CircleAlert size={16}/>{record.error}</p> : <p>{message}</p>}
  </div>;
}

export function ToolPreviewControls({ record }: { record: DemoCorrection }) {
  const { dispatch } = useCorrectionDemo();
  return <details className="demo-controls"><summary><FlaskConical size={14}/>Preview listing-tool response</summary><p>UI simulation only. In the listing tool, the team clicks “Updated related listings” after completing and publishing all related changes. This dashboard then receives Published.</p><div className="demo-control-buttons">
    <Button variant="outline" disabled={!record.receivedAt || record.status === "published"} onClick={() => dispatch({ type: "tool", issueId: record.issueId, outcome: "in_progress", at: new Date().toISOString() })}>Preview in progress</Button>
    <Button className="demo-confirm-published" disabled={!record.receivedAt || record.status === "published"} onClick={() => dispatch({ type: "tool", issueId: record.issueId, outcome: "published", at: new Date().toISOString() })}><Check size={14}/>Preview completion received</Button>
    <Button variant="outline" disabled={!record.receivedAt || record.status === "published"} onClick={() => dispatch({ type: "tool", issueId: record.issueId, outcome: "failed", at: new Date().toISOString() })}>Preview tool failure</Button>
  </div></details>;
}
