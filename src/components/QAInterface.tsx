import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Loader2, MessageSquare, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { askQuestion } from '@/api/client';
import type { QAResponse } from '@/types';

interface QAInterfaceProps {
  dealId: string;
}

const EXAMPLE_QUESTIONS = [
  "Why does this deal have J.Crew risk?",
  "What's the sunset period?",
  "Is there an MFN provision?",
  "What restricted payment exceptions exist?",
];

export function QAInterface({ dealId }: QAInterfaceProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<QAResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (q: string) => askQuestion(dealId, q),
    onSuccess: (data) => setResponse(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      mutation.mutate(question);
    }
  };

  const handleExampleClick = (q: string) => {
    setQuestion(q);
    mutation.mutate(q);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Example Questions */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Try an example:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleExampleClick(q)}
                disabled={mutation.isPending}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this credit agreement..."
            disabled={mutation.isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={mutation.isPending || !question.trim()}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Response */}
        {mutation.isError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            Failed to get answer. Please try again.
          </div>
        )}

        {response && (
          <div className="space-y-3 border-t pt-4">
            <div className="rounded-md bg-secondary/50 p-4">
              <p className="text-sm leading-relaxed">{response.answer}</p>
            </div>

            {Array.isArray(response.evidence) && response.evidence.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Supporting Evidence:</p>
                <div className="space-y-2">
                  {response.evidence.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {e.primitive}
                      </Badge>
                      <span className="text-muted-foreground">
                        {String(e.value)}
                        {e.source && (
                          <span className="text-xs ml-1">({e.source})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
