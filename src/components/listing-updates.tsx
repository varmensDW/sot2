"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, CircleAlert, Database, FileSpreadsheet, RotateCcw, Send, Store } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ProductVisual } from "./product-visual";
import { useCorrectionDemo } from "./correction-demo-provider";
import { CorrectionStatusBadge, CorrectionValues, SendCorrectionButton, ToolPreviewControls } from "./listing-correction";
import { demoTime, kindLabels, type DemoCorrection } from "@/lib/correction-demo";
import type { CustomerIssue } from "@/lib/types";

export function ListingUpdates({ issues, onOpen }: { issues: CustomerIssue[]; onOpen: (id: string) => void }) {
  const { records, reset } = useCorrectionDemo();
  const [filter, setFilter] = useState("all");
  const all = Object.values(records);
  const matches = (record: DemoCorrection) => filter === "all" || (filter === "attention" ? ["failed", "sync_error"].includes(record.status) : filter === "active" ? ["sending", "received", "in_progress"].includes(record.status) : record.status === filter);
  return <div className="listing-updates-workspace">
    <div className="correction-workflow"><span><FileSpreadsheet size={17}/>Edit SOT, if needed</span><ArrowRight size={16}/><span><Database size={17}/>Verify value</span><ArrowRight size={16}/><span><Send size={17}/>Send correction</span><ArrowRight size={16}/><span><Store size={17}/>Receive confirmation</span></div>
    <div className="correction-metrics"><div><span>Ready to send</span><strong>{all.filter(r => r.status === "ready").length}</strong></div><div><span>With listing tool</span><strong>{all.filter(r => ["received", "in_progress"].includes(r.status)).length}</strong></div><div><span>Needs attention</span><strong>{all.filter(r => ["failed", "sync_error"].includes(r.status)).length}</strong></div><div><span>Published</span><strong>{all.filter(r => r.status === "published").length}</strong></div></div>
    <div className="correction-list-toolbar"><div className="correction-filter-tabs" aria-label="Filter listing corrections">{[["all", "All corrections"], ["ready", "Ready to send"], ["active", "In progress"], ["attention", "Needs attention"], ["published", "Published"]].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>)}</div><Button variant="ghost" onClick={() => { reset(); setFilter("all"); }}><RotateCcw size={15}/>Reset demo</Button></div>
    <div className="correction-track-list">{all.filter(matches).map(record => <CorrectionTrackCard key={record.id} record={record} issue={issues.find(issue => issue.id === record.issueId)!} onOpen={onOpen}/>)}{!all.some(matches) && <div className="surface empty-state"><Store size={26}/><h3>No corrections in this state</h3><p>Use the sample workflow to move a correction through these stages.</p><Button variant="outline" onClick={() => setFilter("all")}>Show all corrections</Button></div>}</div>
    <p className="list-footnote"><Check size={15}/>One status per correction. The listing team confirms when all related listings are updated and published.</p>
  </div>;
}

function CorrectionTrackCard({ record, issue, onOpen }: { record: DemoCorrection; issue: CustomerIssue; onOpen: (id: string) => void }) {
  const reducedMotion = useReducedMotion();
  const { dispatch } = useCorrectionDemo();
  const [expanded, setExpanded] = useState(false);
  const panelId = `correction-${record.id}`;
  return <section className="surface correction-track-card" data-testid={panelId}>
    <header className="correction-track-header"><ProductVisual type={issue.art}/><div className="correction-track-heading"><span className="eyebrow">{record.id} · {kindLabels[record.kind]}</span><h2>{record.field}</h2><p><strong>{record.sku}</strong><span>·</span>{record.product}</p></div><CorrectionStatusBadge record={record}/><Button size="icon" variant="ghost" aria-expanded={expanded} aria-controls={panelId} aria-label={`${expanded ? "Collapse" : "Expand"} ${record.id}`} onClick={() => setExpanded(!expanded)}><ChevronDown size={18} className={expanded ? "correction-chevron open" : "correction-chevron"}/></Button></header>
    <div className="correction-track-summary"><span>{record.after ? `${record.before} → ${record.after}` : "New value needs verification"}</span><span>Last update: {demoTime(record.updatedAt)}</span></div>
    <AnimatePresence initial={false}>{expanded && <motion.div id={panelId} initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:reducedMotion?0:.25}} className="correction-track-expanded"><div className="correction-track-body">
      <div className="correction-overview"><div><h3>Correction to apply</h3><CorrectionValues record={record}/><p className="correction-reason">{record.reason}</p></div><dl className="correction-facts"><div><dt>SOT verification</dt><dd>{record.sotVerified ? record.kind === "listing" ? "Existing value verified" : "Changed value verified" : "Waiting for synced value"}</dd></div><div><dt>Sent by</dt><dd>{record.sentAt ? "Product team (demo)" : "Not sent"}</dd></div><div><dt>Sent at</dt><dd>{demoTime(record.sentAt)}</dd></div><div><dt>Tool received at</dt><dd>{record.receivedAt ? demoTime(record.receivedAt) : "Not acknowledged"}</dd></div></dl></div>
      {record.error && <div className="correction-error" role="alert"><CircleAlert size={17}/><span>{record.error}</span></div>}
      <div className={`correction-confirmation${record.status === "published" ? " complete" : ""}`}>
        {record.status === "published" ? <Check size={20}/> : <Store size={20}/>}
        <div><h3>{record.status === "published" ? "All related listings updated" : "Completion is confirmed by the listing team"}</h3>
          <p>{record.status === "published" ? `“Updated related listings” received from ${record.confirmedBy} · ${demoTime(record.publishedAt)}.` : "The team manages every related listing in the listing tool. After they update and publish all changes, their confirmation marks this correction Published."}</p>
        </div>
      </div>
      <details className="correction-history"><summary>Activity history <span>{record.history.length} events</span></summary><ol>{record.history.map((event, index) => <li key={`${event.at}-${index}`}><span>{event.label}</span><time dateTime={event.at}>{demoTime(event.at)}</time></li>)}</ol></details>
      {record.receivedAt && <ToolPreviewControls record={record}/>}
    </div></motion.div>}</AnimatePresence>
    <footer className="correction-track-footer"><span>{!record.sentAt ? "Not sent to listing tool" : record.receivedAt ? `Receipt confirmed · ${record.id}` : "Receipt not confirmed"}</span><div>
      {record.status === "failed" && <Button variant="destructive" onClick={() => dispatch({type:"retry",issueId:record.issueId,at:new Date().toISOString()})}><RotateCcw size={15}/>{record.receivedAt ? "Retry correction" : "Retry delivery"}</Button>}
      {record.status === "ready" && <SendCorrectionButton record={record}/>}
      <Button variant="outline" onClick={() => onOpen(record.issueId)}>{["waiting_sync", "sync_error"].includes(record.status) ? "Verify SOT in query" : "View customer query"}<ArrowUpRight size={15}/></Button>
    </div></footer>
  </section>;
}
