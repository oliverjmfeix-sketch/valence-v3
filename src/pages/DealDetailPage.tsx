import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, MessageSquare, Copy, Check } from 'lucide-react';
import { getDeal, askDealQuestion } from '@/api/client';
import { useDealStatusPolling } from '@/hooks/useDealStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisHeader } from '@/components/analysis/AnalysisHeader';
import { QuestionInput } from '@/components/analysis/QuestionInput';
import { SuggestedQuestions } from '@/components/analysis/SuggestedQuestions';
import { AnswerDisplay } from '@/components/analysis/AnswerDisplay';
import { SourcesPanel } from '@/components/analysis/SourcesPanel';
import { ExtractionPending } from '@/components/analysis/ExtractionPending';
import { useToast } from '@/hooks/use-toast';
import type { AskResponse } from '@/types';

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<AskResponse | null>(null);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [highlightedPage, setHighlightedPage] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch deal info
  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDeal(id!),
    enabled: !!id,
  });

  // Poll status during extraction
  const { data: status, isProcessing, isComplete } = useDealStatusPolling(id);

  // Ask mutation
  const askMutation = useMutation({
    mutationFn: (q: string) => askDealQuestion(id!, q),
    onSuccess: (data) => {
      setCurrentAnswer(data);
      setSourcesExpanded(false);
      setHighlightedPage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to get answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!question.trim() || askMutation.isPending) return;
    askMutation.mutate(question);
  }, [question, askMutation]);

  // Handle suggested question click
  const handleSuggestedClick = useCallback((q: string) => {
    setQuestion(q);
    askMutation.mutate(q);
  }, [askMutation]);

  // Handle citation click in answer
  const handleCitationClick = useCallback((page: number) => {
    setSourcesExpanded(true);
    setHighlightedPage(page);
    // Scroll to the citation after a short delay to allow expansion
    setTimeout(() => {
      const element = document.getElementById(`citation-page-${page}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // Handle copy Q&A
  const handleCopyQA = useCallback(() => {
    if (!currentAnswer) return;
    
    const textToCopy = `Q: ${currentAnswer.question}\n\nA: ${currentAnswer.answer}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentAnswer]);

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-muted-foreground">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AnalysisHeader
        dealName={deal.deal_name}
        borrower={deal.borrower}
        status={status?.status || 'pending'}
        onBack={() => navigate('/')}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isProcessing && status ? (
          <ExtractionPending status={status} />
        ) : !isComplete ? (
          <ExtractionPending status={status} />
        ) : (
          <>
            {/* Q&A Input Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Ask anything about this agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <QuestionInput
                  value={question}
                  onChange={setQuestion}
                  onSubmit={handleSubmit}
                  isLoading={askMutation.isPending}
                  placeholder="What's the J.Crew risk in this deal?"
                />

                <SuggestedQuestions
                  onSelect={handleSuggestedClick}
                  disabled={askMutation.isPending}
                />
              </CardContent>
            </Card>

            {/* Answer Section */}
            {(currentAnswer || askMutation.isPending) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <AnswerDisplay
                        answer={currentAnswer?.answer || ''}
                        isLoading={askMutation.isPending}
                        onCitationClick={handleCitationClick}
                      />
                    </div>
                    {currentAnswer && !askMutation.isPending && (
                      <button
                        onClick={handleCopyQA}
                        className="flex-shrink-0 p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Copy question and answer"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {currentAnswer && currentAnswer.citations.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <SourcesPanel
                        citations={currentAnswer.citations}
                        isExpanded={sourcesExpanded}
                        onToggle={() => setSourcesExpanded(!sourcesExpanded)}
                        highlightedPage={highlightedPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
