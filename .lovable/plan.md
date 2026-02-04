
# Deal Analysis Page with Natural Language Q&A

## Overview

Build a new deal analysis page that focuses on natural language Q&A, allowing users to ask questions about credit agreements and receive AI-generated answers with source citations.

## Current State Analysis

The existing `DealDetailPage.tsx` already has:
- Deal fetching and status polling
- A `DocumentChat` component in the right sidebar for Q&A
- Extracted data display with categories

The request is to create a **new focused Q&A experience** that:
1. Makes Q&A the primary interaction (not a sidebar)
2. Provides rich answer formatting with markdown
3. Shows collapsible source citations
4. Offers suggested questions as prominent chips

## Architecture Decision

**Option A**: Replace `DealDetailPage` with the new design
**Option B**: Create a new route/page alongside the existing detail page

**Recommendation**: Option A - Update the existing route since the new design encompasses and improves upon the current functionality.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/analysis/QuestionInput.tsx` | Large text input with submit button |
| `src/components/analysis/SuggestedQuestions.tsx` | Clickable suggestion chips |
| `src/components/analysis/AnswerDisplay.tsx` | Markdown answer renderer with loading skeleton |
| `src/components/analysis/SourcesPanel.tsx` | Collapsible citations panel |
| `src/components/analysis/AnalysisHeader.tsx` | Page header with back nav and deal info |
| `src/components/analysis/ExtractionPending.tsx` | Extraction in-progress message |

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `AskResponse`, `Citation`, `ExtractedAnswer` types |
| `src/api/client.ts` | Add `askDealQuestion()` function (new endpoint `/ask`) |
| `src/pages/DealDetailPage.tsx` | Replace with new Q&A-focused layout |

---

## Implementation Details

### 1. Type Definitions (`src/types/index.ts`)

Add new types for the `/ask` endpoint:

```typescript
export interface Citation {
  page: number;
  text: string | null;
  question_id: string | null;
}

export interface AskResponse {
  question: string;
  answer: string;
  citations: Citation[];
  data_source: {
    deal_id: string;
    answers_used: number;
    total_questions: number;
  };
}

export interface ExtractedAnswer {
  question_id: string;
  question_text: string;
  answer_type: 'boolean' | 'currency' | 'percentage' | 'number' | 'string' | 'multiselect';
  category_id: string;
  category_name: string;
  value: unknown;
  source_text: string | null;
  source_page: number | null;
  confidence: string | null;
}

export interface AnswersResponse {
  deal_id: string;
  provision_id: string;
  extraction_complete: boolean;
  answer_count: number;
  total_questions: number;
  answers: ExtractedAnswer[];
}
```

### 2. API Client (`src/api/client.ts`)

Add the new ask endpoint (note: uses `/ask` not `/qa`):

```typescript
export async function askDealQuestion(dealId: string, question: string): Promise<AskResponse> {
  return fetchAPI<AskResponse>(`/api/deals/${dealId}/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export async function getAnswers(dealId: string): Promise<AnswersResponse> {
  return fetchAPI<AnswersResponse>(`/api/deals/${dealId}/answers`);
}
```

### 3. QuestionInput Component

Features:
- Large text input with search/send icon
- Spinner during loading
- Clear button when text present
- Enter key submits
- Disabled state during request

```text
┌──────────────────────────────────────────────────────────┐
│ What's the J.Crew risk in this deal?            [Clear] 🔍│
└──────────────────────────────────────────────────────────┘
```

### 4. SuggestedQuestions Component

Render 8 pre-defined questions as clickable chips:
- J.Crew risk
- Builder basket
- Ratio threshold
- Mgmt equity cap
- Unsub risks
- Key exceptions
- Dividend summary
- Cross-references

Features:
- Wrap to multiple rows on narrow screens
- Subtle background with hover effect
- Disabled during loading

### 5. AnswerDisplay Component

Features:
- Parse and render markdown (bold, bullets, symbols)
- Make `[p.XX]` citations visually distinct (pill/badge style)
- Loading skeleton with animated lines
- Fade-in animation on answer arrival

Example rendering:
```text
J.Crew Risk: MODERATE

The agreement contains a J.Crew blocker [p.96] but with
significant gaps:

✓ Covers IP transfers to Unrestricted Subs [p.96]
✓ Covers designation of IP-holding subs [p.96]

⚠ Exception: ordinary course licenses [p.96]
⚠ Only "Material" IP covered [p.15]
```

Uses a simple regex to highlight `[p.XX]` patterns as inline badges.

### 6. SourcesPanel Component

Collapsible accordion showing source citations:

```text
┌─────────────────────────────────────────────────────────┐
│ 📄 Sources (3)                                      ▼   │
├─────────────────────────────────────────────────────────┤
│ [p.96] "No Credit Party shall transfer any Material    │
│         Intellectual Property to any Unrestricted..."   │
│                                                         │
│ [p.15] "'Material Intellectual Property' means any     │
│         Intellectual Property that is material..."      │
└─────────────────────────────────────────────────────────┘
```

Features:
- Collapsible with chevron indicator
- Default collapsed
- Each citation shows page badge + quoted text
- If `text` is null, show "See page {page}"

### 7. AnalysisHeader Component

Simple header with:
- Back arrow + "Back to Deals" link
- Deal name (large)
- Borrower name (smaller, muted)
- Status badge

### 8. ExtractionPending Component

When extraction is in progress:
- Centered spinner
- "Analyzing Agreement" heading
- Current step text
- Progress bar

---

## Updated Page Layout (`DealDetailPage.tsx`)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Back to Deals                           Deal Name     ● Complete       │
│                                           Borrower                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │ 💬 Ask anything about this agreement                               │  │
│  │                                                                    │  │
│  │ ┌──────────────────────────────────────────────────────────────┐  │  │
│  │ │ What's the J.Crew risk in this deal?                     🔍 │  │  │
│  │ └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │ [J.Crew risk] [Builder basket] [Ratio threshold] [Mgmt equity]    │  │
│  │ [Unsub risks] [Key exceptions] [Dividend summary] [Cross-refs]    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        ANSWER DISPLAY                              │  │
│  │                                                                    │  │
│  │  The agreement contains a J.Crew blocker [p.96] but with...       │  │
│  │                                                                    │  │
│  │  ✓ Covers IP transfers to Unrestricted Subs [p.96]                │  │
│  │  ⚠ Exception: ordinary course licenses [p.96]                     │  │
│  │                                                                    │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │ 📄 Sources (3)                                                 ▼  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## State Management

```typescript
// In DealDetailPage.tsx
const [question, setQuestion] = useState('');
const [currentAnswer, setCurrentAnswer] = useState<AskResponse | null>(null);
const [sourcesExpanded, setSourcesExpanded] = useState(false);

const askMutation = useMutation({
  mutationFn: (q: string) => askDealQuestion(dealId!, q),
  onSuccess: (data) => {
    setCurrentAnswer(data);
    setSourcesExpanded(false);
  },
});
```

---

## Technical Considerations

### Markdown Rendering in AnswerDisplay

Use a simple approach without external dependencies:

1. Split answer into lines
2. Apply bold formatting: `**text**` -> `<strong>text</strong>`
3. Highlight citations: `[p.XX]` -> `<span class="citation-badge">p.XX</span>`
4. Detect bullet points (`-`, `•`, `✓`, `⚠`) and render as list items

This keeps the bundle small and avoids adding react-markdown.

### Citation Click Behavior

When user clicks a `[p.XX]` badge in the answer:
1. Expand the Sources panel if collapsed
2. Scroll to that specific citation
3. Briefly highlight it

### Loading States

| State | UI |
|-------|-----|
| Page loading | Full-page skeleton |
| Extraction pending | Centered progress display |
| Question submitting | Input disabled + spinner, skeleton in answer area |
| Error | Toast notification + error message in answer area |

---

## Styling Guidelines

| Element | Style |
|---------|-------|
| Page background | `bg-gray-50` |
| Cards | White with subtle shadow |
| Primary color | Deep navy `#1a1f36` |
| Accent | Teal `#0d9488` for positive |
| Warning | Amber `#f59e0b` for caution |
| Max content width | `max-w-4xl` |
| Question input | `text-lg` |
| Answer text | `text-base`, good line-height |
| Citations | `text-sm`, muted |

---

## Implementation Order

1. Add types to `src/types/index.ts`
2. Add `askDealQuestion` to `src/api/client.ts`
3. Create `AnalysisHeader.tsx`
4. Create `QuestionInput.tsx`
5. Create `SuggestedQuestions.tsx`
6. Create `AnswerDisplay.tsx` with markdown parsing
7. Create `SourcesPanel.tsx` with collapsible accordion
8. Create `ExtractionPending.tsx`
9. Update `DealDetailPage.tsx` to use new components
10. Test loading/error states
11. Polish animations

---

## Testing Checklist

After implementation, verify:

- [ ] Page loads and shows deal name/borrower/status
- [ ] Suggested questions render as clickable chips
- [ ] Clicking a chip fills input and submits automatically
- [ ] Manual question submission works
- [ ] Loading spinner appears during request
- [ ] Answer displays with proper formatting
- [ ] `[p.XX]` citations are highlighted
- [ ] Sources panel expands/collapses
- [ ] Error toast appears on API failure
- [ ] Extraction pending state shows when deal is processing
- [ ] Mobile layout is responsive
