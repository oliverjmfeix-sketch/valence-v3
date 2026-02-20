import { useState } from 'react';
import { ChevronRight, ChevronDown, Scale, AlertTriangle, CheckCircle2, Check, X, FileText, Link2, Brain, BarChart3 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReasoningChain, ReasoningProvision, ReasoningInteraction } from '@/types';

interface ReasoningPanelProps {
  reasoning: ReasoningChain;
}

// ─── Value formatting (mirrors EvidencePanel) ───

function formatValue(value: boolean | number | string) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
        <Check className="h-3 w-3" /> Yes
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-destructive font-medium text-xs">
        <X className="h-3 w-3" /> No
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
    return <span className="text-xs font-mono font-semibold">{formatted}</span>;
  }
  const str = String(value);
  const truncated = str.length > 120 ? str.slice(0, 120) + '…' : str;
  return <span className="text-xs text-foreground leading-snug">"{truncated}"</span>;
}

// ─── Inline code styling for [references] ───

function renderWithRefs(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <code key={i} className="text-[11px] font-mono bg-muted text-muted-foreground px-1 py-0.5 rounded border border-border">
          {part}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Chain entry formatting ───

function renderChainEntry(entry: string) {
  const colonIdx = entry.indexOf(':');
  if (colonIdx > 0 && colonIdx < 30) {
    const id = entry.slice(0, colonIdx);
    const rest = entry.slice(colonIdx + 1);
    return (
      <>
        <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded border border-border text-muted-foreground">{id}</code>
        <span className="text-xs text-foreground leading-snug">{rest}</span>
      </>
    );
  }
  return <span className="text-xs text-foreground">{entry}</span>;
}

// ─── Section header ───

function SectionHeader({ icon: Icon, title, count, className }: {
  icon: React.ElementType;
  title: string;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 pb-2 border-b border-border", className)}>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</h4>
      {count !== undefined && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{count}</Badge>
      )}
    </div>
  );
}

// ─── Provision card ───

function ProvisionCard({ provision }: { provision: ReasoningProvision }) {
  const isLongValue = typeof provision.value === 'string' && String(provision.value).length > 40;

  return (
    <div className="group rounded-md border border-border bg-card hover:bg-muted/30 transition-colors p-2.5">
      <div className="flex items-start gap-2">
        <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-muted-foreground flex-shrink-0 mt-0.5">
          {provision.question_id}
        </code>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className={cn("flex-1", isLongValue && "space-y-1")}>
              {formatValue(provision.value)}
            </div>
            {provision.source_page !== null && (
              <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">p.{provision.source_page}</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug mt-1">{provision.why_relevant}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Interaction card ───

function InteractionCard({ interaction, index }: { interaction: ReasoningInteraction; index: number }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Finding header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">{interaction.finding}</span>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Chain */}
        <div className="relative pl-4">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
          <div className="space-y-1.5">
            {interaction.chain.map((entry, j) => (
              <div key={j} className="flex items-start gap-2 relative">
                {/* Dot on the line */}
                <div className="absolute -left-4 top-1.5 w-[7px] h-[7px] rounded-full border-2 border-amber-400 dark:border-amber-500 bg-card flex-shrink-0 z-10" />
                <div className="pl-1">{renderChainEntry(entry)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Implication */}
        <div className="rounded-md bg-muted/50 p-2 mt-1">
          <p className="text-xs text-foreground/90 leading-relaxed font-medium italic">
            → {interaction.implication}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───

export function ReasoningPanel({ reasoning }: ReasoningPanelProps) {
  const [open, setOpen] = useState(false);

  if (!reasoning) return null;

  const provisions = reasoning.provisions ?? [];
  const analysis = reasoning.analysis ?? [];
  const interactions = reasoning.interactions ?? [];
  const provCount = provisions.length;
  const interCount = interactions.length;

  return (
    <div className="mt-5 mb-1">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none group">
          <div className="flex items-center justify-center h-5 w-5 rounded bg-muted group-hover:bg-muted/80 transition-colors">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </div>
          <Brain className="h-3.5 w-3.5" />
          <span>
            Show analysis
            <span className="text-muted-foreground/70 ml-1">
              ({provCount} provision{provCount !== 1 ? 's' : ''}, {interCount} interaction{interCount !== 1 ? 's' : ''})
            </span>
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 rounded-lg border border-border bg-card/50 overflow-hidden">

            {/* ── Section 1: Issue ── */}
            <div className="px-4 py-3 bg-muted/30 border-b border-border">
              <div className="flex items-start gap-2.5">
                <Scale className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm italic text-muted-foreground leading-relaxed">{reasoning.issue}</p>
              </div>
            </div>

            <div className="p-4 space-y-6">

              {/* ── Section 2: Provisions ── */}
              {provCount > 0 && (
                <div>
                  <SectionHeader icon={FileText} title="Relevant Provisions" count={provCount} />
                  <div className="mt-2.5 grid gap-1.5 max-h-[20rem] overflow-y-auto pr-1">
                    {provisions.map((p, i) => (
                      <ProvisionCard key={i} provision={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 3: Analysis ── */}
              {analysis.length > 0 && (
                <div>
                  <SectionHeader icon={Brain} title="Provision Analysis" />
                  <ol className="mt-2.5 space-y-2 pl-0">
                    {analysis.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 border border-border">
                          {i + 1}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed flex-1">
                          {renderWithRefs(step)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ── Section 4: Interactions ── */}
              {interCount > 0 && (
                <div>
                  <SectionHeader icon={Link2} title="Interaction Findings" count={interCount} />
                  <div className="mt-2.5 space-y-3">
                    {interactions.map((inter, i) => (
                      <InteractionCard key={i} interaction={inter} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Section 5: Conclusion ── */}
              <div>
                <SectionHeader icon={CheckCircle2} title="Conclusion" className="border-b-0 pb-1" />
                <div className="mt-1 rounded-md bg-primary/5 border border-primary/15 p-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground leading-relaxed">{reasoning.conclusion}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer: Stats ── */}
            <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center justify-end gap-1.5">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                Used {reasoning.evidence_stats?.cited_in_answer ?? 0} of {reasoning.evidence_stats?.total_available ?? 0} available data points
              </span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
