import { useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, BookOpen, Hash } from 'lucide-react';
import { getProvenance } from '@/api/client';
import { cn } from '@/lib/utils';

interface ProvenancePanelProps {
  dealId: string;
  attribute: string | null;
  onClose: () => void;
}

export function ProvenancePanel({ dealId, attribute, onClose }: ProvenancePanelProps) {
  const { data: provenance, isLoading, error } = useQuery({
    queryKey: ['provenance', dealId, attribute],
    queryFn: () => getProvenance(dealId, attribute!),
    enabled: !!attribute,
  });

  const confidenceColor = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Sheet open={!!attribute} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Source Evidence
          </SheetTitle>
          <SheetDescription>
            Provenance for: <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{attribute}</code>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load provenance data
            </div>
          ) : provenance ? (
            <>
              {/* Confidence Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <Badge 
                  variant="outline" 
                  className={cn('capitalize', confidenceColor[provenance.confidence])}
                >
                  {provenance.confidence}
                </Badge>
              </div>

              {/* Source Text */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Source Text
                </h4>
                <blockquote className="border-l-4 border-primary/30 pl-4 py-3 bg-secondary/30 rounded-r-md">
                  <p className="text-sm leading-relaxed italic text-foreground/90">
                    "{provenance.source_text}"
                  </p>
                </blockquote>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Page Number
                  </h4>
                  <p className="text-2xl font-semibold">{provenance.page_number}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Section</h4>
                  <p className="text-sm text-muted-foreground">{provenance.section}</p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
