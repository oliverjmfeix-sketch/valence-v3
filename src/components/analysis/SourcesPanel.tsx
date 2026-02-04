import { ChevronDown, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Citation } from '@/types';

interface SourcesPanelProps {
  citations: Citation[];
  isExpanded: boolean;
  onToggle: () => void;
  highlightedPage?: number | null;
}

export function SourcesPanel({ 
  citations, 
  isExpanded, 
  onToggle,
  highlightedPage 
}: SourcesPanelProps) {
  if (citations.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>Sources ({citations.length})</span>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )} 
        />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="animate-in slide-in-from-top-2 duration-200">
        <div className="space-y-3 pt-2">
          {citations.map((citation, index) => (
            <div 
              key={`${citation.page}-${index}`}
              id={`citation-page-${citation.page}`}
              className={cn(
                "flex gap-3 p-3 rounded-lg bg-muted/30 transition-colors",
                highlightedPage === citation.page && "ring-2 ring-primary/30 bg-primary/5"
              )}
            >
              <span className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                p.{citation.page}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {citation.text ? (
                  <span className="italic">"{citation.text}"</span>
                ) : (
                  <span>See page {citation.page}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
