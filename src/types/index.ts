// Core domain types for MFN Navigator
// 
// SSoT Rules:
// 1. Question text comes from the backend (answer.question_text)
// 2. Category names come from the backend (answer.category_name)
// 3. Entity types come from src/types/mfn.generated.ts — never redefine here
// 4. The answers endpoint is the single source for extracted data

// ============ Deal Types ============

export interface Deal {
  deal_id: string;
  deal_name: string;
  borrower?: string;
  created_at?: string;
  upload_date?: string; // Legacy field, prefer created_at
}

export interface DealStatus {
  deal_id: string;
  status: 'pending' | 'extracting' | 'storing' | 'complete' | 'error';
  progress: number; // 0-100
  current_step: string | null;
  error_message?: string;
  error?: string; // Legacy field
}

export type UploadStatus = 'idle' | 'uploading' | 'extracting' | 'complete' | 'error';

export interface UploadResponse {
  deal_id: string;
  deal_name: string;
  status: 'processing';
  message: string;
}

// ============ Category Types ============

export interface Category {
  id: string;
  name: string;
  code: string; // A, B, C, etc.
  questionCount: number;
  answeredCount: number;
}

// ============ Q&A Types ============

export interface Citation {
  page: number;
  text: string | null;
  question_id: string | null;
}

export interface AskResponse {
  question: string;
  answer: string;
  citations: Citation[];
  data_source: {
    deal_id: string;
    answers_used: number;
    total_questions: number;
  };
}

// ============ Extracted Answers (from /api/deals/{id}/answers) ============

export interface ExtractedAnswer {
  question_id: string;
  question_text: string;
  answer_type: 'boolean' | 'currency' | 'percentage' | 'number' | 'string' | 'multiselect';
  category_id: string;
  category_name: string;
  value: unknown;
  source_text: string | null;
  source_page: number | null;
  confidence: string | null;
}

export interface AnswersResponse {
  deal_id: string;
  provision_id: string;
  extraction_complete: boolean;
  answer_count: number;
  total_questions: number;
  answers: ExtractedAnswer[];
}
