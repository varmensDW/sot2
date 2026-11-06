"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronDown, Copy, Database, ExternalLink, FileSpreadsheet, FlaskConical, ImageIcon, LoaderCircle, MessageSquareText, Plus, RefreshCw, ScanLine, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductVisual } from "./product-visual";
import { IssueBadge } from "./issue-badge";
import { dateParts } from "./query-list";
import { getSotUrl, SOT_SHEET_NAME } from "@/lib/sot";
import type { CustomerIssue } from "@/lib/types";
import { useCorrectionDemo } from "./correction-demo-provider";
import { CorrectionStatusSummary, ListingToolAction } from "./listing-correction";
import { demoTime, type SyncPreview } from "@/lib/correction-demo";

export function IssueDetail({ issue, onBack, onUpdates, notify }: { issue: CustomerIssue; onBack: () => void; onUpdates: () => void; notify: (message: string) => void }) {
  const [photo,setPhoto]=useState<number|null>(null);
  const [snapshot,setSnapshot]=useState(false);
  const { records,dispatch }=useCorrectionDemo();
  const correction=records[issue.id];
  const checking=correction?.status==="checking";
  const [syncPreview,setSyncPreview]=useState<SyncPreview>("updated");
  const verified=issue.verified||!!correction?.sotVerified;
  const proposedValue=correction?.after??issue.proposedValue;
  const date=dateParts(issue.receivedAt);
  const sotAction=issue.action==="update"||issue.action==="add";

  async function copySku() {
    if(!issue.sku)return;
    try { await navigator.clipboard.writeText(issue.sku); notify("SKU copied to clipboard."); }
    catch { notify("Clipboard is unavailable. You can select and copy the SKU shown above."); }
  }
  function checkSync() {
    dispatch({type:"check",issueId:issue.id,outcome:syncPreview,at:new Date().toISOString()});
  }

  return <div className="detail-page">
    <Button variant="ghost" onClick={onBack} className="back-button"><ArrowLeft size={15}/>Back to {issue.action==="review"?"needs review":"customer queries"}</Button>
    <div className="detail-heading"><ProductVisual type={issue.art} className="detail-product-art"/><div><div className="detail-id">{issue.id}<span/> {issue.stage} <span/> Sample issue</div><h1>{issue.product}</h1><div className="detail-product-meta"><code>{issue.sku??"Variant unresolved"}</code><span>·</span><span>{issue.account}</span><span>·</span><span>{issue.platform} / {issue.market}</span></div></div><IssueBadge action={issue.action}/></div>
    <div className="detail-columns"><div className="evidence-column">
      <section className="surface evidence-card"><div className="section-heading"><h2><MessageSquareText size={17}/>The customer’s question</h2><span>{date.day} · {date.time}</span></div><p className="customer-summary">{issue.summary}</p><blockquote>{issue.quote}</blockquote>{issue.translation&&<p className="translation"><span>Translation</span>{issue.translation}</p>}
        {issue.photos>0&&<div className="customer-attachments"><div className="attachments-label"><ImageIcon size={14}/>Customer images <span>{issue.photos}</span></div><div className="attachment-grid">{Array.from({length:issue.photos},(_,i)=><button className="customer-photo" key={i} onClick={()=>setPhoto(i)} aria-label={`Open sample customer image ${i+1}`}><ProductVisual type={issue.art} attachment/><span>Sample photo {i+1}<ArrowUpRight size={12}/></span></button>)}</div></div>}
        <details className="conversation-context"><summary><ChevronDown size={14}/>Conversation context</summary><p>Relevant staff replies and supporting follow-ups belong here as evidence. They do not create additional customer queries.</p><p className="subtle">This record is a synthetic example from the approved design.</p></details>
      </section>
      <section className="surface evidence-card"><div className="section-heading"><h2><ScanLine size={17}/>Compare the evidence</h2><span>Original sample snapshots</span></div><div className="comparison-grid"><div className="evidence-value"><span>Listing says</span><strong>{issue.listingValue}</strong><small>Current listing snapshot</small></div><div className="evidence-value"><span>SOT says</span><strong>{issue.sotValue}</strong><small>{issue.action==="unavailable"?"Source could not be read":"SOT at the time of analysis"}</small></div></div><div className="evidence-explanation"><ShieldCheck size={17}/><p>{issue.evidence}</p></div>
        {issue.action!=="review"&&<Button variant="link" className="snapshot-link" onClick={()=>setSnapshot(true)}><ExternalLink size={13}/>View listing snapshot</Button>}
        {issue.candidates&&<div className="variant-candidates"><p>Possible variants <span>Selection not confirmed</span></p>{issue.candidates.map(candidate=><div key={candidate.sku}><ProductVisual type={issue.art}/><span><strong>{candidate.sku}</strong><small>{candidate.label} · {candidate.value}</small></span></div>)}</div>}
      </section>
    </div><aside className="action-column">
      <section className="surface action-card"><div className="action-card-heading"><span className="action-icon"><FileSpreadsheet size={20}/></span><div><span className="eyebrow">NEXT BEST ACTION</span><h2>{issue.action==="update"?"Update product information":issue.action==="add"?"Fill the information gap":issue.action==="have"?"Make the listing clearer":"Resolve the missing evidence"}</h2></div></div><p className="action-instruction">{correction?.sotVerified&&sotAction?"The sample SOT value is verified. Send the correction to the listing team, then follow its status here.":issue.instruction}</p>
        <div className="field-location"><span>Product field</span><strong>{issue.field}</strong><small>{issue.sku??"Confirm the variant first"}</small></div>
        {proposedValue?<div className="value-change"><div><span>{issue.action==="have"?"On the listing":"Original SOT value"}</span><del>{issue.action==="have"?issue.listingValue:issue.sotValue}</del></div><ArrowRight size={17}/><div><span>Proposed value</span><strong>{proposedValue}</strong></div></div>:<div className="unverified-value"><Search size={16}/><span>Proposed value <strong>Awaiting evidence</strong></span></div>}
        {verified&&<p className="verification-caption"><BadgeCheck size={14}/>Verified evidence in this sample scenario</p>}
        {sotAction?<>
          <div className="primary-action-row">
            <Button asChild className={`sot-primary${issue.action==="add"?" sot-add":""}`} data-testid="sot-action"><a href={getSotUrl(issue.sotUrl)} target="_blank" rel="noopener noreferrer">{issue.action==="add"?<Plus size={16}/>:<FileSpreadsheet size={16}/>}<span>{issue.action==="add"?"Add to SOT":"Update SOT"}</span><ExternalLink size={14}/></a></Button>
            {correction&&<ListingToolAction record={correction} onUpdates={onUpdates}/>}
          </div>
          <p className="sot-link-caption">Edit in {SOT_SHEET_NAME}, then check the synced value before sending.</p>
          <div className="source-actions"><Button variant="outline" onClick={copySku} disabled={!issue.sku}><Copy size={13}/>Copy SKU</Button><Button variant="outline" className="sync-check" onClick={checkSync} disabled={checking||!!correction?.sentAt}>{checking?<LoaderCircle className="animate-spin" size={13}/>:<RefreshCw size={13}/>}Check database sync</Button></div>
        </>:<>
          {correction?<div className="primary-action-row"><Button variant="outline" asChild><a href={getSotUrl(issue.sotUrl)} target="_blank" rel="noopener noreferrer"><FileSpreadsheet size={15}/>Open SOT<ExternalLink size={13}/></a></Button><ListingToolAction record={correction} onUpdates={onUpdates}/></div>:<>
            <Button variant="outline" className="w-full" onClick={()=>notify(issue.action==="unavailable"?"The live SOT database connection will be configured in the next integration step.":issue.instruction)}>{issue.action==="unavailable"?<Database size={15}/>:<Search size={15}/>}View verification needed</Button>
            <Button variant="ghost" asChild className="w-full mt-2"><a href={getSotUrl(issue.sotUrl)} target="_blank" rel="noopener noreferrer"><FileSpreadsheet size={14}/>Open SOT source<ExternalLink size={13}/></a></Button>
          </>}
        </>}
        {correction&&<CorrectionStatusSummary record={correction}/>}
        {sotAction&&<details className="demo-controls"><summary><FlaskConical size={14}/>Preview sync result</summary><p>UI demo only. No database is contacted.</p><label>Sample database response<select value={syncPreview} onChange={event=>setSyncPreview(event.target.value as SyncPreview)} disabled={checking||!!correction?.sentAt}><option value="updated">Updated value found</option><option value="pending">Still waiting for sync</option><option value="error">Source connection error</option></select></label>{issue.action==="add"&&<p>The successful example uses a verified cable length of 150 cm. This is sample data only.</p>}</details>}
      </section>
    </aside></div>
    <div className="evidence-footnote"><ShieldCheck size={14}/>Customer claims, listing content, and stored SOT facts are kept separate.</div>
    {correction&&<section className="surface progress-card correction-progress"><h2>From query to correction</h2><ol>{[
      {title:"Product verified",detail:verified?"SKU and product evidence checked":"Verify the missing product information",done:verified},
      {title:issue.action==="have"?"SOT already correct":"SOT sync verified",detail:correction.sotVerified?"Value ready for the listing tool":"Check the synced value before sending",done:correction.sotVerified},
      {title:"Received by listing tool",detail:correction.receivedAt?`${correction.id} · ${demoTime(correction.receivedAt)}`:"Send correction and wait for receipt",done:!!correction.receivedAt},
      {title:"Published",detail:correction.publishedAt?`All related listings updated · ${demoTime(correction.publishedAt)}`:"Waiting for listing-team confirmation",done:correction.status==="published"},
    ].map((step,index)=><li key={step.title}><span className={step.done?"step-marker complete":"step-marker"}>{step.done?<Check size={12}/>:index+1}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div></li>)}</ol></section>}
    <Dialog open={photo!==null} onOpenChange={open=>{if(!open)setPhoto(null);}}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Customer image {(photo??0)+1}</DialogTitle><DialogDescription>Illustrative attachment for this sample query. No real customer photo is shown.</DialogDescription></DialogHeader><ProductVisual type={issue.art} attachment className="expanded-photo"/></DialogContent></Dialog>
    <Dialog open={snapshot} onOpenChange={setSnapshot}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Listing evidence</DialogTitle><DialogDescription>Current sample listing · {issue.platform} / {issue.market}</DialogDescription></DialogHeader><div className="listing-snapshot"><ProductVisual type={issue.art}/><div><h3>{issue.listingTitle}</h3><p>{issue.sku??"Multiple variants"}</p></div></div><div className="field-location"><span>{issue.field}</span><strong>{issue.listingValue}</strong></div><p className="text-sm text-muted-foreground">Historical listing at purchase: unavailable. This sample is not linked to a real marketplace listing.</p>{issue.listingUrl&&<Button asChild><a href={issue.listingUrl} target="_blank" rel="noopener noreferrer">Open listing<ExternalLink size={14}/></a></Button>}</DialogContent></Dialog>
  </div>;
}
