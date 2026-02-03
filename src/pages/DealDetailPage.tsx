import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Calendar, Loader2 } from 'lucide-react';
import { getDeal, getRPProvision, getOntologyQuestionsRP } from '@/api/client';
import { useDealStatusPolling } from '@/hooks/useDealStatus';
import { Button } from '@/components/ui/button';
import { DealStatusBadge } from '@/components/deals/DealStatusBadge';
import { ExtractionProgress } from '@/components/deals/ExtractionProgress';
import { CategoryNav } from '@/components/analysis/CategoryNav';
import { CategorySection } from '@/components/analysis/CategorySection';
import { RiskPatternCard, RiskPatternsSection } from '@/components/analysis/RiskPatternCard';
import { DocumentChat } from '@/components/chat/DocumentChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import type { Category, OntologyQuestion, RPProvision } from '@/types';
import { getAnswerForQuestion } from '@/hooks/useRPProvision';

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('');

  // Fetch deal info
  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDeal(id!),
    enabled: !!id,
  });

  // Poll status during extraction
  const { data: status, isProcessing, isComplete } = useDealStatusPolling(id);

  // Fetch ontology questions
  const { data: questionsResponse } = useQuery({
    queryKey: ['ontology-questions-rp'],
    queryFn: getOntologyQuestionsRP,
    enabled: isComplete,
  });

  // Fetch RP provision data
  const { data: provision, isLoading: provisionLoading } = useQuery({
    queryKey: ['rp-provision', id],
    queryFn: () => getRPProvision(id!),
    enabled: !!id && isComplete,
  });

  // Process questions into categories
  const { categories, questionsByCategory } = useMemo(() => {
    const questions = questionsResponse?.questions || [];
    const byCategory = new Map<string, OntologyQuestion[]>();
    const cats: Category[] = [];
    const seenCats = new Set<string>();

    questions.forEach((q) => {
      const existing = byCategory.get(q.category_id) || [];
      existing.push(q);
      byCategory.set(q.category_id, existing);

      if (!seenCats.has(q.category_id)) {
        seenCats.add(q.category_id);
        cats.push({
          id: q.category_id,
          name: q.category_name,
          code: q.category_id.charAt(0),
          questionCount: 0,
          answeredCount: 0,
        });
      }
    });

    // Update counts
    cats.forEach((cat) => {
      const qs = byCategory.get(cat.id) || [];
      cat.questionCount = qs.length;
      cat.answeredCount = qs.filter((q) => {
        const { hasAnswer } = getAnswerForQuestion(provision, q);
        return hasAnswer;
      }).length;
    });

    // Sort by category code
    const order = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    cats.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));

    return { categories: cats, questionsByCategory: byCategory };
  }, [questionsResponse, provision]);

  // Set initial active category
  useMemo(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const isLoading = dealLoading;

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
        <Button variant="ghost" onClick={() => navigate('/')} className="-ml-2 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Deals
        </Button>
        <p className="text-muted-foreground">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="container px-0">
          <Button variant="ghost" onClick={() => navigate('/')} className="-ml-2 mb-3" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{deal.deal_name}</h1>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                {deal.borrower && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {deal.borrower}
                  </span>
                )}
                {(deal.created_at || deal.upload_date) && (() => {
                  const dateStr = deal.created_at || deal.upload_date;
                  if (!dateStr || isNaN(new Date(dateStr).getTime())) return null;
                  return (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(dateStr), 'MMMM d, yyyy')}
                    </span>
                  );
                })()}
              </div>
            </div>
            {status && <DealStatusBadge status={status.status} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isProcessing && status ? (
        <div className="container py-8 max-w-2xl mx-auto">
          <ExtractionProgress status={status} />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Category Navigation */}
          <div className="w-56 border-r bg-sidebar shrink-0">
            <CategoryNav
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              className="h-full"
            />
          </div>

          {/* Center - Extracted Data */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6 max-w-4xl">
              {provisionLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Category sections */}
                  {categories.map((category) => (
                    <CategorySection
                      key={category.id}
                      categoryId={category.id}
                      categoryName={category.name}
                      categoryCode={category.code}
                      questions={questionsByCategory.get(category.id) || []}
                      provision={provision}
                      defaultOpen={category.id === activeCategory}
                    />
                  ))}

                  {/* Risk Patterns */}
                  {provision && (
                    <RiskPatternsSection>
                      <RiskPatternCard
                        title="J.Crew Risk"
                        riskLevel={provision.jcrew_risk_level || 'none'}
                        description={
                          provision.jcrew_risk_level === 'high'
                            ? 'Weak blocker + permissive unrestricted sub rules'
                            : provision.jcrew_risk_level === 'moderate'
                            ? 'Some protective provisions present'
                            : provision.jcrew_risk_level === 'low'
                            ? 'Strong protective provisions'
                            : 'No J.Crew risk detected'
                        }
                        details={
                          provision.jcrew_blocker_exists
                            ? `J.Crew blocker exists with ${provision.jcrew_blocker_overall_strength || 'unknown'} strength.`
                            : undefined
                        }
                      />
                      <RiskPatternCard
                        title="Serta Risk"
                        riskLevel={provision.serta_risk_level || 'none'}
                        description={
                          provision.serta_risk_level === 'high'
                            ? 'Open market purchase provisions present'
                            : provision.serta_risk_level === 'moderate'
                            ? 'Some exchange provisions present'
                            : 'No Serta risk detected'
                        }
                      />
                      <RiskPatternCard
                        title="Collateral Leakage"
                        riskLevel={provision.collateral_leakage_risk || 'none'}
                        description={
                          provision.collateral_leakage_risk === 'high'
                            ? 'Weak asset transfer restrictions'
                            : provision.collateral_leakage_risk === 'moderate'
                            ? 'Some asset protections present'
                            : 'Strong asset transfer restrictions'
                        }
                      />
                    </RiskPatternsSection>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Right Panel - Document Chat */}
          <div className="w-80 border-l shrink-0">
            <DocumentChat dealId={id!} className="h-full rounded-none border-0" />
          </div>
        </div>
      )}
    </div>
  );
}
