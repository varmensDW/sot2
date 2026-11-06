import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard";
import { sampleIssues } from "@/lib/sample-data";

export default function Home() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Opening QUERY…</div>}><Dashboard issues={sampleIssues} /></Suspense>;
}
