

# MFN Indicators + Suggested Questions

## Overview

Two small changes: (1) show MFN/RP extraction status badges in the deal header, and (2) conditionally display MFN suggested questions when MFN data was extracted.

## Changes

### 1. Update `Deal` type (`src/types/index.ts`)

Add optional `mfn_provision` field to the `Deal` interface:

```typescript
export interface Deal {
  deal_id: string;
  deal_name: string;
  borrower?: string;
  created_at?: string;
  upload_date?: string;
  mfn_provision?: { extracted: boolean };
}
```

Optional so older responses without it still parse fine.

### 2. Update `AnalysisHeader` (`src/components/analysis/AnalysisHeader.tsx`)

- Accept a new optional prop: `mfnExtracted?: boolean`
- When status is `complete`, render extraction type indicators below the deal name / borrower line:
  - `RP` with a green checkmark (always shown when complete)
  - `MFN` with a green checkmark (only if `mfnExtracted` is true)
- Styling: small inline badges using `text-xs` muted text with `CheckCircle2` icons, similar to the existing status badge aesthetic but subtler

### 3. Update `DealDetailPage` (`src/pages/DealDetailPage.tsx`)

- Pass `mfnExtracted={deal.mfn_provision?.extracted}` to `AnalysisHeader`
- Pass `mfnExtracted={deal.mfn_provision?.extracted === true}` to `SuggestedQuestions`

### 4. Update `SuggestedQuestions` (`src/components/analysis/SuggestedQuestions.tsx`)

- Accept new optional prop: `mfnExtracted?: boolean`
- Add MFN questions to a separate array:
  - "How strong is the MFN protection in this deal?"
  - "What loopholes exist in the MFN provision?"
  - "Can the borrower avoid MFN through reclassification?"
  - "What yield components are included in the MFN calculation?"
- Render MFN questions only when `mfnExtracted` is true
- MFN questions appear after the existing RP questions in the same chip row -- no visual separation needed, they just extend the list

## What does NOT change

- No new API calls
- No new pages, tabs, or routes
- No changes to the `/ask` endpoint or answer display
- No changes to RP analysis display
- `getDeal` already fetches the deal detail; the backend just now includes `mfn_provision` in that response

## Technical detail

The `mfn_provision?.extracted` check uses optional chaining throughout, so if the backend hasn't deployed the MFN feature yet (or returns a deal without that field), everything degrades gracefully -- no MFN badge, no MFN questions, no errors.

