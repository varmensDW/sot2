"use client";

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import { correctionReducer, createDemoCorrections, type CorrectionMap, type DemoAction } from "@/lib/correction-demo";
import type { CustomerIssue } from "@/lib/types";

const storageKey = "query-correction-ui-demo-v2";
const DemoContext = createContext<{ records: CorrectionMap; dispatch: React.Dispatch<DemoAction>; reset: () => void } | null>(null);

export function CorrectionDemoProvider({ issues, children }: { issues: CustomerIssue[]; children: ReactNode }) {
  const [initial] = useState(() => createDemoCorrections(issues));
  const [records, dispatch] = useReducer(correctionReducer, initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      const seed = initial;
      if (saved && Object.keys(seed).every(key => saved[key]?.id === seed[key].id && Array.isArray(saved[key]?.history))) {
        dispatch({ type: "restore", records: Object.fromEntries(Object.keys(seed).map(key => [key, saved[key]])) });
      }
    } catch { /* An unavailable or older preview session starts with the fixtures. */ }
    setLoaded(true);
  }, [initial]);
  useEffect(() => {
    if (loaded) try { sessionStorage.setItem(storageKey, JSON.stringify(records)); } catch { /* Preview works without browser storage. */ }
  }, [records, loaded]);
  useEffect(() => {
    if (!loaded) return;
    const timers = Object.values(records).flatMap(record => {
      if (!['checking', 'sending'].includes(record.status)) return [];
      return [window.setTimeout(() => dispatch({ type: record.status === "checking" ? "sync_complete" : "send_complete", issueId: record.issueId, at: new Date().toISOString() }), 750)];
    });
    return () => timers.forEach(window.clearTimeout);
  }, [records, loaded]);
  return <DemoContext.Provider value={{ records, dispatch, reset: () => dispatch({ type: "reset", records: initial }) }}>{children}</DemoContext.Provider>;
}

export function useCorrectionDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Correction preview needs its demo provider.");
  return context;
}
