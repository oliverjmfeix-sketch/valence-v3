import { useState } from 'react';
import { ChevronRight, ChevronDown, Check, X, Minus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EvidenceItem } from '@/types';

interface EvidencePanelProps {
  evidence: EvidenceItem[];
}

function ConfidenceBadge({ confidence }: { confidence: EvidenceItem['confidence'] }) {
  const config = {
    high: { label: 'HIGH', icon: Check, className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    medium: { label: 'MEDIUM', icon: null, className: 'bg-amber-100 text-amber-800 border-amber-200' },
    low: { label: 'LOW', icon: null, className: 'bg-orange-100 text-orange-800 border-orange-200' },
    not_found: { label: 'NOT FOUND', icon: Minus, className: 'bg-muted text-muted-foreground border-border' },
  };
  const c = config[confidence];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={cn('text-[10px] font-semibold gap-1 px-1.5 py-0', c.className)}>
      {Icon && <Icon className="h-3 w-3" />}
      {c.label}
    </Badge>
  );
}

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

function formatCitation(section: string, page: number | null) {
  const parts: string[] = [];
  if (section) parts.push(section);
  if (page !== null) parts.push(`p.${page}`);
  return parts.join(', ') || null;
}

function truncateSource(text: string, max = 300) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const citation = formatCitation(item.source_section, item.source_page);
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground leading-snug flex-1">{item.question_text}</p>
        <ConfidenceBadge confidence={item.confidence} />
      </div>
      <div>
        <span className="text-xs text-muted-foreground mr-1.5">Value:</span>
        {formatValue(item.value)}
      </div>
      {citation && (
        <p className="text-xs text-muted-foreground">{citation}</p>
      )}
      {item.source_text && (
        <p className="text-xs italic text-muted-foreground/80 pl-2 border-l-2 border-border leading-relaxed">
          {truncateSource(item.source_text)}
        </p>
      )}
    </div>
  );
}

export function EvidencePanel({ evidence }: EvidencePanelProps) {
  const [open, setOpen] = useState(false);

  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="mt-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none">
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          Show evidence ({evidence.length} data point{evidence.length !== 1 ? 's' : ''})
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-2 max-h-[28rem] overflow-y-auto pr-1">
            {evidence.map((item) => (
              <EvidenceCard key={item.question_id} item={item} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
