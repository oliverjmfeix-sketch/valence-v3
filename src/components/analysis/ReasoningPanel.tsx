import { useState } from 'react';
import { ChevronRight, ChevronDown, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReasoningChain } from '@/types';
import { Check, X } from 'lucide-react';

interface ReasoningPanelProps {
  reasoning: ReasoningChain;
}

// Same formatting logic as EvidencePanel
function formatValue(value: boolean | number | string) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="flex items-center gap-1 text-emerald-700 font-medium text-sm">
        <Check className="h-3.5 w-3.5" /> Yes
      </span>
    ) : (
      <span className="flex items-center gap-1 text-destructive font-medium text-sm">
        <X className="h-3.5 w-3.5" /> No
      </span>
    );
  }
  if (typeof value === 'number') {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return <span className="text-sm font-mono font-semibold">{formatted}</span>;
  }
  const str = String(value);
  const truncated = str.length > 200 ? str.slice(0, 200) + '…' : str;
  return <span className="text-sm text-foreground">"{truncated}"</span>;
}

// Style text in square brackets as inline code
function renderAnalysisText(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <code key={i} className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
          {part}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Extract question_id portion before colon in chain entries
function renderChainEntry(entry: string) {
  const colonIdx = entry.indexOf(':');
  if (colonIdx > 0 && colonIdx < 30) {
    const id = entry.slice(0, colonIdx);
    const rest = entry.slice(colonIdx);
    return (
      <>
        <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{id}</span>
        <span>{rest}</span>
      </>
    );
  }
  return <span>{entry}</span>;
}

export function ReasoningPanel({ reasoning }: ReasoningPanelProps) {
  const [open, setOpen] = useState(false);

  if (!reasoning) return null;

  const provCount = reasoning.provisions.length;
  const interCount = reasoning.interactions.length;

  return (
    <div className="mt-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Show analysis ({provCount} provision{provCount !== 1 ? 's' : ''}, {interCount} interaction{interCount !== 1 ? 's' : ''})
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-4">
            {/* Section 1 — Issue */}
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 border border-border p-3">
              <Scale className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm italic text-muted-foreground leading-relaxed">{reasoning.issue}</p>
            </div>

            {/* Section 2 — Provisions */}
            {provCount > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Relevant Provisions</h4>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{provCount}</Badge>
                </div>
                <div className="space-y-1.5">
                  {reasoning.provisions.map((p, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-2.5 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <code className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded flex-shrink-0">{p.question_id}</code>
                        <div className="min-w-0">
                          <div>{formatValue(p.value)}</div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{p.why_relevant}</p>
                        </div>
                      </div>
                      {p.source_page !== null && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">p.{p.source_page}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3 — Analysis */}
            {reasoning.analysis.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Provision Analysis</h4>
                <ul className="space-y-1.5 pl-4">
                  {reasoning.analysis.map((step, i) => (
                    <li key={i} className="text-sm text-foreground leading-relaxed list-disc">
                      {renderAnalysisText(step)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Section 4 — Interactions */}
            {interCount > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Interaction Findings</h4>
                <div className="space-y-2">
                  {reasoning.interactions.map((inter, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-3 border-l-4 border-l-amber-400">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground">{inter.finding}</span>
                      </div>
                      <div className="ml-5 space-y-1 mb-2">
                        {inter.chain.map((entry, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 flex-shrink-0">{j + 1}.</span>
                            <p className="text-xs text-foreground leading-relaxed">{renderChainEntry(entry)}</p>
                          </div>
                        ))}
                      </div>
                      <p className="ml-5 text-xs font-medium text-foreground/80 italic">{inter.implication}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 5 — Conclusion */}
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 border border-border p-3">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium text-foreground leading-relaxed">{reasoning.conclusion}</p>
            </div>

            {/* Footer — Stats */}
            <p className="text-[11px] text-muted-foreground text-right">
              Used {reasoning.evidence_stats.cited_in_answer} of {reasoning.evidence_stats.total_available} available data points
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
