
Context and audit summary (what I verified)
- You’re on route “/” (Deals list).
- Current list behavior is controlled by:
  - src/components/deals/DealRowActions.tsx (renders status badge + trash icon, currently disables delete unless status is complete/error, and polls status every 5s while processing)
  - src/pages/DealsPage.tsx (holds deletingDeal state and renders the AlertDialog)
- In our controlled Preview run, clicking the trash icon on a Complete deal opens the “Delete Deal?” dialog (so the wiring between DealRowActions → DealsPage → AlertDialog works when the button is enabled).
- Your reported case is different: you are clicking a Processing deal and want delete to work; currently it is intentionally blocked, and the combination of “disabled button” + wrapper span that stops propagation can make it feel like “looks enabled, no action”.

Root cause (why it “does nothing” for you)
1) Delete is explicitly disabled for Processing deals
- In DealRowActions.tsx:
  - canDelete is only true when statusValue is "complete" or "error".
  - disabled={!canDelete || isDeleting}
- For Processing deals (pending/extracting/storing), the underlying <button> is disabled, so the onClick handler on the Button never runs. That matches your symptom: “Looks enabled, no action”.

2) Tooltip can appear as “nothing” depending on interaction timing
- Tooltip text exists in code, but:
  - Tooltips require hover dwell; default Radix delay can make it seem like nothing happens if you don’t hover long enough.
  - On click, we stopPropagation (to avoid navigating into the deal), but we do not provide any click feedback when the delete is disabled. So click feels dead.

Root cause (why the page can freeze / “page unresponsive”)
- The list page does N separate status queries (one per deal row), and for Processing deals it polls every 5 seconds.
- With “Many Processing” deals, that becomes a steady background of fetch + re-render churn.
- Additionally, each Processing badge uses CSS spin animation (Loader2 + animate-spin) which can contribute to CPU load if many rows are simultaneously “extracting/storing”.

What we will change (aligned with your approved preferences)
You selected:
- Allow deletion while processing
- Desktop/laptop
- Freeze symptom: page becomes unresponsive
So the fix needs to do two things:
A) Make delete clickable for Processing deals (and still safe)
B) Stop list-page polling and reduce CPU work so the list can’t freeze

Implementation plan (code changes)

1) Make delete work for Processing deals (UI + logic)
Files: 
- src/components/deals/DealRowActions.tsx
- src/pages/DealsPage.tsx

1.1 Update DealRowActions to never disable delete due to status
- Change the delete Button to be disabled only while an actual delete request is in-flight:
  - disabled={isDeleting} (remove status-based disabling)
- Keep stopPropagation to prevent card/row navigation when clicking trash.

1.2 Pass status into the delete flow so the dialog can warn appropriately
- Update DealRowActions prop and call signature:
  - onDelete(deal, statusValue)
- Update DealsPage state:
  - replace deletingDeal: Deal | null
  - with deleting: { deal: Deal; status?: DealStatus["status"] } | null
- In the AlertDialog description:
  - If status is pending/extracting/storing, show an additional warning line like:
    - “This deal is still processing. Deleting it may fail or leave background processing running.”
  - Still allow the user to proceed (since you requested deletion while processing).

1.3 Provide click feedback even if status is unknown
- If status hasn’t loaded yet, still allow opening the dialog (status = undefined).
- The dialog will show a neutral warning:
  - “Status is still loading; deletion may fail if processing is in progress.”

2) URGENT: Disable all status polling on the deals list page (temporary fix)
File:
- src/components/deals/DealRowActions.tsx

2.1 Replace current polling query with one-time fetch (your requested snippet)
- Change useQuery options to:
  - staleTime: 60000
  - refetchInterval: false
  - refetchOnWindowFocus: false
  - refetchOnReconnect: false (add this as well to avoid surprise refetch storms)
- Remove refetchIntervalInBackground (not needed once polling is off)

Expected result:
- When you load “/”, each deal status is fetched once, then cached for 60s, with no periodic polling.
- This should remove the major cause of list-page “page unresponsive”.

2.2 Add a manual “Refresh statuses” affordance (so you’re not stuck with stale statuses)
File:
- src/pages/DealsPage.tsx
- Add a small secondary button near Search (or header):
  - “Refresh statuses”
  - onClick: queryClient.invalidateQueries({ queryKey: ["deal-status"] })
This gives you a way to update statuses on demand without polling.

3) Reduce CPU load further: stop spinner animations on the list (optional but recommended given your freeze symptom)
Files:
- src/components/deals/DealStatusBadge.tsx
- src/components/deals/DealRowActions.tsx

3.1 Add a prop to DealStatusBadge to control animation
- Add prop: animate?: boolean (default true)
- When animate is false:
  - do not apply config.iconClassName (so Loader2 does not animate-spin)

3.2 In DealRowActions (list page), render badge with animate={false}
- This keeps the status visible but removes multiple concurrent spinners that can tax the browser.

4) Add the debug logging you requested (DEV-only) to conclusively confirm click flow
Files:
- src/components/deals/DealRowActions.tsx
- src/pages/DealsPage.tsx

4.1 DealRowActions click log
- Add:
  - console.log("Delete clicked for deal:", deal.deal_id, "status:", statusValue)
- Guard it:
  - if (import.meta.env.DEV) console.log(...)

4.2 DealsPage handler + state logs
- Add logs in handleDeleteClick:
  - console.log("handleDeleteClick called:", deal, status)
- Add useEffect to log state changes:
  - console.log("deleting changed:", deleting)

What logs you should expect after these changes
- Clicking trash on any deal (including Processing) should produce:
  - “Delete clicked for deal: … status: pending|extracting|storing|…”
  - “handleDeleteClick called: …”
  - “deleting changed: …”
  - And the AlertDialog should appear.

- If you still see “nothing happens”:
  - That would indicate the click is not reaching the handler at all (e.g., overlay, element covered, or a navigation capturing event). The logs will prove where it breaks.

Testing checklist (what you’ll verify in Preview)
1) Freeze regression
- Load “/” with 0–20 deals, many processing.
- Confirm the browser no longer shows “Page unresponsive” after sitting on the page for 1–2 minutes.

2) Delete behavior (Processing deal)
- Click trash on a Processing deal:
  - Dialog opens.
  - Dialog shows warning about processing.
  - Clicking “Delete” triggers the DELETE request; success toast or error toast appears.

3) Delete behavior (Complete deal)
- Click trash on a Complete deal:
  - Dialog opens with standard copy.
  - Confirm delete removes the deal and the list refreshes.

4) Status refresh
- Click “Refresh statuses” and confirm statuses update without any background polling.

Notes / tradeoffs
- Allowing deletion while processing may fail depending on how the external backend handles in-flight jobs. We’ll handle failures gracefully (toast with error), but we can’t guarantee the backend will cancel/cleanup background extraction unless the API supports it.
- Disabling polling on the list means statuses won’t live-update. That’s intentional for stability; the deal detail page can remain the place for live progress updates.

Files to change (summary)
- src/components/deals/DealRowActions.tsx
  - Remove status-based disabling of delete
  - Disable polling (one-time fetch + caching)
  - Pass status to onDelete
  - Add DEV-only logs
  - Use non-animated badge on list

- src/pages/DealsPage.tsx
  - Store deletingDeal + status together
  - Update AlertDialog copy based on status
  - Add “Refresh statuses” button
  - Add DEV-only logs

- src/components/deals/DealStatusBadge.tsx (optional but recommended)
  - Add animate prop to disable spin on list

If you approve, I’ll implement the above changes and then re-test in Preview by deleting a Processing deal and verifying no status polling occurs on the list.
