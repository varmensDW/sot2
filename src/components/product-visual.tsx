"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { ProductArt } from "@/lib/types";

export function ProductVisual({ type, className, attachment = false }: { type: ProductArt; className?: string; attachment?: boolean }) {
  const id = useId().replace(/:/g, "");
  return <div className={cn("product-visual", attachment && "attachment-visual", className)}>
    <svg viewBox="0 0 100 110" role="img" aria-label={attachment ? "Illustrative customer attachment, sample data" : "Illustrative product image, sample data"}>
      <defs>
        <linearGradient id={`${id}-amber`}><stop stopColor="#705638"/><stop offset=".42" stopColor="#d2b986"/><stop offset=".72" stopColor="#b28d57"/><stop offset="1" stopColor="#81613b"/></linearGradient>
        <linearGradient id={`${id}-black`}><stop stopColor="#26292a"/><stop offset=".45" stopColor="#606563"/><stop offset="1" stopColor="#262b2a"/></linearGradient>
        <linearGradient id={`${id}-bulb`}><stop stopColor="#e7c78b" stopOpacity=".55"/><stop offset=".4" stopColor="#fff2cc"/><stop offset="1" stopColor="#cda557" stopOpacity=".75"/></linearGradient>
        <linearGradient id={`${id}-steel`} x2="0" y2="1"><stop stopColor="#d5d7d5"/><stop offset="1" stopColor="#929b9a"/></linearGradient>
      </defs>
      <ellipse cx="50" cy="96" rx="29" ry="4" fill="#181d28" opacity=".08"/>
      {(type === "pendant" || type === "black") && <>
        <path d="M50 0v37" stroke="#474a48" strokeWidth="2.5"/><rect x="43" y="34" width="14" height="14" rx="4" fill="#414643"/>
        <path d="M13 78c0-23 16-35 37-35s37 12 37 35v8H13Z" fill={`url(#${id}-${type === "black" ? "black" : "amber"})`}/>
        <ellipse cx="50" cy="86" rx="37" ry="4" fill={type === "black" ? "#242928" : "#795f3d"}/><ellipse cx="50" cy="86" rx="28" ry="2.2" fill="#f1dfb1"/><path d="M43 87h14c0 8-14 8-14 0" fill="#edca78"/>
      </>}
      {type === "bulb" && <>
        <path d="M23 42a27 30 0 1 1 54 0c0 16-12 20-15 33H38C35 62 23 58 23 42Z" fill={`url(#${id}-bulb)`} stroke="#b99959" strokeOpacity=".4"/>
        <path d="m43 70-4-32 7 15 7-15 6 32" fill="none" stroke="#c38b2a" strokeWidth="1.5"/><path d="M39 76h22v15q-11 12-22 0Z" fill="#939c9a"/>
        {[80,85,90].map(y=><path key={y} d={`M39 ${y}h22`} stroke="#535f5e" strokeWidth="2"/>)}<path d="M34 32q4-13 14-14" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" opacity=".7"/>
      </>}
      {type === "cable" && <>
        {[25,20,15].map((r,i)=><ellipse key={r} cx="48" cy="52" rx={r} ry={r+5} fill="none" stroke={i===1?'#525b58':'#343c39'} strokeWidth="5" transform="rotate(-22 48 52)"/>)}
        <path d="M68 66q-5 19 15 23" fill="none" stroke="#343c39" strokeWidth="5" strokeLinecap="round"/><path d="m83 89 5 3" stroke="#a58950" strokeWidth="2"/>
      </>}
      {type === "driver" && <g transform="translate(10 27) rotate(-12 40 25)">
        <rect x="1" y="3" width="77" height="42" rx="3" fill={`url(#${id}-steel)`} stroke="#848e8b"/>
        {[10,18,26,34,42,50,58,66].map(x=><path key={x} d={`M${x} 8v31`} stroke="#606e6a" strokeWidth="2" opacity=".6"/>)}
        <rect x="23" y="14" width="31" height="17" rx="1" fill="#e6e5dc"/><text x="38" y="25" textAnchor="middle" fontSize="7" fill="#414e4b">24V DC</text>
        <rect x="70" y="45" width="10" height="7" fill="#547264"/><rect x="0" y="43" width="10" height="7" fill="#547264"/>
      </g>}
      {attachment && <g transform="translate(83 9) rotate(6)"><rect width="9" height="85" fill="#dcc993"/>{Array.from({length:17},(_,i)=><path key={i} d={`M0 ${i*5+2}h${i%2?4:7}`} stroke="#8f7f57" strokeWidth=".7"/>)}</g>}
    </svg>
  </div>;
}
