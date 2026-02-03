
Goal
- Fix two issues on Deals list (/):
  1) Clicking the trash icon on a Processing deal “does nothing”
  2) Page becomes unresponsive (“freeze”) when many deals are Processing

What I audited (evidence)
- Current list delete wiring (DealRowActions → DealsPage → AlertDialog) is correct for non-disabled buttons.
- In my controlled browser run, clicking a deal’s trash icon produced console logs:
  - “Delete clicked…” → “handleDeleteClick…” → “deleting changed…”
  and the DELETE request succeeded (200) against `/api/deals/:id`.
- Status polling on the list is already disabled (refetchInterval: false) but the list still fires 1 status request per deal on initial render (burst concurrency).

Root-cause hypotheses (most likely)
A) Freeze root cause: initial “N concurrent status fetches” + rendering churn
- Even without polling, the list triggers a status fetch per row on mount.
- With 10–20 deals, that’s 10–20 simultaneous network calls plus React renders; with slow network/CPU this can lock the UI, making clicks appear to “do nothing”.
- The symptom “tooltip shows nothing” is consistent with the main thread being blocked/janky (hover delay, no paint).

B) Click root cause: event handling + Radix TooltipTrigger wrapper + row navigation + blocked main thread
- The current structure is: TooltipTrigger(asChild) → span(stopPropagation) → Button(onClick).
- This should work when UI is responsive, but it is fragile:
  - The trigger is the span, not the button.
  - StopPropagation happens on the wrapper, not in capture phase.
  - If the UI is janking/frozen, user can perceive clicks as not firing.
- We need a more “bulletproof” event capture arrangement that cannot be stolen by the parent row/card and does not depend on tooltip wrappers.

Fix strategy (high-confidence)
1) Eliminate the “N requests on mount” pattern on the Deals list
- Do not fetch per-row status on initial render.
- Replace with one of these approaches (preferred order):

1.1 Preferred: Single batched backend call for statuses (1 request instead of N)
- Add a Lovable Cloud backend function (public) like `GET /deal-statuses?ids=...` or `POST /deal-statuses` with JSON body `{ deal_ids: string[] }`.
- That backend function will call the external API server-side and return a map:
  - `{ [deal_id]: { status, progress, current_step, ... } }`
- Concurrency-limit these upstream calls (e.g., 4 at a time) to avoid overwhelming the API and to keep the function responsive.
- Frontend: in DealsPage, compute `dealIds` from `deals`, and do a single `useQuery(['deal-statuses', dealIds])`.
- DealRowActions becomes “dumb”: it receives `statusValue` as prop, no `useQuery` inside each row.
Expected result:
- List page loads with 1 deals request + 1 statuses request; no more burst of N fetches, so freezes should stop.

1.2 If backend batching is not acceptable right now: lazy/limited client fetching
- Keep client-side fetching but:
  - Only fetch statuses after initial paint (setTimeout/idle callback).
  - Limit concurrency (queue fetches, 3–4 at a time).
  - Fetch only for visible rows (IntersectionObserver) and skip cards not in view.
Expected result:
- Initial render becomes fast; statuses fill in gradually without freezing.

2) Make delete clicks unstealable and observable (even under UI stress)
2.1 Simplify DealRowActions markup for reliable events + tooltips
- Remove the span wrapper and attach event handling directly to the Button (and/or an actions container):
  - Use `onPointerDownCapture` and `onClickCapture` to stop propagation before the Card/TableRow click handler sees it.
  - Keep `onClick` for the actual delete handler.
- Make TooltipTrigger wrap the Button directly (Button is forwardRef) to avoid “trigger is a span” fragility.
Expected result:
- Parent row/card navigation cannot interfere; delete handler fires deterministically.

2.2 Add a non-console user-visible debug fallback (temporary, DEV-only)
- In DEV, fire a toast like “Opening delete dialog…” on delete click.
Why:
- If the UI is janking, console logs may not be noticed, but a toast is immediate visual confirmation.

3) Remove remaining contributors to “freeze”
Even after batching statuses, add these defensive tweaks:
- Set React Query defaults in QueryClient to reduce surprise refetch storms (safe for list views):
  - refetchOnWindowFocus: false (globally or at least for the list queries)
  - refetchOnReconnect: false
- Ensure no “spin” animations run in a list context (already added `animate={false}` on DealStatusBadge in the list; keep it).
- Ensure list rendering doesn’t do heavy work inside map loops:
  - Memoize derived values and avoid inline IIFEs where possible (not critical, but helpful).

4) Verification plan (what I will test after implementing)
Delete behavior (processing)
- Ensure at least one deal is actually Processing (pending/extracting/storing).
- Click trash on that deal:
  - Confirm DEV toast/log appears.
  - Confirm AlertDialog opens every time.
  - Confirm pressing Delete triggers `DELETE /api/deals/:id` (network shows it).
Freeze behavior
- Reload / with 10–20 deals:
  - Confirm network shows:
    - 1 call to `/api/deals`
    - 1 call to the batched statuses endpoint (or a throttled trickle if using lazy fetching)
    - No continuous polling on /.
- Leave the page idle for 2 minutes:
  - Confirm no repeated status fetches.
  - Confirm no “Page unresponsive”.

Files that will change (implementation)
- src/pages/DealsPage.tsx
  - Move status loading to a single query (batched) or lazy/throttled mechanism.
  - Pass status into DealRowActions as a prop.
- src/components/deals/DealRowActions.tsx
  - Remove per-row useQuery.
  - Harden event handling with capture-phase stopPropagation.
  - Simplify TooltipTrigger structure to wrap Button directly.
- src/api/client.ts
  - Add client helper for the batched statuses endpoint (if using Lovable Cloud backend function).
- (New) Lovable Cloud backend function (recommended)
  - Implement `deal-statuses` (batch) proxy with concurrency limiting and clear error handling.
  - No database changes required.

Why this will fix both problems
- The freeze is primarily caused by many status requests and renders competing on the main thread. Reducing N-per-row fetching to 1 batched request (or throttled lazy fetch) removes the primary load spike.
- Once the UI stays responsive, clicks won’t be “lost”. Additionally, switching to capture-phase propagation control and removing the span/trigger fragility ensures the delete handler fires even if parent rows/cards are clickable.

Rollout / risk
- Low risk to core data paths: deals list and delete flows remain unchanged; only the status acquisition strategy and click plumbing change.
- If the batched status endpoint temporarily fails, we’ll render a safe fallback status (e.g., “Pending/Unknown”) and keep delete available.

Open questions (non-blocking, but helpful for final tuning)
- Roughly how many Processing deals do you typically have when it freezes (10, 20, 50+)?
- Do you need accurate per-deal status on the list at all times, or is “Refresh statuses” sufficient for the list view?
