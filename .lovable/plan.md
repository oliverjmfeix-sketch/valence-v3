
## What’s happening (root cause)

The “site not responding” freeze is very likely caused by an unintended re-render loop in `src/pages/DealsPage.tsx`:

- Each `DealStatusCell` runs a `useEffect` that calls `onStatusChange(...)`.
- In the parent, `onStatusChange` is currently passed as an inline arrow function:  
  `onStatusChange={(status) => handleStatusChange(deal.deal_id, status)}`
  which creates a brand-new function on every render.
- Because `onStatusChange` changes every render, the `useEffect` in each `DealStatusCell` runs again even if the status didn’t change.
- That effect calls `setDealStatuses`, which creates a new object each time, which triggers another render, and the cycle repeats (can peg CPU and trigger the browser “page unresponsive” dialog).

This also explains why the trash icon “does nothing”: the page is stuck re-rendering and becomes unresponsive.

---

## Goal

1. Stop the render loop so the Deals page stays responsive.
2. Keep status tracking so the delete button can be disabled correctly.
3. Make delete eligibility stricter per your UX requirement:
   - Only allow delete when `status === "complete"` or `status === "error"`.
   - Disable delete while upload/extraction is in progress (pending/extracting/storing or unknown).

---

## Changes to implement

### 1) Stabilize the status-change callback (fix the loop)

**File:** `src/pages/DealsPage.tsx`

- Update `DealStatusCell` API so it can call a single stable callback with `(dealId, status)` rather than receiving a per-row inline closure.
  - Change prop type from:
    - `onStatusChange?: (status: string) => void`
  - to:
    - `onStatusChange?: (dealId: string, status: DealStatus["status"]) => void` (or string if your types are loose)

- In the parent component:
  - Create `handleStatusChange` using `useCallback`.
  - Ensure it does not update state if the value didn’t actually change:
    - `setDealStatuses(prev => prev[dealId] === status ? prev : { ...prev, [dealId]: status })`

- In `DealStatusCell`:
  - Keep the `useEffect`, but now it will depend on a stable `onStatusChange` and won’t retrigger endlessly.

**Expected outcome:** the Deals page stops re-rendering continuously and becomes responsive.

---

### 2) Make “can delete” logic match your requirements

**File:** `src/pages/DealsPage.tsx`

- Update `canDeleteDeal(dealId)` to:
  - Return `true` only when status is exactly `"complete"` or `"error"`.
  - Return `false` when status is missing/unknown (initial load), which also covers “upload in progress”.

- Update tooltip copy for disabled state to be more accurate:
  - If status unknown: “Loading status…”
  - If status is pending/extracting/storing: “Cannot delete while extraction is in progress”
  - Otherwise: “Delete deal”

**Expected outcome:** deletion is not possible during upload/extraction; only complete/error deals can be deleted.

---

### 3) Minor cleanup (optional but recommended)

**File:** `src/pages/DealsPage.tsx`

- Remove unused import `TooltipProvider` (it’s currently imported but not used after the earlier change).
- Keep `e.stopPropagation()` on the delete button to prevent navigation clicks (already present).

---

## Testing checklist (what we’ll verify after the fix)

1. Open `/` (Deals list) and confirm the browser no longer shows “page not responding”.
2. Hover trash icon:
   - Tooltip shows correct text.
3. While a deal is processing (pending/extracting/storing):
   - Trash icon is disabled.
4. For a complete deal:
   - Clicking trash opens the confirmation dialog.
   - Clicking “Delete” shows loading state, then success toast, and the deal disappears after refetch.
5. For a failed delete:
   - Error toast appears and the dialog remains open for retry.

---

## Files involved

- `src/pages/DealsPage.tsx` (primary fix: stop render loop + correct disable rules)
