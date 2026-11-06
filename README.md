# QUERY

Local dashboard for customer product questions, SOT improvements, and listing corrections.

## Run on this PC

```powershell
cd F:\Projects\QUERY
npm install
npm run dev
```

Open http://127.0.0.1:3000. The server binds to this PC's loopback interface.

For a production build:

```powershell
npm run build
npm start
```

Run `npm run typecheck` to validate TypeScript.

The development and build scripts use Next.js's supported Webpack mode because Turbopack's CSS worker failed to start on this Windows environment.

## Implemented

- Next.js App Router, React, TypeScript, Tailwind CSS, official shadcn/ui components, Lucide icons, and Motion transitions respecting reduced-motion preferences.
- Approved Royal Gradient theme: a dark navy-to-royal-blue sidebar, blue-to-cyan primary actions, self-hosted Inter, stronger text contrast, consistent 44 px action buttons, and visible transitions that respect reduced-motion preferences.
- Green completed states, orange pending states, red failures, purple missing-data actions, and blue primary actions. Includes a responsive query list, query details, evidence comparison, attachment previews, publication view, and insights.
- Search and filters for SOT action, platform, sale stage, account, marketplace, and date.
- Query URLs preserve the selected view and issue and support browser navigation.
- **Update SOT** and **Add to SOT** open the user-supplied Components SOT Google Sheet tab in a new tab. The adjacent copy action copies the SKU. These links do not change any sheet or database data.
- A UI-only **Check database sync** action previews a verified change, pending sync, or source failure. **Send to listing tool** sits beside **Update SOT / Add to SOT** and opens a review dialog with the SKU, field, old value, and verified value. Listing-only corrections can be sent directly from existing verified sample SOT data.
- **Listing updates** shows one status per correction, with its receipt, completion confirmation, failures, retries, and activity history. The separate listing tool manages individual listings. A correction becomes **Published** when the listing team confirms **Updated related listings** after updating and publishing all related changes.

## Try the correction preview

1. Open an Update SOT or Add to SOT query, then click **Check database sync**. Expand **Preview sync result** to try pending or failed checks. The successful Add example uses a synthetic 150 cm cable length.
2. Click **Send to listing tool**, review the correction, and confirm. The dialog's preview controls can simulate a failed delivery. A Have SOT query can skip the sheet-edit step.
3. Open **Listing updates**, expand a correction, and use **Preview listing-tool response** to simulate progress, completion, or failure. **Preview completion received** simulates the listing team’s **Updated related listings** confirmation. Retry retains the same correction ID.
4. **Reset demo** restores the starting examples. Preview progress survives refresh in the current browser tab using session storage.

## Data boundaries

Customer records, SKUs, product drawings, photos, recommendations, and publication states are synthetic examples. The Google Sheets link is real and configured in `src/lib/sot.ts`.

The linked sheet is verified as **Components SOT**. Its selected tab ID is retained from the supplied URL. Individual SKU rows and fields have not been mapped, so the buttons open that tab rather than inventing cell addresses.

No customer-message feed, live SOT database, AI classifier, listing-tool API, authentication provider, or scheduled worker is connected in this UI implementation. All preview transitions happen locally in the browser. No messages are sent and no listings are published. The existing Google Sheets-to-database sync is not modified. The fail-closed `/api/sot/check` stub is retained for future integration but is not called by the demo.

## Main files

- `src/components/dashboard.tsx`: application shell and navigation.
- `src/components/query-list.tsx`: issue list and filters.
- `src/components/issue-detail.tsx`: evidence, SOT links, and simulated verification action.
- `src/components/listing-correction.tsx`: correction review, sending, and preview controls.
- `src/components/listing-updates.tsx`: correction status, completion confirmation, receipts, retries, and history.
- `src/components/correction-demo-provider.tsx`: browser-only preview state and session storage.
- `src/lib/correction-demo.ts`: typed sample corrections and workflow transitions.
- `src/components/ui/`: official shadcn/ui components added with its CLI.
- `src/lib/types.ts`: typed issue contract.
- `src/lib/sample-data.ts`: isolated example data.
- `src/lib/sot.ts`: Google Sheets destination and URL validation.
- `src/app/api/sot/check/route.ts`: fail-closed verification boundary pending live integration.
- `src/app/globals.css`: responsive layout and theme.
- `prototype/`: original approved HTML concept, preserved separately.
- `SOT-Customer-Query-SKILL.md`: domain requirements for classification, evidence, and handoff.

## Integration sequence

1. Map the message sources and reliable message direction/author metadata. Load the project skill into the analysis workflow and preserve its INCLUDE / REVIEW / SUPPORT / IGNORE distinctions.
2. Resolve platform/account-scoped listing identifiers, sold variants, and candidate SKUs against real source records.
3. Read actual SOT schema and synced records; attach verified Google Sheet tab/row references where available. Keep customer claims, listing claims, stored facts, and proposed values separate.
4. Replace the verification boundary with an authorized read-only database adapter. Compare the intended SKU, field, unit, value, source version, and sync freshness. An unchanged or stale record must remain pending.
5. Persist reviewed corrections with audit history and idempotency keys. Require verified identity and evidence before queuing a change. Invalidate stale approvals if the source changes.
6. Agree the handoff contract with the separate listing tool. Leave individual listing management in that system. Receive a completion event tied to the correction ID, SKU/variant and correction version, with confirmation time and actor. Mark Published only when the listing team confirms all related changes are updated and published; a receipt alone is insufficient. Listing-only corrections do not require a fake SOT edit.

## Framework references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [shadcn/ui](https://ui.shadcn.com/docs/installation/manual)
- [Motion for React](https://motion.dev/docs/react-installation)
