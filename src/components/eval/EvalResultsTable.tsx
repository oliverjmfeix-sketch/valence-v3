import type { EvalQuestionResult } from '@/types';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';

interface EvalResultsTableProps {
  results: EvalQuestionResult[];
  onSelect: (index: number) => void;
}

const verdictPriority: Record<string, number> = {
  raw_wins: 0,
  both_weak: 1,
  tie: 2,
  valence_wins: 3,
};

const verdictDisplay: Record<string, { icon: string; label: string; className: string }> = {
  valence_wins: { icon: '✅', label: 'Valence wins', className: 'text-[hsl(var(--success))]' },
  tie: { icon: '🟰', label: 'Tie', className: 'text-muted-foreground' },
  raw_wins: { icon: '⚠️', label: 'Raw wins', className: 'text-[hsl(var(--warning))] font-semibold' },
  both_weak: { icon: '🔴', label: 'Both weak', className: 'text-[hsl(var(--destructive))]' },
};

export function EvalResultsTable({ results, onSelect }: EvalResultsTableProps) {
  const sorted = [...results]
    .map((r, i) => ({ ...r, originalIndex: i }))
    .sort((a, b) => (verdictPriority[a.verdict] ?? 9) - (verdictPriority[b.verdict] ?? 9));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Question</TableHead>
          <TableHead className="w-16 text-center">Raw</TableHead>
          <TableHead className="w-16 text-center">Valence</TableHead>
          <TableHead className="w-40">Verdict</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((r, i) => {
          const v = verdictDisplay[r.verdict] ?? verdictDisplay.tie;
          return (
            <TableRow
              key={i}
              className="cursor-pointer"
              onClick={() => onSelect(r.originalIndex)}
            >
              <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="max-w-md truncate">{r.question.slice(0, 60)}{r.question.length > 60 ? '...' : ''}</TableCell>
              <TableCell className="text-center font-mono">{r.score_raw}</TableCell>
              <TableCell className="text-center font-mono">{r.score_valence}</TableCell>
              <TableCell className={v.className}>{v.icon} {v.label}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
