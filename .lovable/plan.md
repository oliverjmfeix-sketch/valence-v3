

# Valence Covenant Intelligence Platform - Complete Redesign

## Executive Summary
Complete redesign of the Valence legal technology platform to create a Bloomberg Terminal meets Notion experience for analyzing credit agreement covenants. This involves updating the design system, restructuring the deal detail page with a three-column layout, adding new API integrations, and implementing specialized answer type components.

---

## Phase 1: Design System Foundation

### 1.1 Update Color Palette
Update `src/index.css` with the new professional color scheme:

```text
Primary (Deep Navy):     #1a1f36 → HSL: 227 37% 16%
Accent (Teal):           #0d9488 → HSL: 175 84% 32%
Warning (Amber):         #f59e0b → HSL: 38 92% 50%
Danger (Red):            #ef4444 → HSL: 0 84% 60%
Success (Green):         #10b981 → HSL: 160 84% 39%
Background:              #ffffff
Surface:                 #f8fafc → HSL: 210 40% 98%
Text:                    #111827 → HSL: 221 39% 11%
```

### 1.2 Add Custom CSS Variables
New semantic colors for the application:
- `--success` for positive states (included concepts, complete)
- `--warning` for moderate risk/pending
- `--info` for informational highlights

---

## Phase 2: Type Definitions

### 2.1 Update `src/types/index.ts`
Add new interfaces to match the backend API:

```text
interface ExtractionStatus {
  deal_id: string
  status: "pending" | "extracting" | "storing" | "complete" | "error"
  progress: number
  current_step: string
  error_message?: string
}

interface RPProvision {
  provision_id: string
  deal_id: string
  // Scalar boolean fields
  general_dividend_prohibition_exists?: boolean
  mgmt_equity_basket_exists?: boolean
  builder_basket_exists?: boolean
  ratio_dividend_basket_exists?: boolean
  jcrew_blocker_exists?: boolean
  // Scalar number fields
  mgmt_equity_annual_cap_usd?: number
  builder_starter_amount_usd?: number
  ratio_leverage_threshold?: number
  // Scalar percentage fields
  builder_cni_addition_pct?: number
  // Multiselect concepts
  concept_applicabilities: ConceptApplicability[]
}

interface ConceptApplicability {
  concept_type: string
  concept_id: string
  concept_name: string
  applicability_status: "INCLUDED" | "EXCLUDED"
  source_text: string
  source_page: number
}

interface OntologyQuestion {
  question_id: string
  question_text: string
  answer_type: "boolean" | "currency" | "percentage" | "number" | "multiselect"
  category_id: string
  category_name: string
}

interface OntologyQuestionsResponse {
  questions: OntologyQuestion[]
}
```

---

## Phase 3: API Client Updates

### 3.1 Update `src/api/client.ts`
Add new endpoints:

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `getRPProvision(dealId)` | GET `/api/deals/{deal_id}/rp-provision` | Fetch extracted answers |
| `getOntologyQuestionsRP()` | GET `/api/ontology/questions/RP` | Fetch RP question schema |
| `getOntologyConcepts()` | GET `/api/ontology/concepts` | Fetch concept definitions |

Update existing:
- Modify `getDealStatus` to return `ExtractionStatus` type
- Update question fetching to use new response format

---

## Phase 4: Component Architecture

### 4.1 New Directory Structure
```text
src/components/
├── deals/
│   ├── DealCard.tsx           (deal list card)
│   ├── DealStatusBadge.tsx    (status indicator)
│   └── ExtractionProgress.tsx (detailed progress view)
├── analysis/
│   ├── CategoryNav.tsx        (left sidebar navigation)
│   ├── CategorySection.tsx    (collapsible category container)
│   ├── BooleanAnswer.tsx      (Yes/No with source)
│   ├── CurrencyAnswer.tsx     ($X,XXX,XXX format)
│   ├── PercentageAnswer.tsx   (XX% format)
│   ├── MultiselectAnswer.tsx  (concept chips)
│   ├── SourceCitation.tsx     (page reference tooltip)
│   └── RiskPatternCard.tsx    (risk detection display)
├── chat/
│   └── DocumentChat.tsx       (redesigned Q&A panel)
└── layout/
    └── Header.tsx             (update styling)
```

### 4.2 Component Details

**CategoryNav.tsx**
- Vertical sidebar showing category list
- Completion indicators (e.g., "5/7 answered")
- Click to scroll/filter to category
- Visual hierarchy with category codes (A, B, C, etc.)

**Answer Type Components**
Each displays:
- The question text
- The extracted value (formatted by type)
- Source citation (page number, hover for quote)

**MultiselectAnswer.tsx**
- Renders concept chips with color coding:
  - Teal/Green chip: INCLUDED
  - Gray chip: Not mentioned
  - Red chip: EXCLUDED
- Hover tooltip shows source text

**RiskPatternCard.tsx**
- Displays risk assessment with severity indicator
- Color-coded: Red (HIGH), Amber (MODERATE), Green (LOW)
- Expandable details section

---

## Phase 5: Page Redesigns

### 5.1 Deals List Page (`src/pages/DealsPage.tsx`)

**Layout Changes:**
- Header section with "Valence" branding and "Upload New Deal" CTA
- Data table for 10+ deals, card grid for fewer
- Each row/card shows: deal_name, borrower, date, status badge

**Status Badges:**
- Pending: Yellow/Amber with clock icon
- Extracting: Blue with spinner
- Complete: Green with checkmark
- Error: Red with alert icon

**Empty State:**
- Large icon, friendly message
- Prominent "Upload Your First Deal" button

### 5.2 Upload Page (`src/pages/UploadPage.tsx`)

Keep existing form structure but enhance:
- Add file size validation (max 50MB)
- Show file name preview after selection
- Enhanced progress states during extraction
- Better error messaging

### 5.3 Deal Detail Page (`src/pages/DealDetailPage.tsx`)

**Three-Column Layout:**
```text
┌─────────────────────────────────────────────────────────────────┐
│  Header: Back button, Deal Name, Status Badge                  │
├────────────┬────────────────────────────────┬───────────────────┤
│  CATEGORY  │  EXTRACTED DATA                │  DOCUMENT CHAT   │
│  NAV       │  (scrollable main content)     │  (sticky panel)  │
│  ~200px    │  ~flex-1                       │  ~320px          │
│            │                                │                  │
│  □ General │  ┌─────────────────────────┐   │  Ask questions   │
│  □ Mgmt    │  │ Question: Answer        │   │  about this      │
│  □ Tax     │  │ Source: p.89            │   │  agreement       │
│  □ Builder │  └─────────────────────────┘   │                  │
│  ...       │                                │  [Input]         │
└────────────┴────────────────────────────────┴───────────────────┘
```

**Left Column - Category Navigation:**
- Sticky sidebar that scrolls with page
- Shows all RP categories with completion status
- Click to jump to section
- Active category highlighted

**Center Column - Extracted Data:**
- Sections grouped by category
- Collapsible category headers
- Answer cards with appropriate formatting
- Pattern Detection section at bottom with risk indicators

**Right Column - Document Chat:**
- Redesigned Q&A interface
- Sticky positioning
- Example questions as chips
- Chat history display
- Source citations in responses

**Extraction Progress State:**
When `status !== "complete"`:
- Full-width progress overlay
- Step-by-step checklist showing:
  - PDF parsed
  - RP content extracted
  - Questions being answered (with count)
  - Storing results
- Progress bar with percentage
- Auto-refresh every 2 seconds

---

## Phase 6: Custom Hooks

### 6.1 New Hooks
```text
src/hooks/
├── useDeals.ts           (fetch deals list with react-query)
├── useDeal.ts            (fetch single deal)
├── useDealStatus.ts      (poll extraction status)
├── useRPProvision.ts     (fetch RP provision data)
└── useOntologyQuestions.ts (fetch question definitions)
```

**useDealStatus.ts**
- Accepts dealId and enabled flag
- Polls every 2 seconds when status is "extracting" or "pending"
- Stops polling on "complete" or "error"
- Returns status, progress, currentStep

---

## Phase 7: Implementation Order

### Sprint 1: Foundation (Files: 5-6)
1. Update `src/index.css` with new color system
2. Update `src/types/index.ts` with all new interfaces
3. Update `src/api/client.ts` with new endpoints
4. Create `src/components/deals/DealStatusBadge.tsx`

### Sprint 2: Deals List (Files: 2-3)
5. Update `src/pages/DealsPage.tsx` with new design
6. Create `src/components/deals/DealCard.tsx` (optional for card view)

### Sprint 3: Deal Detail - Structure (Files: 4-5)
7. Create `src/components/analysis/CategoryNav.tsx`
8. Create `src/components/analysis/SourceCitation.tsx`
9. Update `src/pages/DealDetailPage.tsx` with three-column layout
10. Create `src/hooks/useRPProvision.ts`

### Sprint 4: Answer Components (Files: 5)
11. Create `src/components/analysis/BooleanAnswer.tsx`
12. Create `src/components/analysis/CurrencyAnswer.tsx`
13. Create `src/components/analysis/PercentageAnswer.tsx`
14. Create `src/components/analysis/MultiselectAnswer.tsx`
15. Create `src/components/analysis/CategorySection.tsx`

### Sprint 5: Special Features (Files: 3-4)
16. Create `src/components/analysis/RiskPatternCard.tsx`
17. Create `src/components/deals/ExtractionProgress.tsx`
18. Update `src/components/chat/DocumentChat.tsx` (or update QAInterface)

### Sprint 6: Polish (Files: 2-3)
19. Update `src/components/layout/Header.tsx` with refined styling
20. Add loading skeletons across components
21. Test and fix edge cases

---

## Technical Notes

### API Response Mapping
The RP Provision response maps scalar fields directly to properties:
```text
provision.general_dividend_prohibition_exists → boolean
provision.builder_starter_amount_usd → number (currency)
provision.builder_cni_addition_pct → number (percentage)
```

Multiselect values come from `concept_applicabilities` array, filtered by `concept_type`:
```text
provision.concept_applicabilities.filter(ca => ca.concept_type === 'covered_person')
```

### Question-to-Answer Mapping
Questions from `/api/ontology/questions/RP` define:
- `question_id` → maps to provision field name
- `answer_type` → determines which answer component to use
- `category_name` → groups questions in UI

### Responsive Considerations
- Desktop-first design (primary use case)
- On tablet: collapse left sidebar to icons
- On mobile: stack columns vertically, chat becomes expandable drawer

---

## Files to Create/Modify

| Action | File Path |
|--------|-----------|
| Modify | `src/index.css` |
| Modify | `src/types/index.ts` |
| Modify | `src/api/client.ts` |
| Create | `src/components/deals/DealStatusBadge.tsx` |
| Create | `src/components/deals/DealCard.tsx` |
| Create | `src/components/deals/ExtractionProgress.tsx` |
| Create | `src/components/analysis/CategoryNav.tsx` |
| Create | `src/components/analysis/CategorySection.tsx` |
| Create | `src/components/analysis/BooleanAnswer.tsx` |
| Create | `src/components/analysis/CurrencyAnswer.tsx` |
| Create | `src/components/analysis/PercentageAnswer.tsx` |
| Create | `src/components/analysis/MultiselectAnswer.tsx` |
| Create | `src/components/analysis/SourceCitation.tsx` |
| Create | `src/components/analysis/RiskPatternCard.tsx` |
| Create | `src/components/chat/DocumentChat.tsx` |
| Create | `src/hooks/useRPProvision.ts` |
| Create | `src/hooks/useDealStatus.ts` |
| Modify | `src/pages/DealsPage.tsx` |
| Modify | `src/pages/DealDetailPage.tsx` |
| Modify | `src/pages/UploadPage.tsx` |
| Modify | `src/components/layout/Header.tsx` |
| Remove | `src/components/OntologyBrowser/*` (replaced by analysis components) |

**Total: ~20 files** (10 new, 8 modified, 1 directory removal)

