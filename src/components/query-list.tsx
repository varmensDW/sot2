"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronRight, ImageIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ProductVisual } from "./product-visual";
import { IssueBadge } from "./issue-badge";
import { cn } from "@/lib/utils";
import type { CustomerIssue } from "@/lib/types";

export const dateParts = (iso: string) => ({
  day: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "Asia/Colombo" }).format(new Date(iso)),
  time: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" }).format(new Date(iso)),
});

function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="filter-select"><SelectValue placeholder={label}/></SelectTrigger><SelectContent><SelectItem value="all">{label}</SelectItem>{options.map(option=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>;
}

export function QueryList({ issues, review = false, onOpen }: { issues: CustomerIssue[]; review?: boolean; onOpen: (id: string) => void }) {
  const [search,setSearch]=useState("");
  const [action,setAction]=useState("all");
  const [platform,setPlatform]=useState("all");
  const [stage,setStage]=useState("all");
  const [account,setAccount]=useState("all");
  const [market,setMarket]=useState("all");
  const [date,setDate]=useState("all");
  const [filtersOpen,setFiltersOpen]=useState(false);
  const source=issues.filter(issue=>review?issue.action==="review":issue.action!=="review");
  const filtered=useMemo(()=>source.filter(issue=>
    (action==="all" || (action==="verify"?["verify","mapping","unavailable"].includes(issue.action):issue.action===action)) &&
    (platform==="all" || issue.platform===platform) && (stage==="all" || issue.stage===stage) &&
    (account==="all" || issue.account===account) && (market==="all" || issue.market===market) &&
    (date==="all" || dateParts(issue.receivedAt).day===date) &&
    [issue.id,issue.sku,issue.product,issue.summary,issue.topic,issue.account,issue.market].join(" ").toLowerCase().includes(search.toLowerCase())
  ),[source,action,platform,stage,account,market,date,search]);
  const extraCount=[account,market,date].filter(x=>x!=="all").length;
  const clearFilters=()=>{setSearch("");setAction("all");setPlatform("all");setStage("all");setAccount("all");setMarket("all");setDate("all");};
  const tabs=review?[["all","Needs review"]]:[["all","All queries"],["update","Update SOT"],["add","Add to SOT"],["have","Have SOT"],["verify","To verify"]];

  return <section className="query-panel" aria-label={review?"Queries needing clarification":"Customer product queries"}>
    <div className="query-tabs" aria-label="Filter by SOT action">{tabs.map(([value,label])=><button key={value} type="button" className={cn("query-tab",action===value&&"active")} onClick={()=>setAction(value)} aria-pressed={action===value}>{label}{value==="all"&&<span>{source.length}</span>}</button>)}<span className="query-tab-note">Customer messages only</span></div>
    <div className="query-toolbar"><label className="query-search"><Search size={16}/><Input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search SKU, product, or customer question…" aria-label="Search customer queries"/>{search&&<button onClick={()=>setSearch("")} aria-label="Clear search"><X size={14}/></button>}</label><div className="query-toolbar-filters"><FilterSelect value={platform} onChange={setPlatform} label="All platforms" options={[...new Set(source.map(q=>q.platform))]}/><FilterSelect value={stage} onChange={setStage} label="Pre & post sale" options={[...new Set(source.map(q=>q.stage))]}/><Button variant="outline" onClick={()=>setFiltersOpen(true)} className="filter-button"><SlidersHorizontal size={14}/><span>Filters</span>{extraCount>0&&<span className="filter-count">{extraCount}</span>}</Button></div></div>
    <div className="query-table-wrap"><table className="query-table"><thead><tr><th>Received</th><th>Product</th><th>Customer question</th><th>Channel</th><th>SOT & next action</th><th><span className="sr-only">Open query</span></th></tr></thead><tbody>
      {filtered.map(issue=>{const date=dateParts(issue.receivedAt);return <tr key={issue.id} data-testid={`query-${issue.id}`} onClick={event=>{if(!(event.target as HTMLElement).closest("button,a"))onOpen(issue.id);}}>
        <td className="date-cell"><span>{date.day}</span><small>{date.time}</small></td>
        <td><button className="product-cell" onClick={()=>onOpen(issue.id)}><ProductVisual type={issue.art}/><span><strong>{issue.sku??"Variant unresolved"}</strong><small>{issue.product}</small>{issue.candidates&&<span className="candidate-count">2 variant candidates</span>}</span></button></td>
        <td className="question-cell"><button onClick={()=>onOpen(issue.id)} className="question-title">{issue.summary}</button><div className="question-meta"><span>{issue.stage}</span><span className="meta-separator"/><span>{issue.topic}</span>{issue.photos>0&&<button className="attachment-count" onClick={()=>onOpen(issue.id)} aria-label={`Open ${issue.photos} illustrative customer photos`}><ImageIcon size={12}/>{issue.photos}</button>}</div></td>
        <td className="channel-cell"><span className={`platform-mark platform-${issue.platform.toLowerCase()}`}>{issue.platform.charAt(0)}</span><span><strong>{issue.platform} <span className="market">{issue.market}</span></strong><small>{issue.account}</small></span></td>
        <td className="action-cell"><IssueBadge action={issue.action}/><small>{issue.nextAction}</small></td>
        <td><Button variant="ghost" size="icon" className="row-open" onClick={()=>onOpen(issue.id)} aria-label={`Open ${issue.id}`}><ChevronRight size={16}/></Button></td>
      </tr>;})}
    </tbody></table>{!filtered.length&&<div className="empty-state"><Search size={25}/><h3>No matching queries</h3><p>Try another SKU, topic, or filter.</p><Button variant="outline" onClick={clearFilters}>Clear filters</Button></div>}</div>
    <div className="query-footer"><span aria-live="polite">Showing <strong>{filtered.length}</strong> of {source.length} customer issues</span><span><CalendarDays size={13}/> Times in Asia/Colombo</span></div>
    <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Refine customer queries</DialogTitle><DialogDescription>Filter the current issue list by account, marketplace, and received date.</DialogDescription></DialogHeader><div className="advanced-filters"><label>Account<FilterSelect value={account} onChange={setAccount} label="All accounts" options={[...new Set(source.map(q=>q.account))]}/></label><label>Marketplace<FilterSelect value={market} onChange={setMarket} label="All marketplaces" options={[...new Set(source.map(q=>q.market))]}/></label><label>Received date<FilterSelect value={date} onChange={setDate} label="All dates" options={[...new Set(source.map(q=>dateParts(q.receivedAt).day))]}/></label></div><DialogFooter><Button variant="ghost" onClick={()=>{setAccount("all");setMarket("all");setDate("all");}}>Reset</Button><Button onClick={()=>setFiltersOpen(false)}>Show {filtered.length} {filtered.length===1?"query":"queries"}<ArrowUpRight size={15}/></Button></DialogFooter></DialogContent></Dialog>
  </section>;
}
