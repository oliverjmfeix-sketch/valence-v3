import { CheckCircle2, Circle, Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { DealStatus } from '@/types';

interface ExtractionProgressProps {
  status: DealStatus;
  className?: string;
}

interface Step {
  id: string;
  label: string;
  description: string;
}

const EXTRACTION_STEPS: Step[] = [
  { id: 'parsing', label: 'PDF Parsed', description: 'Document structure analyzed' },
  { id: 'extracting', label: 'RP Content Extracted', description: 'Restricted payment provisions identified' },
  { id: 'answering', label: 'Answering Questions', description: 'Analyzing each provision' },
  { id: 'storing', label: 'Storing Results', description: 'Saving extracted data' },
];

function getStepStatus(step: Step, currentStep: string | null, status: DealStatus['status']): 'complete' | 'current' | 'pending' {
  if (status === 'complete') return 'complete';
  if (status === 'error') return 'pending';
  
  const stepIndex = EXTRACTION_STEPS.findIndex((s) => s.id === step.id);
  const currentIndex = EXTRACTION_STEPS.findIndex((s) => 
    currentStep?.toLowerCase().includes(s.id) || 
    (currentStep?.toLowerCase().includes('question') && s.id === 'answering')
  );

  if (stepIndex < currentIndex) return 'complete';
  if (stepIndex === currentIndex || (currentIndex === -1 && stepIndex === 0 && status === 'extracting')) return 'current';
  return 'pending';
}

export function ExtractionProgress({ status, className }: ExtractionProgressProps) {
  const progress = status.progress || 0;
  const currentStep = status.current_step;
  const dealStatus = status.status;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <FileText className="h-5 w-5 text-info" />
          </div>
          <div>
            <CardTitle className="text-lg">Analyzing Credit Agreement</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dealStatus === 'error' ? 'Extraction failed' : 'Processing your document...'}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {currentStep && (
            <p className="text-sm text-muted-foreground">
              {currentStep}
            </p>
          )}
        </div>

        {/* Step checklist */}
        <div className="space-y-3">
          {EXTRACTION_STEPS.map((step) => {
            const stepStatus = getStepStatus(step, currentStep, dealStatus);
            
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {stepStatus === 'complete' ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : stepStatus === 'current' ? (
                    <Loader2 className="h-5 w-5 text-info animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>
                <div>
                  <p className={cn(
                    'text-sm font-medium',
                    stepStatus === 'pending' && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {dealStatus === 'error' && status.error_message && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {status.error_message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
