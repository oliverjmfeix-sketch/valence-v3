import { forwardRef } from 'react';
import type { EvalQuestionResult } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Props {
  result: EvalQuestionResult;
  index: number;
}

const verdictLabel: Record<string, { text: string; className: string }> = {
  valence_wins: { text: '✅ VALENCE WINS', className: 'text-[hsl(var(--success))]' },
  tie: { text: '🟰 TIE', className: 'text-muted-foreground' },
  raw_wins: { text: '⚠️ RAW WINS', className: 'text-[hsl(var(--warning))]' },
  both_weak: { text: '🔴 BOTH WEAK', className: 'text-[hsl(var(--destructive))]' },
};

function Section({ title, items, borderColor }: { title: string; items: string[]; borderColor: string }) {
  if (items.length === 0) return null;
  return (
    <div className={`border-l-4 ${borderColor} pl-4 py-2`}>
      <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export const EvalQuestionDetail = forwardRef<HTMLDivElement, Props>(({ result, index }, ref) => {
  const v = verdictLabel[result.verdict] ?? verdictLabel.tie;

  return (
    <Card ref={ref}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium leading-snug">
            <span className="text-muted-foreground">Q{index + 1}:</span> {result.question}
          </p>
          <div className="text-right flex-shrink-0">
            <p className={`text-sm font-semibold ${v.className}`}>{v.text}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Raw: {result.score_raw} | Valence: {result.score_valence}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section title="VALENCE ADVANTAGES" items={result.valence_advantages} borderColor="border-[hsl(var(--success))]" />
        <Section title="VALENCE GAPS" items={result.valence_gaps} borderColor="border-[hsl(var(--warning))]" />
        <Section title="VALENCE ERRORS" items={result.valence_errors} borderColor="border-[hsl(var(--destructive))]" />
        <Section title="BOTH MISSED" items={result.both_missed} borderColor="border-border" />

        <div>
          <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">SIDE-BY-SIDE ANSWERS</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">RAW ANSWER</p>
              <div className="bg-muted/50 rounded-md p-3 max-h-96 overflow-y-auto">
                <p className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{result.raw_answer}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">VALENCE ANSWER</p>
              <div className="bg-muted/50 rounded-md p-3 max-h-96 overflow-y-auto">
                <p className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{result.valence_answer}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EvalQuestionDetail.displayName = 'EvalQuestionDetail';
