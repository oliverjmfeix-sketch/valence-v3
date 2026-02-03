import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Loader2, MessageSquare, Lightbulb, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askQuestion } from '@/api/client';
import type { QAResponse } from '@/types';

interface DocumentChatProps {
  dealId: string;
  className?: string;
}

const EXAMPLE_QUESTIONS = [
  "Why does this deal have J.Crew risk?",
  "What's the sunset period?",
  "Is there an MFN provision?",
  "What restricted payment exceptions exist?",
];

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  evidence?: QAResponse['evidence'];
}

export function DocumentChat({ dealId, className }: DocumentChatProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const mutation = useMutation({
    mutationFn: (q: string) => askQuestion(dealId, q),
    onSuccess: (data, question) => {
      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: 'user',
          content: question,
        },
        {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: data.answer,
          evidence: data.evidence,
        },
      ]);
      setQuestion('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      mutation.mutate(question);
    }
  };

  const handleExampleClick = (q: string) => {
    mutation.mutate(q);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-accent" />
          Document Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[calc(100%-60px)]">
        {/* Messages area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                Ask questions about this credit agreement
              </p>
              
              {/* Example questions */}
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
                      className="text-xs h-auto py-1.5 px-2 whitespace-normal text-left"
                      onClick={() => handleExampleClick(q)}
                      disabled={mutation.isPending}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg px-3 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {/* Evidence */}
                    {message.evidence && message.evidence.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                        {message.evidence.map((e, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs">
                            <Badge variant="outline" className="shrink-0 text-xs py-0">
                              {e.primitive}
                            </Badge>
                            <span className="text-muted-foreground">
                              {String(e.value)}
                              {e.source && (
                                <span className="ml-1 opacity-70">({e.source})</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {mutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Error */}
        {mutation.isError && (
          <div className="mx-4 mb-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-destructive">Failed to get answer</p>
              <p className="text-muted-foreground mt-0.5">Please try again or rephrase your question.</p>
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 pt-2 border-t">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about this agreement..."
              disabled={mutation.isPending}
              className="flex-1 text-sm"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={mutation.isPending || !question.trim()}
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
