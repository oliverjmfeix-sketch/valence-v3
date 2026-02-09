import { useQuery } from '@tanstack/react-query';
import { getAnswers } from '@/api/client';
import type { ExtractedAnswer, AnswersResponse, Category } from '@/types';

// Fetch all answers for a deal
export function useRPAnswers(dealId: string | undefined) {
  return useQuery<AnswersResponse>({
    queryKey: ['rp-answers', dealId],
    queryFn: () => getAnswers(dealId!),
    enabled: !!dealId,
  });
}

// Lookup a single answer by question_id
export function getAnswerByQuestionId(
  answers: ExtractedAnswer[] | undefined,
  questionId: string
): { value: unknown; hasAnswer: boolean; sourceText?: string; sourcePage?: number } {
  if (!answers) return { value: undefined, hasAnswer: false };
  const answer = answers.find(a => a.question_id === questionId);
  if (!answer || answer.value === null || answer.value === undefined) {
    return { value: undefined, hasAnswer: false };
  }
  return {
    value: answer.value,
    hasAnswer: true,
    sourceText: answer.source_text ?? undefined,
    sourcePage: answer.source_page ?? undefined,
  };
}

// Group answers into Category[] for display
export function groupAnswersByCategory(answers: ExtractedAnswer[]): {
  categories: Category[];
  answersByCategory: Map<string, ExtractedAnswer[]>;
} {
  const categoryMap = new Map<string, { name: string; answers: ExtractedAnswer[] }>();
  for (const answer of answers) {
    if (!categoryMap.has(answer.category_id)) {
      categoryMap.set(answer.category_id, { name: answer.category_name, answers: [] });
    }
    categoryMap.get(answer.category_id)!.answers.push(answer);
  }

  const categories: Category[] = Array.from(categoryMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    code: id,
    questionCount: data.answers.length,
    answeredCount: data.answers.filter(a => a.value !== null && a.value !== undefined).length,
  }));
  categories.sort((a, b) => a.code.localeCompare(b.code));

  const answersByCategory = new Map<string, ExtractedAnswer[]>();
  for (const [id, data] of categoryMap) {
    answersByCategory.set(id, data.answers);
  }
  return { categories, answersByCategory };
}
