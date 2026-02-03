
# Fix Deal Detail Page - Phases 2-4 Implementation

## Overview
This plan addresses the layout, visual design, and error handling issues visible in the Deal Detail page. Phase 1 (API response mapping) is being fixed in the backend, so we'll focus on making the frontend resilient and visually polished.

---

## Phase 2: Fix Layout

### Changes to `src/pages/DealDetailPage.tsx`

**Header Improvements:**
- Add colored border indicator based on deal status
- Better visual hierarchy with status badge prominent

**Three-Column Layout Fix:**
- Increase left sidebar from `w-56` (224px) to `w-64` (256px)
- Make right Document Chat panel responsive (hidden on screens < 1280px with `hidden xl:block`)
- Add smooth scrolling when clicking category in sidebar

**Empty State Handling:**
- Add a helpful empty state when provision is null/undefined
- Show different messages based on whether extraction is complete vs failed
- Add "Back to Deals" action button

**Scroll to Category:**
- When clicking a category in the sidebar, smoothly scroll to that section
- Update active category indicator when scrolling

### Changes to `src/components/analysis/CategoryNav.tsx`

- Remove `truncate` class so category names wrap properly
- Better hover and active states
- Show progress bar for all categories (not just ones with answers)
- Improve spacing and readability

### Changes to `src/components/analysis/CategorySection.tsx`

- Make the component simpler - remove the redundant category code badge since it's already in the sidebar
- Better empty state for sections with no answers
- Add subtle alternating row backgrounds for questions
- Improve question/answer spacing

---

## Phase 3: Improve Visual Design

### Changes to `src/pages/DealDetailPage.tsx`

**Status-Aware Header:**
- Add a subtle colored top border based on extraction status
- Status badge with appropriate icon and color
- Show extraction progress inline when processing

**Empty State Component:**
- Create an inline empty state component with:
  - DocumentSearch icon
  - "No extracted data available" heading
  - Helpful sub-message based on status
  - "Back to Deals" button

### Changes to `src/components/analysis/CategorySection.tsx`

- Cleaner design without heavy card styling
- Subtle section dividers instead of full card borders
- Add `even:bg-muted/30` for alternating question rows
- Better visual hierarchy between question text and answer

### Changes to `src/components/analysis/MultiselectAnswer.tsx`

- Change "No concepts found" to "No data" for cleaner messaging
- Add a subtle "awaiting extraction" state style

### Changes to `src/components/chat/DocumentChat.tsx`

- Add a "Coming Soon" or helpful message when chat fails
- Better error state styling
- Add note about what types of questions can be asked

---

## Phase 4: Handle Error States

### Changes to `src/hooks/useDealStatus.ts`

- Add `hasError` flag for when extraction status returns error
- Continue polling initially even if first request fails (backend might not be ready)
- Add error state handling

### Changes to `src/pages/DealDetailPage.tsx`

- Handle provision fetch errors gracefully
- Show helpful error message when RP provision endpoint returns 404
- Distinguish between "no data yet" vs "extraction failed" vs "data unavailable"
- Add retry functionality for failed requests

**Error States to Handle:**
1. **Deal not found** - Already handled, keep as is
2. **Still processing** - Show ExtractionProgress component (already works)
3. **Extraction complete but no provision** - Show "No data extracted" with explanation
4. **Extraction failed** - Show error message with retry option
5. **API error** - Show generic error with retry option

---

## File Changes Summary

| File | Type | Changes |
|------|------|---------|
| `src/pages/DealDetailPage.tsx` | Modify | Layout fixes, empty state, error handling, scroll-to-category |
| `src/components/analysis/CategoryNav.tsx` | Modify | Wider, better text wrapping, improved progress bar |
| `src/components/analysis/CategorySection.tsx` | Modify | Simpler design, better empty state, alternating rows |
| `src/components/analysis/MultiselectAnswer.tsx` | Modify | Better empty message |
| `src/components/chat/DocumentChat.tsx` | Modify | Better error states |
| `src/hooks/useDealStatus.ts` | Modify | Better error detection |

---

## Implementation Details

### Empty State Component (inline in DealDetailPage)
```text
┌─────────────────────────────────────────────┐
│                                             │
│           [DocumentSearch Icon]             │
│                                             │
│      No extracted data available            │
│                                             │
│   Extraction may still be in progress,      │
│   or this deal hasn't been fully            │
│   processed yet.                            │
│                                             │
│         [← Back to Deals]                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Improved Category Navigation Layout
```text
┌────────────────────────────────────┐
│ [A] Dividend Restrictions -        │
│     General Structure              │
│     3/5 answered ████████░░        │
├────────────────────────────────────┤
│ [B] Intercompany Dividends         │
│     0/1 answered ░░░░░░░░░░        │
├────────────────────────────────────┤
│ [C] Management Equity Basket       │
│     2/7 answered ███░░░░░░░        │
└────────────────────────────────────┘
```

### Simplified Category Section (no redundant header)
```text
┌─────────────────────────────────────────────────────────────┐
│ General Dividend Prohibition        ✓ Yes                  │
├─────────────────────────────────────────────────────────────┤ (alternating bg)
│ Explicit RP Covenant Exists         ✓ Yes                  │
├─────────────────────────────────────────────────────────────┤
│ Carve-out Structure Present         — Not found            │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Notes

1. **Scroll-to-category**: Use `document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth' })`

2. **Responsive Document Chat**: Use `hidden xl:block` to hide on screens < 1280px

3. **Provision error handling**: Check if provision query has `error` state and show appropriate message

4. **Category wrapping**: Remove `truncate` class and use `line-clamp-2` if needed, or allow natural wrapping

5. **Progress bar visibility**: Show progress bar for all categories, use different opacity for 0% complete

---

## Expected Outcome

After implementation:
- Left sidebar shows full category names (wrapping if needed)
- Right chat panel is visible on desktop, hidden on smaller screens
- Empty state is shown when no provision data is available
- Smooth scrolling when clicking categories
- Cleaner visual design with less visual clutter
- Better error messages that help users understand what's happening
