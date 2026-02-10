

# Eval Dashboard -- Two Amendments

## 1. Fix sort order in EvalResultsTable

The results table sort priority should put **raw_wins first** (actionable bugs where Valence missed something), then both_weak (ontology gaps), then ties, then valence_wins.

Updated sort priority map:
```text
raw_wins    -> 0  (highest priority -- actionable bugs)
both_weak   -> 1  (ontology gaps -- important but less urgent)
tie         -> 2
valence_wins -> 3
```

This applies in `src/components/eval/EvalResultsTable.tsx` where the verdict-based sort comparator is defined.

## 2. AnalysisHeader: use useParams() internally instead of a new dealId prop

`DealDetailPage` already has `const { id } = useParams()` and uses it everywhere. Instead of adding a `dealId` prop to `AnalysisHeader`, the header component will:

- Import `useParams` from `react-router-dom` internally
- Call `const { id } = useParams()` inside itself
- Use `id` to build the `/deals/${id}/eval` link
- No prop changes, no changes to the parent component

Changes in `src/components/analysis/AnalysisHeader.tsx`:
- Add `useParams` import
- Add `Link` (or `useNavigate`) import
- Add `FlaskConical` icon import from lucide-react
- Render the eval link button next to the status badge when status is `complete`
- The button links to `/deals/${id}/eval`

No changes needed in `DealDetailPage.tsx` for this.

## Summary of files affected

| File | Change |
|------|--------|
| `src/components/eval/EvalResultsTable.tsx` (new) | Sort order: raw_wins=0, both_weak=1, tie=2, valence_wins=3 |
| `src/components/analysis/AnalysisHeader.tsx` | Add useParams() internally for dealId, add FlaskConical eval link button |

All other planned files and behavior remain unchanged from the approved plan.

