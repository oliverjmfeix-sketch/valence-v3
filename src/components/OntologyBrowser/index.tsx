import { useState, useMemo, useRef, useEffect } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { SearchFilter } from './SearchFilter';
import { QuestionList } from './QuestionList';
import type { OntologyQuestion, DealAnswer } from '@/types';

interface OntologyBrowserProps {
  questions: OntologyQuestion[];
  answers: DealAnswer[];
  onViewProvenance: (attribute: string) => void;
}

const CATEGORY_CONFIG = {
  mfn: { label: 'MFN Provisions', order: 1 },
  rp: { label: 'Restricted Payments', order: 2 },
  pattern: { label: 'Pattern Detection', order: 3 },
} as const;

export function OntologyBrowser({ questions, answers, onViewProvenance }: OntologyBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string>('mfn');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);

  // Create answer lookup map
  const answersMap = useMemo(() => {
    return new Map(answers.map((a) => [a.question_id, a]));
  }, [answers]);

  // Group questions by category
  const questionsByCategory = useMemo(() => {
    const grouped = new Map<string, OntologyQuestion[]>();
    questions.forEach((q) => {
      const existing = grouped.get(q.category) || [];
      existing.push(q);
      grouped.set(q.category, existing);
    });
    return grouped;
  }, [questions]);

  // Build category list with counts
  const categories = useMemo(() => {
    return Object.entries(CATEGORY_CONFIG)
      .map(([id, config]) => ({
        id,
        label: config.label,
        count: questionsByCategory.get(id)?.length || 0,
        order: config.order,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.order - b.order);
  }, [questionsByCategory]);

  // Filter questions by category and search
  const filteredQuestions = useMemo(() => {
    const categoryQuestions = questionsByCategory.get(activeCategory) || [];
    if (!searchQuery.trim()) return categoryQuestions;

    const query = searchQuery.toLowerCase();
    return categoryQuestions.filter(
      (q) =>
        q.text.toLowerCase().includes(query) ||
        q.subcategory?.toLowerCase().includes(query) ||
        q.target_attribute.toLowerCase().includes(query)
    );
  }, [questionsByCategory, activeCategory, searchQuery]);

  const totalInCategory = questionsByCategory.get(activeCategory)?.length || 0;

  // Calculate available height for the list
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 40;
        setListHeight(Math.max(300, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Set default category if current has no questions
  useEffect(() => {
    if (categories.length > 0 && !categories.find((c) => c.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  return (
    <div className="flex flex-col h-full">
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
      >
        <div className="space-y-4">
          <SearchFilter
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${CATEGORY_CONFIG[activeCategory as keyof typeof CATEGORY_CONFIG]?.label || 'questions'}...`}
            resultCount={filteredQuestions.length}
            totalCount={totalInCategory}
          />

          <div ref={containerRef} className="border rounded-lg bg-card">
            <QuestionList
              questions={filteredQuestions}
              answers={answersMap}
              onViewProvenance={onViewProvenance}
              height={listHeight}
            />
          </div>
        </div>
      </CategoryTabs>
    </div>
  );
}
