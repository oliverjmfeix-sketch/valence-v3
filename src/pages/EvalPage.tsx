import { useState, useRef, useEffect, useCallback, createRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { runEval } from '@/api/client';
import { EvalSummaryCards } from '@/components/eval/EvalSummaryCards';
import { EvalResultsTable } from '@/components/eval/EvalResultsTable';
import { EvalQuestionDetail } from '@/components/eval/EvalQuestionDetail';
import type { EvalResult } from '@/types';

const ALL_CATEGORIES = [
  { id: 'builder_basket', label: 'Builder Basket' },
  { id: 'jcrew', label: 'J.Crew' },
  { id: 'ratio_basket', label: 'Ratio Basket' },
  { id: 'definitions', label: 'Definitions' },
  { id: 'scenarios', label: 'Scenarios' },
];

export default function EvalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [numQuestions, setNumQuestions] = useState(15);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES.map(c => c.id));
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<EvalResult | null>(null);

  const detailRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);

  // Elapsed timer
  useEffect(() => {
    if (!running) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleRun = useCallback(async () => {
    if (!id || running) return;
    setRunning(true);
    setResult(null);
    try {
      const data = await runEval(id, numQuestions, selectedCategories);
      setResult(data);
      detailRefs.current = data.results.map(() => createRef<HTMLDivElement>());
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast({ title: 'Evaluation timed out', description: 'Try with fewer questions.', variant: 'destructive' });
      } else {
        toast({ title: 'Evaluation failed', description: err.message, variant: 'destructive' });
      }
    } finally {
      setRunning(false);
    }
  }, [id, running, numQuestions, selectedCategories, toast]);

  const scrollToDetail = (index: number) => {
    detailRefs.current[index]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const estimatedTotal = numQuestions * 30;
  const progressPct = Math.min((elapsed / estimatedTotal) * 100, 95);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;
  const remainingSec = Math.max(estimatedTotal - elapsed, 0);
  const remainingMin = Math.floor(remainingSec / 60);
  const remainingSecRem = remainingSec % 60;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-card px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(`/deals/${id}`)} className="-ml-2 mb-3" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deal
          </Button>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold tracking-tight">Q&A Evaluation</h1>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Run Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium">Questions</label>
                  <Input
                    type="number"
                    min={3}
                    max={25}
                    value={numQuestions}
                    onChange={e => setNumQuestions(Math.min(25, Math.max(3, Number(e.target.value))))}
                    className="w-20"
                    disabled={running}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(cat => (
                    <Badge
                      key={cat.id}
                      variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => !running && toggleCategory(cat.id)}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleRun}
                disabled={running || selectedCategories.length === 0}
                className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-[hsl(var(--accent-foreground))]"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  'Run Eval'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {running && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--accent))]" />
                <p className="text-sm font-medium">Running evaluation...</p>
              </div>
              <Progress value={progressPct} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Elapsed: {elapsedMin}m {elapsedSec.toString().padStart(2, '0')}s</span>
                <span>Estimated remaining: ~{remainingMin}m {remainingSecRem.toString().padStart(2, '0')}s</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!running && !result && (
          <Card>
            <CardContent className="pt-6 text-center space-y-3 py-12">
              <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-semibold">Q&A Evaluation</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Run an automated evaluation to compare Valence answers against raw document analysis.
                Valence should produce more precise and complete answers — this tool measures whether it actually does.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <>
            <EvalSummaryCards result={result} />

            <Card>
              <CardContent className="pt-6 px-0">
                <EvalResultsTable results={result.results} onSelect={scrollToDetail} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {result.results.map((r, i) => (
                <EvalQuestionDetail
                  key={i}
                  ref={detailRefs.current[i]}
                  result={r}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
