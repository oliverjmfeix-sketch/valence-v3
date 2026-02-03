import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SourceCitationProps {
  text: string;
  page: number;
  section?: string;
  className?: string;
  showIcon?: boolean;
}

export function SourceCitation({ text, page, section, className, showIcon = true }: SourceCitationProps) {
  // Truncate source text for display in tooltip
  const displayText = text.length > 300 ? `${text.slice(0, 300)}...` : text;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button 
            className={cn(
              'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-help',
              className
            )}
          >
            {showIcon && <FileText className="h-3 w-3" />}
            <span className="font-mono">p.{page}</span>
            {section && <span className="hidden sm:inline">• {section}</span>}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="start"
          className="max-w-md p-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>Page {page}</span>
              {section && (
                <>
                  <span>•</span>
                  <span>{section}</span>
                </>
              )}
            </div>
            <p className="text-sm leading-relaxed font-mono text-foreground/90">
              "{displayText}"
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Inline version for smaller contexts
export function SourceCitationInline({ page, className }: { page: number; className?: string }) {
  return (
    <span className={cn('text-xs text-muted-foreground font-mono', className)}>
      (p.{page})
    </span>
  );
}
