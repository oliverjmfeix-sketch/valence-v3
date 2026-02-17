# Fix Frontend-Backend Connection Mismatches

## Overview

Five targeted fixes to align frontend types and API calls with what the backend actually returns. No refactors, no new features -- just correcting mismatches.

## Changes

### Issue 1: Fix AskResponse.data_source field names (HIGH)

**File: `src/types/index.ts**`

Update `AskResponse` to match backend response:

- `answers_used` becomes `scalar_answers`
- `total_questions` becomes `multiselect_answers`
- Add optional `covenant_type` and `model` fields

No component references `data_source.answers_used` or `data_source.total_questions` directly, so this is a type-only fix with no downstream UI changes needed.

### Issue 2: Fix getDealStatusesBatch to call Railway directly (HIGH)

**File: `src/api/client.ts**`

Replace the Supabase edge function proxy call with direct Railway calls using the existing `getDealStatus` function. Fetch in parallel with a concurrency limit of 5. On individual failure, return a fallback `pending` status instead of failing the whole batch.

Remove the `SUPABASE_URL` import since it's no longer needed in this file.

The Supabase edge function `supabase/functions/deal-statuses/index.ts` becomes unused but will not be deleted in this change (can be cleaned up separately).

### Issue 3: Make AnswersResponse.provision_id optional (MEDIUM)

**File: `src/types/index.ts**`

Change `provision_id: string` to `provision_id?: string`. No components reference this field, so no downstream changes needed.

### Issue 4: Add missing fields to Deal type (MEDIUM)

**File: `src/types/index.ts**`

Add optional fields the backend returns on the detail endpoint:

- `answers?: Record<string, any>` -- RP answers dict
- `applicabilities?: Record<string, any>`
- Expand `mfn_provision` to include optional `answers` dict

### Issue 5: Load eval categories from backend (MEDIUM)

**File: `src/api/client.ts**`

Add a `getOntologyCategories` function that calls `GET /api/ontology/categories`. The `OntologyCategory` type already exists in `src/types/mfn.generated.ts`.

When mapping backend categories to eval chips, check whether the eval endpoint expects the raw `category_id` from TypeDB or a shortened version. If the backend eval function strips the `rp_` prefix internally, pass the full ID. If not, the mapping may need a prefix strip: `c.category_id.replace('rp_', '')`.

**File: `src/pages/EvalPage.tsx**`

Replace the hardcoded `ALL_CATEGORIES` array with a `useQuery` call to `getOntologyCategories`. Map backend categories to `{ id, label }` for the chip UI. Keep the hardcoded list as a fallback if the fetch fails.

Initialize `selectedCategories` from the fetched list (all selected by default).

## Files summary


| File                     | Changes                                                                          |
| ------------------------ | -------------------------------------------------------------------------------- |
| `src/types/index.ts`     | Fix AskResponse.data_source fields, make provision_id optional, expand Deal type |
| `src/api/client.ts`      | Rewrite getDealStatusesBatch to call Railway directly, add getOntologyCategories |
| `src/pages/EvalPage.tsx` | Fetch categories from backend with hardcoded fallback                            |


## What does NOT change

- No changes to working endpoints (deals list, upload, status polling, answers, ask, delete, health)
- No changes to `useRPProvision.ts` or `groupAnswersByCategory`
- No changes to UI components (AnswerDisplay, SourcesPanel, EvidencePanel, etc.)
- No changes to the Supabase client or config files
- No changes to `DealDetailPage.tsx`