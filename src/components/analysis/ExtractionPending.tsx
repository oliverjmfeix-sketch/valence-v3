import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DealStatus } from '@/types';

interface ExtractionPendingProps {
  status?: DealStatus;
}

export function ExtractionPending({ status }: ExtractionPendingProps) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Loader2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
        <h2 className="text-xl font-semibold mb-2">Analyzing Agreement</h2>
        <p className="text-muted-foreground mb-4">
          {status?.current_step || 'Extracting covenant data...'}
        </p>
        <Progress value={status?.progress || 0} className="max-w-xs mx-auto" />
      </CardContent>
    </Card>
  );
}
