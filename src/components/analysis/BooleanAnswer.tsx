import { Check, X, Minus } from 'lucide-react';
import { SourceCitation } from './SourceCitation';
import { cn } from '@/lib/utils';

interface BooleanAnswerProps {
  questionText: string;
  value: boolean | undefined | null;
  sourceText?: string;
  sourcePage?: number;
  className?: string;
}

export function BooleanAnswer({ 
  questionText, 
  value, 
  sourceText, 
  sourcePage,
  className 
}: BooleanAnswerProps) {
  const hasAnswer = value !== undefined && value !== null;

  return (
    <div className={cn('flex items-start justify-between gap-4 py-3', className)}>
      <p className="text-sm text-foreground flex-1">{questionText}</p>
      
      <div className="flex items-center gap-3 shrink-0">
        {!hasAnswer ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Minus className="h-4 w-4" />
            <span className="text-sm">Not found</span>
          </span>
        ) : value ? (
          <span className="flex items-center gap-1.5 text-success">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Yes</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-destructive">
            <X className="h-4 w-4" />
            <span className="text-sm font-medium">No</span>
          </span>
        )}
        
        {sourceText && sourcePage && (
          <SourceCitation text={sourceText} page={sourcePage} />
        )}
      </div>
    </div>
  );
}

// Compact version for tables/lists
export function BooleanAnswerCompact({ value }: { value: boolean | undefined | null }) {
  if (value === undefined || value === null) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  
  return value ? (
    <span className="flex items-center gap-1 text-success">
      <Check className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">Yes</span>
    </span>
  ) : (
    <span className="flex items-center gap-1 text-destructive">
      <X className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">No</span>
    </span>
  );
}
