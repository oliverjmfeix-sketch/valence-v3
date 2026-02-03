import { useQuery } from '@tanstack/react-query';
import { getRPProvision, getOntologyQuestionsRP } from '@/api/client';
import type { RPProvision, OntologyQuestion, Category } from '@/types';

export function useRPProvision(dealId: string | undefined) {
  return useQuery<RPProvision>({
    queryKey: ['rp-provision', dealId],
    queryFn: () => getRPProvision(dealId!),
    enabled: !!dealId,
  });
}

export function useOntologyQuestionsRP() {
  return useQuery({
    queryKey: ['ontology-questions-rp'],
    queryFn: async () => {
      const response = await getOntologyQuestionsRP();
      return response.questions || [];
    },
  });
}

// Helper to group questions by category
export function useQuestionsByCategory() {
  const { data: questions = [], ...rest } = useOntologyQuestionsRP();

  const categories: Category[] = [];
  const questionsByCategory = new Map<string, OntologyQuestion[]>();

  questions.forEach((q) => {
    const categoryId = q.category_id;
    const existing = questionsByCategory.get(categoryId) || [];
    existing.push(q);
    questionsByCategory.set(categoryId, existing);
  });

  // Build category list with proper ordering
  const categoryOrder = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  const seenCategories = new Set<string>();
  questions.forEach((q) => {
    if (!seenCategories.has(q.category_id)) {
      seenCategories.add(q.category_id);
      const questionsInCat = questionsByCategory.get(q.category_id) || [];
      categories.push({
        id: q.category_id,
        name: q.category_name,
        code: q.category_id.charAt(0),
        questionCount: questionsInCat.length,
        answeredCount: 0, // Will be calculated with provision data
      });
    }
  });

  // Sort by category code
  categories.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.code);
    const bIndex = categoryOrder.indexOf(b.code);
    return aIndex - bIndex;
  });

  return {
    ...rest,
    questions,
    categories,
    questionsByCategory,
  };
}

// Get answer value from provision for a specific question
export function getAnswerForQuestion(
  provision: RPProvision | undefined,
  question: OntologyQuestion
): { value: unknown; hasAnswer: boolean } {
  if (!provision) {
    return { value: undefined, hasAnswer: false };
  }

  // For multiselect questions, filter concept applicabilities
  if (question.answer_type === 'multiselect' && question.concept_type) {
    const concepts = (provision.concept_applicabilities || []).filter(
      (ca) => ca.concept_type === question.concept_type
    );
    return { 
      value: concepts, 
      hasAnswer: concepts.length > 0 
    };
  }

  // For scalar questions, look up by target_attribute or question_id
  const fieldName = question.target_attribute || question.question_id;
  const value = provision[fieldName];
  
  return {
    value,
    hasAnswer: value !== undefined && value !== null,
  };
}
