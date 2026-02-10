

# Evidence Panel Feature

## Overview

Add a collapsible "Show evidence" panel below the answer display that reveals the specific extracted data points Valence used to form its answer. Backward-compatible with backends that don't yet return the `evidence` field.

## Changes

### 1. Update Types (`src/types/index.ts`)

Add `EvidenceItem` interface and an optional `evidence` field to `AskResponse`:

```typescript
export interface EvidenceItem {
  question_id: string;
  question_text: string;
  value: boolean | number | string;
  source_text: string;
  source_page: number | null;
  source_section: string;
  confidence: "high" | "medium" | "low" | "not_found";
}

export interface AskResponse {
  question: string;
  answer: string;
  citations: Citation[];
  evidence?: EvidenceItem[];  // optional for backward compat
  data_source: { ... };
}
```

The `evidence` field is optional (`?`), so older responses without it parse fine. The frontend uses `currentAnswer?.evidence ?? []` which resolves to an empty array, and `EvidencePanel` renders nothing when given an empty array.

### 2. Create `src/components/analysis/EvidencePanel.tsx`

New component accepting `evidence: EvidenceItem[]`.

- **Empty/missing evidence:** Render nothing (no toggle, no panel).
- **Collapsed state (default):** Subtle toggle row: chevron icon + "Show evidence (N data points)". Styled as muted text link, not a button.
- **Expanded state:** Scrollable list of evidence cards (max-height with `overflow-y: auto`), using `Collapsible` from Radix.

Each evidence card:
- Header row: `question_text` left, confidence badge right
  - high: green bg, checkmark, "HIGH"
  - medium: amber bg, "MEDIUM"
  - low: red-orange bg, "LOW"
  - not_found: gray bg, "NOT FOUND"
- Value row: booleans as colored "Yes"/"No", numbers formatted with commas/dollar sign, strings quoted and truncated to 200 chars
- Citation row: `source_section` + `source_page` (e.g. "Section 6.06(k), p.83"), or just "p.83" if no section
- Source quote: `source_text` in italic, truncated to 300 chars

### 3. Update `src/pages/DealDetailPage.tsx`

- Import `EvidencePanel`
- Render it after `AnswerDisplay` + copy button, **before** the `SourcesPanel` border section
- Pass `currentAnswer?.evidence ?? []`

No changes to the `/ask` request, `AnswerDisplay`, or `SourcesPanel`.

## Note on EvidencePanel vs SourcesPanel Coexistence

Both panels will render when evidence exists and citations exist. They serve related but distinct purposes:
- **EvidencePanel**: Shows the structured data points (extracted Q&A pairs) that informed the answer
- **SourcesPanel**: Shows the page-level citations referenced in the answer text

During testing, watch whether users find both useful simultaneously or if evidence makes sources feel redundant. If so, a future iteration could collapse SourcesPanel by default when evidence is present, or merge page references into evidence cards. No action needed now -- ship both and observe.

