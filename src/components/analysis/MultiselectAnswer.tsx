import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, X, Minus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConceptApplicability } from '@/types';

interface MultiselectAnswerProps {
  questionText: string;
  concepts: ConceptApplicability[];
  className?: string;
}

const statusConfig = {
  INCLUDED: {
    icon: Check,
    className: 'bg-included/10 text-included border-included/30 hover:bg-included/20',
    label: 'Included',
  },
  EXCLUDED: {
    icon: X,
    className: 'bg-excluded/10 text-excluded border-excluded/30 hover:bg-excluded/20',
    label: 'Excluded',
  },
} as const;

function ConceptChip({ concept }: { concept: ConceptApplicability }) {
  const config = statusConfig[concept.applicability_status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'gap-1 py-1 px-2 font-normal cursor-help transition-colors',
              config.className
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{concept.concept_name}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-md p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">{concept.concept_name}</span>
              <Badge
                variant="outline"
                className={cn('text-xs', config.className)}
              >
                {config.label}
              </Badge>
            </div>
            {concept.source_text && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  <span>Page {concept.source_page}</span>
                </div>
                <p className="text-sm font-mono text-foreground/90 leading-relaxed">
                  "{concept.source_text.length > 200 
                    ? `${concept.source_text.slice(0, 200)}...` 
                    : concept.source_text}"
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MultiselectAnswer({ questionText, concepts, className }: MultiselectAnswerProps) {
  const hasAnswer = concepts.length > 0;
  
  // Separate included and excluded concepts
  const included = concepts.filter((c) => c.applicability_status === 'INCLUDED');
  const excluded = concepts.filter((c) => c.applicability_status === 'EXCLUDED');

  return (
    <div className={cn('py-3', className)}>
      <p className="text-sm text-foreground mb-3">{questionText}</p>
      
      {!hasAnswer ? (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="text-sm">No data</span>
        </span>
      ) : (
        <div className="space-y-2">
          {included.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {included.map((concept) => (
                <ConceptChip key={concept.concept_id} concept={concept} />
              ))}
            </div>
          )}
          {excluded.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {excluded.map((concept) => (
                <ConceptChip key={concept.concept_id} concept={concept} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version showing just counts
export function MultiselectAnswerCompact({ concepts }: { concepts: ConceptApplicability[] }) {
  const included = concepts.filter((c) => c.applicability_status === 'INCLUDED').length;
  const excluded = concepts.filter((c) => c.applicability_status === 'EXCLUDED').length;

  if (included === 0 && excluded === 0) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {included > 0 && (
        <span className="flex items-center gap-1 text-included">
          <Check className="h-3 w-3" />
          {included}
        </span>
      )}
      {excluded > 0 && (
        <span className="flex items-center gap-1 text-excluded">
          <X className="h-3 w-3" />
          {excluded}
        </span>
      )}
    </div>
  );
}
