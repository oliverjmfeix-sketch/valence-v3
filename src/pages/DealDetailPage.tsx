import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Calendar, Loader2 } from 'lucide-react';
import { getDeal, getOntologyQuestions, getDealAnswers } from '@/api/client';
import { Button } from '@/components/ui/button';
import { OntologyBrowser } from '@/components/OntologyBrowser';
import { ProvenancePanel } from '@/components/ProvenancePanel';
import { QAInterface } from '@/components/QAInterface';
import { format } from 'date-fns';

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);

  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDeal(id!),
    enabled: !!id,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['ontology-questions'],
    queryFn: getOntologyQuestions,
  });

  const { data: answers, isLoading: answersLoading } = useQuery({
    queryKey: ['deal-answers', id],
    queryFn: () => getDealAnswers(id!),
    enabled: !!id,
  });

  const isLoading = dealLoading || questionsLoading || answersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading deal data...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="-ml-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deals
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{deal.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {deal.borrower}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(deal.upload_date), 'MMMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ontology Browser - 2 columns */}
        <div className="lg:col-span-2">
          <OntologyBrowser
            questions={questions || []}
            answers={answers || []}
            onViewProvenance={setSelectedAttribute}
          />
        </div>

        {/* Q&A Interface - 1 column */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <QAInterface dealId={id!} />
          </div>
        </div>
      </div>

      {/* Provenance Panel */}
      <ProvenancePanel
        dealId={id!}
        attribute={selectedAttribute}
        onClose={() => setSelectedAttribute(null)}
      />
    </div>
  );
}
