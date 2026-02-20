

# Reasoning Chain Panel

## Overview

Add a collapsible "Show analysis" panel to the deal Q&A interface that renders the structured reasoning chain returned by the backend when `show_reasoning: true` is sent. The panel sits between the answer and the evidence panel, matching the existing design language.

## Changes

### 1. Add reasoning types (`src/types/index.ts`)

Insert new interfaces above `AskResponse`:

- `ReasoningProvision` -- question_id, optional field, value, source_page, why_relevant
- `ReasoningInteraction` -- finding, chain (string array), implication
- `ReasoningEvidenceStats` -- total_available, cited_in_answer
- `ReasoningChain` -- issue, provisions, analysis (string array), interactions, conclusion, evidence_stats

Add `reasoning?: ReasoningChain | null` and `routed_categories?: string[]` to `AskResponse`.

### 2. Send `show_reasoning: true` (`src/api/client.ts`)

Update `askDealQuestion` to include `show_reasoning: true` in the POST body alongside `question`. One-line change.

### 3. New component (`src/components/analysis/ReasoningPanel.tsx`)

A collapsible panel following the same pattern as `EvidencePanel`:

- **Trigger:** "Show analysis (N provisions, M interactions)" with chevron toggle, collapsed by default
- **Section 1 -- Issue:** Subtle banner with `Scale` icon, italic muted text framing the legal question
- **Section 2 -- Provisions:** "Relevant Provisions" header with count badge. Each provision as a compact card: mono-font question_id label, formatted value (reusing the same boolean/currency/string formatting pattern from EvidencePanel), why_relevant text, optional page badge
- **Section 3 -- Analysis:** "Provision Analysis" header. Each analysis string as a bullet. Text in square brackets (e.g. `[jc_t1_01]`) styled as inline code spans via regex replacement
- **Section 4 -- Interactions:** "Interaction Findings" header, only rendered if interactions exist. Each interaction as an amber left-bordered card with AlertTriangle icon on the finding, numbered chain steps with mono-font question_id portions, and the implication as an indented concluding line
- **Section 5 -- Conclusion:** Banner with CheckCircle2 icon, medium-weight normal-color text
- **Footer:** Stats line "Used N of M available data points"

Uses: `Collapsible`/`CollapsibleContent`/`CollapsibleTrigger`, `Badge`, `cn`, lucide icons (`ChevronRight`, `ChevronDown`, `Scale`, `AlertTriangle`, `CheckCircle2`).

### 4. Wire into DealDetailPage (`src/pages/DealDetailPage.tsx`)

Import `ReasoningPanel`. Insert it between the answer div and `EvidencePanel`:

```text
  </div>  (end of answer + copy button wrapper)

  {currentAnswer?.reasoning && (
    <ReasoningPanel reasoning={currentAnswer.reasoning} />
  )}

  <EvidencePanel ... />
```

No other changes to DealDetailPage state, mutations, or callbacks.

## Files summary

| File | Change |
|------|--------|
| `src/types/index.ts` | Add 4 reasoning interfaces, add `reasoning` and `routed_categories` to AskResponse |
| `src/api/client.ts` | Add `show_reasoning: true` to askDealQuestion body |
| `src/components/analysis/ReasoningPanel.tsx` | NEW -- collapsible 5-section reasoning panel |
| `src/pages/DealDetailPage.tsx` | Import and render ReasoningPanel conditionally |

## What does NOT change

- No changes to AnswerDisplay, SourcesPanel, EvidencePanel, QuestionInput, SuggestedQuestions
- No changes to other pages, routing, or backend config
- Panel is invisible when reasoning is null/undefined (backwards compatible)

