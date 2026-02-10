import type { EvalResult } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface EvalSummaryCardsProps {
  result: EvalResult;
}

const metrics = [
  { key: 'valence_win_count', label: 'VALENCE WINS', className: 'text-[hsl(var(--success))]' },
  { key: 'tie_count', label: 'TIES', className: 'text-[hsl(var(--info))]' },
  { key: 'raw_win_count', label: 'RAW WINS', className: 'text-[hsl(var(--warning))]' },
  { key: 'both_weak_count', label: 'BOTH WEAK', className: 'text-[hsl(var(--destructive))]' },
] as const;

export function EvalSummaryCards({ result }: EvalSummaryCardsProps) {
  const total = result.total_questions;
  const pct = (n: number) => total > 0 ? `(${((n / total) * 100).toFixed(1)}%)` : '';

  const minutes = Math.floor(result.total_time_seconds / 60);
  const seconds = Math.round(result.total_time_seconds % 60);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {metrics.map(({ key, label, className }) => {
          const count = result[key];
          return (
            <Card key={key} className="text-center">
              <CardContent className="pt-4 pb-3 px-3">
                <p className="text-xs font-medium text-muted-foreground tracking-wide">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${className}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{pct(count)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Avg Score — Valence: <span className="font-medium text-foreground">{result.avg_score_valence.toFixed(1)}</span>
        {' / Raw: '}
        <span className="font-medium text-foreground">{result.avg_score_raw.toFixed(1)}</span>
        {' | Total time: '}
        <span className="font-medium text-foreground">{minutes}m {seconds}s</span>
      </p>
    </div>
  );
}
