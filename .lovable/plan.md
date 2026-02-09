

# Frontend Migration: Flat Attributes to Question-Keyed Answers

## SSoT Rules for the Frontend

These are the most important guardrails. All implementation must follow them:

1. **Question text comes from the backend.** Never hardcode question display names in the frontend. Use `answer.question_text`.
2. **Category names come from the backend.** Never hardcode category display names. Use `answer.category_name`.
3. **Entity types come from `src/types/mfn.generated.ts`.** Never redefine basket, blocker, or pathway interfaces -- import them from the generated file.
4. **The answers endpoint is the single source for extracted data.** No secondary endpoints, no local derivation.

---

## About `src/types/mfn.generated.ts`

This file will be created from the user-provided content. It is auto-generated from the backend TypeDB schema and contains all Channel 3 entity type interfaces (baskets, blockers, pathways, etc.), as well as the canonical `ConceptApplicability`, `ProvisionAnswer`, `RPProvision`, and `MFNProvision` types.

- **Never manually edit it** -- it is auto-generated.
- **Never duplicate its types elsewhere** -- always import from `@/types/mfn.generated`.
- The `ConceptApplicability` type in `mfn.generated.ts` supersedes the one in `src/types/index.ts`.

---

## What Changes

The backend no longer returns flat scalar fields on the provision. ALL extracted values come from `GET /api/deals/{deal_id}/answers` as an array of `ExtractedAnswer` objects. The provision only carries metadata and 3 pattern detection flags.

**Before:** `getRPProvision()` returned `{ builder_basket_exists: true, ratio_leverage_threshold: 5.75, ... }`

**After:** `getAnswers()` returns `{ answers: [{ question_id: "rp_f1", question_text: "Does a builder basket exist?", value: true, ... }], total_questions: 91, ... }`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/mfn.generated.ts` | Auto-generated TypeDB schema types (from user-provided content) |

## Files to Modify

| File | Change |
|------|--------|
| `src/api/client.ts` | Update `API_URL`, remove 7 dead functions, clean imports |
| `src/types/index.ts` | Slim `RPProvision`, remove 7 unused types, remove duplicate `ConceptApplicability` |
| `src/hooks/useRPProvision.ts` | Full rewrite to answers-based hooks |
| `src/components/analysis/CategorySection.tsx` | Accept `ExtractedAnswer[]` instead of `OntologyQuestion[] + RPProvision` |
| `src/components/analysis/MultiselectAnswer.tsx` | Import `ConceptApplicability` from `mfn.generated` instead of `@/types` |

## Files to Delete (dead code that will cause TS errors after type cleanup)

| File | Reason |
|------|--------|
| `src/components/OntologyBrowser/CategoryTabs.tsx` | Uses removed `OntologyQuestion`/`DealAnswer` types |
| `src/components/OntologyBrowser/QuestionList.tsx` | Same |
| `src/components/OntologyBrowser/QuestionRow.tsx` | Same |
| `src/components/OntologyBrowser/SearchFilter.tsx` | Same |
| `src/components/OntologyBrowser/index.tsx` | Same |
| `src/components/chat/DocumentChat.tsx` | Uses removed `askQuestion` function and `QAResponse` type |
| `src/components/QAInterface.tsx` | Uses removed `askQuestion` function and `QAResponse` type |
| `src/components/ProvenancePanel.tsx` | Uses removed `getProvenance` function |

## Files NOT Changed

| File | Reason |
|------|--------|
| `src/pages/DealDetailPage.tsx` | Already uses Q&A interface with `askDealQuestion`; no extracted data rendering |
| `src/components/analysis/BooleanAnswer.tsx` | Already accepts `questionText`, `value`, `sourceText`, `sourcePage` |
| `src/components/analysis/CurrencyAnswer.tsx` | Already accepts `questionText`, `value`, `sourceText`, `sourcePage` |
| `src/components/analysis/PercentageAnswer.tsx` | Already accepts `questionText`, `value`, `sourceText`, `sourcePage` |
| `src/components/analysis/SourceCitation.tsx` | No type dependencies on removed types |
| `src/components/analysis/RiskPatternCard.tsx` | Standalone component, no removed type dependencies |
| `src/components/analysis/CategoryNav.tsx` | Uses `Category` from `@/types` which is kept |
| `src/App.tsx` | Routes unchanged |
| `src/pages/DealsPage.tsx` | Uses only `Deal`, `DealStatus` -- unaffected |
| `src/pages/UploadPage.tsx` | Uses only `UploadStatus`, `DealStatus` -- unaffected |

---

## Implementation Details

### 1. Create `src/types/mfn.generated.ts`

Write the file with the exact content provided by the user. This defines:
- `Provenance`, `ProvisionAnswer`, `ProvisionAnswerMap`
- `ConceptApplicability` (canonical version, replaces the one in `index.ts`)
- All concept type unions (`MFNConceptType`, `RPConceptType`, etc.)
- All Channel 3 entities (`BuilderBasket`, `RatioBasket`, `JCrewBlocker`, etc.)
- `RPProvision` and `MFNProvision` (pure anchor types)
- `OntologyQuestion` and `OntologyCategory`
- `RPExtractionV4`

### 2. Update `src/api/client.ts`

**Change `API_URL`:**
```
https://valencev3-production.up.railway.app
```
to:
```
https://mfnnavigatorbackend-production.up.railway.app
```

**Remove these functions** (dead code, endpoints no longer exist or are replaced):
- `getRPProvision()` -- provision no longer carries extracted data
- `getOntologyQuestionsRP()` -- questions come from the answers endpoint
- `getOntologyConcepts()` -- not used
- `getOntologyQuestions()` -- legacy wrapper
- `askQuestion()` -- legacy `/qa` endpoint, replaced by `askDealQuestion`
- `getProvenance()` -- not used by current UI
- `getDealAnswers()` -- duplicate of `getAnswers()` with wrong return type

**Clean up imports** at the top to only import types still used: `Deal`, `DealStatus`, `UploadResponse`, `AskResponse`, `AnswersResponse`.

**Keep:** `getDeals`, `getDeal`, `uploadDeal`, `getDealStatus`, `askDealQuestion`, `getAnswers`, `deleteDeal`, `healthCheck`, `getDealStatusesBatch`.

### 3. Simplify `src/types/index.ts`

**Slim `RPProvision`** -- remove all 30+ flat extracted attributes, the `ConceptApplicability` type, and the index signature. The canonical `RPProvision` now lives in `mfn.generated.ts`; this file keeps a minimal version for the answers-based flow:

```typescript
// Remove entirely:
// - RPProvision (now in mfn.generated.ts)
// - ConceptApplicability (now in mfn.generated.ts)  
// - OntologyQuestion
// - OntologyQuestionsResponse
// - OntologyConcept
// - OntologyConceptsResponse
// - QAResponse
// - Provenance (replaced by mfn.generated Provenance)
// - DealAnswer

// Keep:
// - Deal, DealStatus, UploadStatus, UploadResponse
// - Category
// - Citation, AskResponse
// - ExtractedAnswer, AnswersResponse
```

### 4. Rewrite `src/hooks/useRPProvision.ts`

Replace the entire file with answers-based hooks:

```typescript
import { useQuery } from '@tanstack/react-query';
import { getAnswers } from '@/api/client';
import type { ExtractedAnswer, AnswersResponse, Category } from '@/types';

// Fetch all answers for a deal
export function useRPAnswers(dealId: string | undefined) {
  return useQuery<AnswersResponse>({
    queryKey: ['rp-answers', dealId],
    queryFn: () => getAnswers(dealId!),
    enabled: !!dealId,
  });
}

// Lookup a single answer by question_id
export function getAnswerByQuestionId(
  answers: ExtractedAnswer[] | undefined,
  questionId: string
): { value: unknown; hasAnswer: boolean; sourceText?: string; sourcePage?: number } {
  if (!answers) return { value: undefined, hasAnswer: false };
  const answer = answers.find(a => a.question_id === questionId);
  if (!answer || answer.value === null || answer.value === undefined) {
    return { value: undefined, hasAnswer: false };
  }
  return {
    value: answer.value,
    hasAnswer: true,
    sourceText: answer.source_text ?? undefined,
    sourcePage: answer.source_page ?? undefined,
  };
}

// Group answers into Category[] for display
export function groupAnswersByCategory(answers: ExtractedAnswer[]): {
  categories: Category[];
  answersByCategory: Map<string, ExtractedAnswer[]>;
} {
  const categoryMap = new Map<string, { name: string; answers: ExtractedAnswer[] }>();
  for (const answer of answers) {
    if (!categoryMap.has(answer.category_id)) {
      categoryMap.set(answer.category_id, { name: answer.category_name, answers: [] });
    }
    categoryMap.get(answer.category_id)!.answers.push(answer);
  }

  const categories: Category[] = Array.from(categoryMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    code: id,
    questionCount: data.answers.length,
    answeredCount: data.answers.filter(a => a.value !== null && a.value !== undefined).length,
  }));
  categories.sort((a, b) => a.code.localeCompare(b.code));

  const answersByCategory = new Map<string, ExtractedAnswer[]>();
  for (const [id, data] of categoryMap) {
    answersByCategory.set(id, data.answers);
  }
  return { categories, answersByCategory };
}
```

### 5. Update `src/components/analysis/CategorySection.tsx`

Change the props interface:

**Before:**
```typescript
interface CategorySectionProps {
  questions: OntologyQuestion[];
  provision: RPProvision | undefined;
  // ...
}
```

**After:**
```typescript
interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  answers: ExtractedAnswer[];  // Each has question_text, value, answer_type, source_text, source_page
  defaultOpen?: boolean;
  className?: string;
}
```

Inside the component:
- Count answered: `answers.filter(a => a.value !== null && a.value !== undefined).length`
- Iterate over `answers` (not `questions`)
- Read `answer.question_text` for display (SSoT rule 1)
- Read `answer.value` directly, cast per `answer.answer_type`
- Pass `answer.source_text` and `answer.source_page` to `BooleanAnswer`, `CurrencyAnswer`, `PercentageAnswer`
- For `multiselect`: cast `answer.value` to `ConceptApplicability[]` (imported from `mfn.generated`)
- Remove imports of `OntologyQuestion`, `RPProvision`, `getAnswerForQuestion`

### 6. Update `src/components/analysis/MultiselectAnswer.tsx`

Change the import of `ConceptApplicability` from `@/types` to `@/types/mfn.generated`:

```typescript
import type { ConceptApplicability } from '@/types/mfn.generated';
```

The component interface and rendering logic remain the same -- `ConceptApplicability` in `mfn.generated.ts` has the same shape (with `name` instead of `concept_name`, and optional fields instead of required ones). Update the `ConceptChip` component to handle the field name difference: use `concept.name` (from `mfn.generated`) instead of `concept.concept_name` (from old type).

### 7. Delete Dead Code Files

These files import removed types/functions and are not used by any active page:

- `src/components/OntologyBrowser/` (entire directory -- 5 files)
- `src/components/chat/DocumentChat.tsx` -- uses `askQuestion` + `QAResponse`
- `src/components/QAInterface.tsx` -- uses `askQuestion` + `QAResponse`
- `src/components/ProvenancePanel.tsx` -- uses `getProvenance`

---

## Implementation Order

1. Create `src/types/mfn.generated.ts` (the new canonical types file)
2. Update `src/types/index.ts` (slim down, remove duplicates)
3. Update `src/api/client.ts` (new URL, remove dead functions, clean imports)
4. Rewrite `src/hooks/useRPProvision.ts` (answers-based hooks)
5. Update `src/components/analysis/MultiselectAnswer.tsx` (new import path)
6. Update `src/components/analysis/CategorySection.tsx` (new props, direct answer reads)
7. Delete dead code files (OntologyBrowser/*, DocumentChat, QAInterface, ProvenancePanel)
8. Verify build compiles cleanly

---

## ConceptApplicability: Field Name Difference

The old type in `index.ts` used `concept_name: string` (required).
The new type in `mfn.generated.ts` uses `name?: string` (optional).

The `MultiselectAnswer` component's `ConceptChip` currently reads `concept.concept_name`. This needs to change to `concept.name ?? concept.concept_id` to handle the new shape and the optional nature of `name`.

---

## Testing Checklist

After implementation, verify:
- The deals list page loads with the new backend URL
- Clicking into a deal shows the Q&A interface
- Asking a question returns an answer with citations
- No TypeScript compilation errors
- The copy Q&A button still works
- `CategorySection` renders correctly when given `ExtractedAnswer[]` (verifiable when category browsing is wired into the page)

Here is the mfn.generated.ts file content: 

// ============================================================================
// AUTO-GENERATED FROM TYPEDB SCHEMA (schema_unified.tql)
// DO NOT EDIT MANUALLY
//
// Generated: 2026-02-07
// Schema version: 3.0.0
//
// Architecture: Provisions are PURE ANCHORS (zero extracted values).
// Three data channels:
//   Channel 1: provision_has_answer    → scalar  (boolean, number, string)
//   Channel 2: concept_applicability   → multiselect (closed set from seed)
//   Channel 3: typed entities          → structured (variable-length)
// ============================================================================

// ============================================================================
// PROVENANCE
// ============================================================================

export type Confidence = 'high' | 'medium' | 'low';

export interface Provenance {
  section_reference?: string;
  source_text?: string;
  source_page?: number;
  source_section?: string;
  confidence?: Confidence;
  extracted_at?: string;
}

// ============================================================================
// CHANNEL 1: SCALAR ANSWERS (provision_has_answer relation)
//
// THE canonical store for all scalar extracted values.
// One relation instance per (provision, question) pair.
// ============================================================================

export interface ProvisionAnswer {
  answer_id: string;
  question_id: string;
  answer_boolean?: boolean;
  answer_integer?: number;
  answer_double?: number;
  answer_string?: string;
  answer_date?: string;
  source_text?: string;
  source_page?: number;
  source_section?: string;
  confidence?: Confidence;
  extracted_at?: string;
}

export type AnswerType =
  | 'boolean'
  | 'integer'
  | 'double'
  | 'percentage'
  | 'currency'
  | 'string'
  | 'number'
  | 'multiselect'
  | 'entity';

export type CovenantType = 'MFN' | 'RP';

/** Map of question_id → typed answer for a single provision */
export interface ProvisionAnswerMap {
  [questionId: string]: ProvisionAnswer;
}

// ============================================================================
// CHANNEL 2: CONCEPT TYPES (concept_applicability relation)
// ============================================================================

export type ApplicabilityStatus = 'INCLUDED' | 'EXCLUDED';

// MFN concept types
export type MFNConceptType =
  | 'facility_prong'
  | 'yield_component'
  | 'fee_exclusion'
  | 'lien_priority'
  | 'governance_concept'
  | 'sunset_type'
  | 'covered_person'
  | 'repurchase_trigger'
  | 'loophole_type'
  | 'protection_type';

// RP concept types
export type RPConceptType =
  | 'dividend_definition_element'
  | 'ip_type'
  | 'transfer_type'
  | 'blocker_binding_entity'
  | 'blocker_timing'
  | 'investment_basket'
  | 'default_type'
  | 'reallocation_target';

// RP expanded concept types
export type RPExpandedConceptType =
  | 'builder_reduction_type'
  | 'intercompany_recipient_type'
  | 'tax_group_type'
  | 'overhead_cost_type'
  | 'transaction_cost_type'
  | 'equity_award_type'
  | 'rdp_payment_type'
  | 'reallocation_reduction_type'
  | 'exempt_sale_type'
  | 'unsub_distribution_condition'
  | 'ratio_required_basket'
  | 'no_default_basket';

export type ConceptType = MFNConceptType | RPConceptType | RPExpandedConceptType;

export interface ConceptApplicability {
  concept_id: string;
  name?: string;
  applicability_status: ApplicabilityStatus;
  source_text?: string;
  source_page?: number;
  source_section?: string;
  confidence?: Confidence;
}

// ============================================================================
// CHANNEL 3: EXTRACTED ENTITIES
// ============================================================================

// ── Shared provenance fields (inherited by all extracted entities) ────────

interface EntityProvenance {
  section_reference?: string;
  source_page?: number;
  source_text?: string;
  confidence?: Confidence;
}

// ────────────────────────────────────────────────────────────────────────────
// RP BASKETS (7 subtypes of rp_basket → provision_has_basket)
// ────────────────────────────────────────────────────────────────────────────

export type DefaultCondition =
  | 'any_default'
  | 'payment_default_only'
  | 'specified_defaults'
  | 'none';

export interface RPBasketBase extends EntityProvenance {
  basket_id: string;
  default_condition?: DefaultCondition;
}

/** Builder Basket (Available Amount / Cumulative Amount) */
export interface BuilderBasket extends RPBasketBase {
  start_date_language?: string;
  uses_greatest_of_tests?: boolean;
  sources?: BuilderBasketSource[];
}

/** Ratio Basket — unlimited dividends if leverage ratio meets threshold */
export interface RatioBasket extends RPBasketBase {
  ratio_threshold?: number;
  ratio_type?: string;
  is_unlimited_if_met?: boolean;
  has_no_worse_test?: boolean;
  no_worse_threshold?: number;
  test_date_type?: string;
  lct_treatment_available?: boolean;
  pro_forma_basis?: boolean;
}

/** General RP Basket — fixed dollar basket */
export interface GeneralRPBasket extends RPBasketBase {
  basket_amount_usd?: number;
  basket_grower_pct?: number;
  is_per_annum?: boolean;
}

/** Management Equity Basket — repurchasing management/employee equity */
export interface ManagementEquityBasket extends RPBasketBase {
  annual_cap_usd?: number;
  annual_cap_pct_ebitda?: number;
  cap_uses_greater_of?: boolean;
  carryforward_permitted?: boolean;
  carryforward_max_years?: number;
  eligible_person_scope?: string;
}

/** Tax Distribution Basket — pass-through entity tax payments */
export interface TaxDistributionBasket extends RPBasketBase {
  standalone_taxpayer_limit?: boolean;
  hypothetical_tax_rate?: number;
  tax_sharing_permitted?: boolean;
  estimated_taxes_permitted?: boolean;
}

/** Holdco Overhead Basket — distributions for holding company expenses */
export interface HoldcoOverheadBasket extends RPBasketBase {
  annual_cap_usd?: number;
  covers_management_fees?: boolean;
  covers_admin_expenses?: boolean;
  covers_franchise_taxes?: boolean;
  management_fee_recipient_scope?: string;
  requires_arms_length?: boolean;
  requires_board_approval?: boolean;
}

/** Equity Award Basket — equity award settlement payments */
export interface EquityAwardBasket extends RPBasketBase {
  annual_cap_usd?: number;
  covers_cashless_exercise?: boolean;
  covers_tax_withholding?: boolean;
  carryforward_permitted?: boolean;
}

export type RPBasketType =
  | BuilderBasket
  | RatioBasket
  | GeneralRPBasket
  | ManagementEquityBasket
  | TaxDistributionBasket
  | HoldcoOverheadBasket
  | EquityAwardBasket;

// ────────────────────────────────────────────────────────────────────────────
// BUILDER BASKET SOURCES (8 polymorphic subtypes → basket_has_source)
// ────────────────────────────────────────────────────────────────────────────

export type BuilderSourceType =
  | 'starter_amount'
  | 'cni'
  | 'ecf'
  | 'ebitda_fc'
  | 'equity_proceeds'
  | 'investment_returns'
  | 'asset_proceeds'
  | 'debt_conversion';

export interface BuilderBasketSourceBase extends EntityProvenance {
  source_id: string;
  source_type: BuilderSourceType;
  not_otherwise_applied?: boolean;
}

export interface StarterAmountSource extends BuilderBasketSourceBase {
  source_type: 'starter_amount';
  dollar_amount?: number;
  ebitda_percentage?: number;
  uses_greater_of?: boolean;
}

export interface CNISource extends BuilderBasketSourceBase {
  source_type: 'cni';
  percentage?: number;
  is_primary_test?: boolean;
}

export interface ECFSource extends BuilderBasketSourceBase {
  source_type: 'ecf';
  retained_ecf_formula?: string;
  lookback_period?: string;
  lookback_quarters?: number;
}

export interface EBITDAFCSource extends BuilderBasketSourceBase {
  source_type: 'ebitda_fc';
  fc_multiplier?: number;
}

export interface EquityProceedsSource extends BuilderBasketSourceBase {
  source_type: 'equity_proceeds';
  percentage?: number;
  excludes_cure_contributions?: boolean;
  excludes_disqualified_stock?: boolean;
}

export interface InvestmentReturnsSource extends BuilderBasketSourceBase {
  source_type: 'investment_returns';
}

export interface AssetProceedsSource extends BuilderBasketSourceBase {
  source_type: 'asset_proceeds';
  percentage?: number;
}

export interface DebtConversionSource extends BuilderBasketSourceBase {
  source_type: 'debt_conversion';
}

export type BuilderBasketSource =
  | StarterAmountSource
  | CNISource
  | ECFSource
  | EBITDAFCSource
  | EquityProceedsSource
  | InvestmentReturnsSource
  | AssetProceedsSource
  | DebtConversionSource;

// ────────────────────────────────────────────────────────────────────────────
// RDP BASKETS (5 subtypes of rdp_basket → provision_has_rdp_basket)
// Restricted Debt Payments — SEPARATE hierarchy from RP baskets
// ────────────────────────────────────────────────────────────────────────────

export interface RDPBasketBase extends EntityProvenance {
  basket_id: string;
  default_condition?: DefaultCondition;
}

/** Refinancing RDP — prepay junior debt with new debt at same/lower priority */
export interface RefinancingRDPBasket extends RDPBasketBase {
  requires_same_or_lower_priority?: boolean;
  requires_same_or_later_maturity?: boolean;
  requires_no_increase_in_principal?: boolean;
  permits_refinancing_with_equity?: boolean;
  requires_qualified_stock_only?: boolean;
  not_otherwise_applied?: boolean;
  subject_to_intercreditor?: boolean;
}

/** General RDP — fixed dollar basket for general RDP capacity */
export interface GeneralRDPBasket extends RDPBasketBase {
  basket_amount_usd?: number;
  basket_grower_pct?: number;
}

/** Ratio RDP — leverage test unlocks unlimited RDP */
export interface RatioRDPBasket extends RDPBasketBase {
  ratio_threshold?: number;
  ratio_type?: string;
  is_unlimited_if_met?: boolean;
  test_date_type?: string;
  pro_forma_basis?: boolean;
  uses_closing_ratio_alternative?: boolean;
}

/** Builder RDP — cumulative amount basket, may share with RP builder */
export interface BuilderRDPBasket extends RDPBasketBase {
  shares_with_rp_builder?: boolean;
  subject_to_intercreditor?: boolean;
}

/** Equity-Funded RDP — RDP funded by fresh equity contributions */
export interface EquityFundedRDPBasket extends RDPBasketBase {
  requires_qualified_stock_only?: boolean;
  requires_cash_common_equity?: boolean;
  not_otherwise_applied?: boolean;
}

export type RDPBasketType =
  | RefinancingRDPBasket
  | GeneralRDPBasket
  | RatioRDPBasket
  | BuilderRDPBasket
  | EquityFundedRDPBasket;

// ────────────────────────────────────────────────────────────────────────────
// SWEEP TIERS (variable-length → provision_has_sweep_tier)
// ────────────────────────────────────────────────────────────────────────────

export interface SweepTier extends EntityProvenance {
  tier_id: string;
  leverage_threshold: number;
  sweep_percentage: number;
  is_highest_tier?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// J.CREW BLOCKER + EXCEPTIONS (provision_has_blocker, blocker_has_exception)
// ────────────────────────────────────────────────────────────────────────────

export type BlockerExceptionType =
  | 'nonexclusive_license_exception'
  | 'intercompany_exception'
  | 'immaterial_ip_exception'
  | 'fair_value_exception'
  | 'ordinary_course_exception';

export interface BlockerException extends EntityProvenance {
  exception_id: string;
  exception_type: BlockerExceptionType;
  scope_limitation?: string;
}

export interface JCrewBlocker extends EntityProvenance {
  blocker_id: string;
  covers_transfer?: boolean;
  covers_designation?: boolean;
  covers_ip?: boolean;
  covers_material_assets?: boolean;
  covers_exclusive_licensing?: boolean;
  covers_nonexclusive_licensing?: boolean;
  covers_pledge?: boolean;
  covers_abandonment?: boolean;
  binds_loan_parties?: boolean;
  binds_restricted_subs?: boolean;
  is_sacred_right?: boolean;
  exceptions?: BlockerException[];
}

// ────────────────────────────────────────────────────────────────────────────
// UNRESTRICTED SUBSIDIARY DESIGNATION (provision_has_unsub)
// ────────────────────────────────────────────────────────────────────────────

export interface UnsubDesignation extends EntityProvenance {
  designation_id: string;
  requires_no_default?: boolean;
  requires_board_approval?: boolean;
  dollar_cap_usd?: number;
  pct_cap_assets?: number;
  redesignation_permitted?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// DE MINIMIS THRESHOLDS (provision_has_de_minimis)
// ────────────────────────────────────────────────────────────────────────────

export interface DeMinimisThreshold extends EntityProvenance {
  threshold_id: string;
  threshold_type?: 'individual' | 'annual';
  threshold_amount_usd?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// BASKET REALLOCATION (provision_has_reallocation)
// ────────────────────────────────────────────────────────────────────────────

export interface BasketReallocation extends EntityProvenance {
  reallocation_id: string;
  reallocation_source?: string;
  reallocation_amount_usd?: number;
  is_bidirectional?: boolean;
  reduces_source_basket?: boolean;
  reduction_is_dollar_for_dollar?: boolean;
  reduction_while_outstanding_only?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// INVESTMENT PATHWAYS (provision_has_pathway)
//
// J.Crew chain analysis: LP → Non-Guarantor RS → Unsub
// Graph traversal detects open chains that flat booleans cannot.
// ────────────────────────────────────────────────────────────────────────────

export interface InvestmentPathway extends EntityProvenance {
  pathway_id: string;
  pathway_source_type: string;
  pathway_target_type: string;
  cap_dollar_usd?: number;
  cap_pct_total_assets?: number;
  cap_uses_greater_of?: boolean;
  is_uncapped?: boolean;
  can_stack_with_other_baskets?: boolean;
}

// ============================================================================
// QUALIFICATION & CITATION
// ============================================================================

export type QualificationType =
  | 'exception'
  | 'condition'
  | 'threshold'
  | 'scope_limitation';

export interface Qualification {
  qualification_id: string;
  qualification_type: QualificationType;
  description?: string;
  source_text?: string;
  source_page?: number;
}

export type CitationContext = 'definition' | 'covenant' | 'exception';

export interface SourceCitation {
  citation_id: string;
  source_text?: string;
  source_page?: number;
  citation_context?: CitationContext;
}

export type CrossReferenceType =
  | 'limited_by'
  | 'enhanced_by'
  | 'depends_on'
  | 'conflicts_with';

export interface ProvisionCrossReference {
  source_provision_id: string;
  target_provision_id: string;
  cross_reference_type: CrossReferenceType;
  cross_reference_explanation?: string;
  source_text?: string;
  source_page?: number;
}

// ============================================================================
// PROVISION TYPES (Pure Anchors)
//
// Provisions own ZERO extracted values. Only identity + computed pattern flags.
// All extracted data accessed via the three channels.
// ============================================================================

export interface ProvisionBase {
  provision_id: string;
  section_reference?: string;
  source_page?: number;
  extracted_at?: string;
}

export interface MFNProvision extends ProvisionBase {
  yield_exclusion_pattern_detected?: boolean;
  answers?: ProvisionAnswerMap;
  applicabilities?: Record<string, ConceptApplicability[]>;
}

export interface RPProvision extends ProvisionBase {
  jcrew_pattern_detected?: boolean;
  serta_pattern_detected?: boolean;
  collateral_leakage_pattern_detected?: boolean;
  answers?: ProvisionAnswerMap;
  applicabilities?: Record<string, ConceptApplicability[]>;
  // Channel 3 entities
  baskets?: RPBasketType[];
  rdp_baskets?: RDPBasketType[];
  blocker?: JCrewBlocker;
  unsub_designation?: UnsubDesignation;
  sweep_tiers?: SweepTier[];
  de_minimis_thresholds?: DeMinimisThreshold[];
  reallocations?: BasketReallocation[];
  investment_pathways?: InvestmentPathway[];
}

// ============================================================================
// DEAL
// ============================================================================

export interface Deal {
  deal_id: string;
  deal_name?: string;
  borrower_name?: string;
  deal_date?: string;
  deal_amount?: number;
  deal_currency?: string;
  deal_type?: string;
  facility_type?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// ONTOLOGY
// ============================================================================

export interface OntologyQuestion {
  question_id: string;
  question_number: number;
  question_text: string;
  description?: string;
  answer_type: AnswerType;
  ui_display_type?: string;
  is_required?: boolean;
  default_value?: string;
  display_order?: number;
  covenant_type: CovenantType;
  extraction_prompt?: string;
}

export interface OntologyCategory {
  category_id: string;
  name: string;
  description?: string;
  display_order: number;
  questions?: OntologyQuestion[];
}

// ============================================================================
// RP EXTRACTION OUTPUT (matches extraction_output_v4.py)
// ============================================================================

export interface RPExtractionV4 {
  // RP Baskets (7 subtypes)
  builder_basket?: BuilderBasket;
  ratio_basket?: RatioBasket;
  general_rp_basket?: GeneralRPBasket;
  management_equity_basket?: ManagementEquityBasket;
  tax_distribution_basket?: TaxDistributionBasket;
  holdco_overhead_basket?: HoldcoOverheadBasket;
  equity_award_basket?: EquityAwardBasket;
  // J.Crew Blocker
  jcrew_blocker?: JCrewBlocker;
  // Unrestricted Subsidiary
  unsub_designation?: UnsubDesignation;
  // Sweep & Prepayment
  sweep_tiers?: SweepTier[];
  de_minimis_thresholds?: DeMinimisThreshold[];
  // Reallocation
  reallocations?: BasketReallocation[];
  // RDP Baskets (5 subtypes — separate hierarchy)
  refinancing_rdp_basket?: RefinancingRDPBasket;
  general_rdp_basket?: GeneralRDPBasket;
  ratio_rdp_basket?: RatioRDPBasket;
  builder_rdp_basket?: BuilderRDPBasket;
  equity_funded_rdp_basket?: EquityFundedRDPBasket;
  // Investment Pathways
  investment_pathways?: InvestmentPathway[];
  // Metadata
  extraction_version?: string;
  extraction_confidence?: Confidence;
}

