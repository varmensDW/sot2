"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, BarChart3, CalendarDays, ChevronRight, CircleHelp, Database, ExternalLink, FileSpreadsheet, Layers2, Link2, ListFilter, MessageSquareText, PlugZap, RefreshCw, ScanSearch, ShieldCheck, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QueryList } from "./query-list";
import { CorrectionDemoProvider, useCorrectionDemo } from "./correction-demo-provider";
import { ListingUpdates } from "./listing-updates";
import { correctionLabels } from "@/lib/correction-demo";
import { IssueDetail } from "./issue-detail";
import { IssueBadge } from "./issue-badge";
import { SOT_SHEET_NAME, SOT_SHEET_URL } from "@/lib/sot";
import { cn } from "@/lib/utils";
import type { CustomerIssue } from "@/lib/types";

type View = "queries" | "review" | "updates" | "insights" | "connections";
const navigation = [
  { id:"queries", label:"Customer queries", icon:MessageSquareText },
  { id:"review", label:"Needs review", icon:ScanSearch },
  { id:"updates", label:"Listing updates", icon:RefreshCw },
  { id:"insights", label:"Insights", icon:BarChart3 },
] as const;

export function Dashboard({ issues }: { issues: CustomerIssue[] }) {
  return <CorrectionDemoProvider issues={issues}><DashboardWorkspace issues={issues}/></CorrectionDemoProvider>;
}

function DashboardWorkspace({ issues }: { issues: CustomerIssue[] }) {
  const { records }=useCorrectionDemo();
  const displayIssues=issues.map(issue=>{
    const record=records[issue.id];
    return record?{...issue,nextAction:correctionLabels[record.status]}:issue;
  });
  const reducedMotion=useReducedMotion();
  const router=useRouter();
  const params=useSearchParams();
  const rawView=params.get("view")??"queries";
  const view: View=["queries","review","updates","insights","connections"].includes(rawView)?rawView as View:"queries";
  const selected=issues.find(issue=>issue.id===params.get("issue"));
  const invalidIssue=!!params.get("issue")&&!selected;
  const [notice,setNotice]=useState("");
  const queries=displayIssues.filter(q=>q.action!=="review");
  const reviews=displayIssues.filter(q=>q.action==="review");
  const corrections=Object.values(records);
  const title=view==="connections"?"Data connections":navigation.find(item=>item.id===view)?.label??"Customer queries";
  function navigate(next: View,issueId?:string) {
    setNotice("");
    const search=new URLSearchParams();
    if(next!=="queries")search.set("view",next);
    if(issueId)search.set("issue",issueId);
    router.push(search.size?`/?${search.toString()}`:"/",{scroll:true});
  }
  const openIssue=(id:string)=>navigate(issues.find(q=>q.id===id)?.action==="review"?"review":"queries",id);

  return <MotionConfig reducedMotion="user"><TooltipProvider delayDuration={250}><div className="app-shell">
    <aside className="sidebar"><a href="/" className="brand" aria-label="QUERY home"><span className="brand-symbol"><Layers2 size={21}/></span><span>QUERY<span className="brand-period">.</span></span></a>
      <div className="nav-section-label">WORKSPACE</div><nav aria-label="Main navigation" className="main-nav">{navigation.map(item=>{const Icon=item.icon;const count=item.id==="queries"?queries.length:item.id==="review"?reviews.length:null;return <Tooltip key={item.id}><TooltipTrigger asChild><button onClick={()=>navigate(item.id)} className={cn("nav-item",view===item.id&&"active")} aria-current={view===item.id?"page":undefined} aria-label={item.label}><Icon size={18}/><span>{item.label}</span>{count!==null&&<small>{count}</small>}</button></TooltipTrigger><TooltipContent side="right" className="nav-tooltip">{item.label}</TooltipContent></Tooltip>;})}</nav>
      <div className="nav-section-label source-label">YOUR SOURCES</div><a className="nav-item sot-nav" href={SOT_SHEET_URL} target="_blank" rel="noopener noreferrer"><FileSpreadsheet size={18}/><span>SOT Google Sheet</span><ArrowUpRight size={13}/></a>
      <div className="sidebar-bottom"><div className="workspace-note"><span className="workspace-note-icon"><Sparkles size={17}/></span><h3>Better answers start here.</h3><p>Turn customer questions into clearer product information.</p></div><button className={cn("nav-item",view==="connections"&&"active")} onClick={()=>navigate("connections")} aria-label="Data connections"><PlugZap size={18}/><span>Data connections</span><span className="connection-dot"/></button><div className="team-profile"><span>PT</span><div><strong>Product team</strong><small>LEDsone workspace</small></div></div></div>
    </aside>
    <div className="workspace-main"><header className="topbar"><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={13}/><strong>{title}</strong></div><div className="topbar-right"><span className="workspace-mode"><span/>Sample workspace</span><a href={SOT_SHEET_URL} target="_blank" rel="noopener noreferrer" className="topbar-sot" aria-label="Open Components SOT Google Sheet"><FileSpreadsheet size={16}/><span>Components SOT</span><ExternalLink size={12}/></a><span className="topbar-avatar">PT</span></div></header>
      <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.map(item=><button key={item.id} aria-current={view===item.id?"page":undefined} onClick={()=>navigate(item.id)}><item.icon size={16}/>{item.id==="queries"?"Queries":item.id==="review"?"Review":item.id==="updates"?"Updates":"Insights"}</button>)}<button onClick={()=>navigate("connections")} aria-label="Data connections"><PlugZap size={16}/></button></nav>
      <main className="main-content"><div className="preview-banner"><span className="preview-indicator"/><span><strong>UI preview</strong><span className="preview-divider">·</span>Sync, sending and publishing are simulated. SOT links open your Google Sheet.</span></div><div role="status" aria-live="polite">{notice&&<div className="notice-banner"><CircleHelp size={17}/><p>{notice}</p><Button variant="ghost" size="icon" onClick={()=>setNotice("")} aria-label="Dismiss notification"><X size={15}/></Button></div>}</div>
        <AnimatePresence mode="wait" initial={false}><motion.div key={selected?.id??view} initial={{opacity:0,y:reducedMotion?0:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reducedMotion?0:-8,transition:{duration:reducedMotion?0:.14}}} transition={{duration:reducedMotion?0:.32,ease:[.16,1,.3,1]}}>
          {invalidIssue?<section className="surface empty-state"><ScanSearch size={28}/><h1>Query not found</h1><p>This query is not available in the sample workspace.</p><Button onClick={()=>navigate("queries")}>Back to queries</Button></section>:selected?<IssueDetail key={selected.id} issue={selected} onBack={()=>navigate(selected.action==="review"?"review":"queries")} onUpdates={()=>navigate("updates")} notify={setNotice}/>:<>
            <div className="page-heading"><div><span className="eyebrow">{view==="queries"?"CUSTOMER → PRODUCT KNOWLEDGE":view==="updates"?"SOT → MARKETPLACE":view==="insights"?"LEARN FROM EVERY QUESTION":view==="review"?"A LITTLE CONTEXT NEEDED":"WORKSPACE SETUP"}</span><h1>{title}</h1><p>{view==="queries"?"Every question is an opportunity to make your product information clearer.":view==="review"?"Only questions whose meaning needs clarification after checking the conversation.":view==="updates"?"Send corrections and receive confirmation when all related listings are updated.":view==="insights"?"See what customers ask, where information is missing, and what to improve.":"Connect the sources behind your product information workflow."}</p></div><div className="date-range"><CalendarDays size={15}/><span>04 – 06 Nov 2026</span></div></div>
            {view==="queries"&&<><div className="summary-grid"><Summary label="Product queries" value={queries.length} caption="Distinct customer product issues" icon={<MessageSquareText size={18}/>} tone="blue"/><Summary label="SOT improvements" value={queries.filter(q=>q.action==="update"||q.action==="add").length} caption="1 update · 1 information gap" icon={<FileSpreadsheet size={18}/>} tone="purple"/><Summary label="Listing corrections" value={corrections.length} caption={`${corrections.filter(r=>r.status==="ready").length} ready to send · ${corrections.filter(r=>r.status==="sync_error"||r.status==="failed").length} need attention`} icon={<RefreshCw size={18}/>} tone="amber"/></div><QueryList issues={displayIssues} onOpen={openIssue}/><div className="list-footnote"><ShieldCheck size={14}/><span>Focused on product questions. Staff replies, notifications, and operational messages stay out.</span><span className="sample-total">7 product issues · 1 needs review</span></div></>}
            {view==="review"&&<QueryList issues={displayIssues} review onOpen={openIssue}/>}
            {view==="updates"&&<ListingUpdates issues={issues} onOpen={openIssue}/>}
            {view==="insights"&&<Insights issues={queries} onOpen={openIssue}/>}
            {view==="connections"&&<div className="connections-grid"><Connection icon={<FileSpreadsheet/>} title="SOT Google Sheet" status="Link configured" ready><p>{SOT_SHEET_NAME}</p><p>Update product information in the linked sheet. Your existing process syncs changes to the database.</p><Button asChild><a href={SOT_SHEET_URL} target="_blank" rel="noopener noreferrer">Open Google Sheet<ExternalLink size={14}/></a></Button></Connection><Connection icon={<MessageSquareText/>} title="Customer messages" status="Sample data"><p>Product queries currently use the approved example scenarios.</p><p>Message-source and SKU mappings will be connected in the integration step.</p></Connection><Connection icon={<Database/>} title="SOT database" status="Not connected"><p>Read synced values here to verify the correct field, variant, and source version.</p><p>Opening Google Sheets does not mark a correction as verified.</p></Connection><Connection icon={<Link2/>} title="Listing tool" status="Not connected"><p>The preview simulates correction handoff and a single completion confirmation.</p><p>Publication status will update after its confirmation is received.</p></Connection></div>}
          </>}
        </motion.div></AnimatePresence>
      </main>
    </div>
  </div></TooltipProvider></MotionConfig>;
}

function Summary({label,value,caption,icon,tone}:{label:string;value:number;caption:string;icon:React.ReactNode;tone:string}) {
  return <div className="summary-card"><div className="summary-card-top"><span>{label}</span><span className={`summary-icon ${tone}`}>{icon}</span></div><div className="summary-value">{String(value).padStart(2,"0")}<span>{caption}</span></div></div>;
}

function Connection({icon,title,status,ready=false,children}:{icon:React.ReactNode;title:string;status:string;ready?:boolean;children:React.ReactNode}) {
  return <section className="surface connection-card"><div className="connection-card-head"><span>{icon}</span><span className={cn("connection-status",ready&&"ready")}>{status}</span></div><h2>{title}</h2><div className="connection-copy">{children}</div></section>;
}

function Insights({issues,onOpen}:{issues:CustomerIssue[];onOpen:(id:string)=>void}) {
  const counts=Object.entries(issues.reduce<Record<string,number>>((total,issue)=>{total[issue.topic]=(total[issue.topic]??0)+1;return total;},{})).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(...counts.map(([,count])=>count));
  return <><div className="insights-grid"><section className="surface insight-card"><div className="section-heading"><h2>What customers ask about</h2><span>{issues.length} distinct issues</span></div><div className="topic-bars">{counts.map(([topic,count])=><div key={topic}><div><span>{topic}</span><strong>{count} {count===1?"query":"queries"}</strong></div><div className="topic-bar" role="img" aria-label={`${topic}: ${count} customer issues`}><span style={{width:`${count/max*100}%`}}/></div></div>)}</div><p className="insight-caption">Follow-ups stay attached to the original issue and are not counted again.</p></section><section className="surface insight-card"><div className="section-heading"><h2>Start with these improvements</h2><ListFilter size={16}/></div>{issues.filter(q=>["update","add","have"].includes(q.action)).slice(0,3).map(issue=><button key={issue.id} className="priority-issue" onClick={()=>onOpen(issue.id)}><IssueBadge action={issue.action}/><strong>{issue.nextAction}</strong><span>{issue.sku}<ArrowUpRight size={15}/></span></button>)}</section></div><section className="surface trend-empty"><span className="summary-icon blue"><BarChart3 size={20}/></span><div><h2>Are customers asking less after a correction?</h2><p>Compare questions for the same SKU and attribute before and after confirmed publication.</p><span>Available when live publication history is connected.</span></div></section></>;
}
