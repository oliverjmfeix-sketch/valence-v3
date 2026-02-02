// Core domain types

export interface Deal {
  id: string;
  name: string;
  borrower: string;
  upload_date: string;
}

export interface OntologyQuestion {
  id: string;
  text: string;
  category: 'mfn' | 'rp' | 'pattern';
  subcategory?: string;
  target_attribute: string;
  answer_type: 'boolean' | 'number' | 'string' | 'date';
}

export interface DealAnswer {
  question_id: string;
  answer: boolean | number | string | null;
  has_provenance: boolean;
}

export interface Provenance {
  source_text: string;
  page_number: number;
  section: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface QAResponse {
  answer: string;
  evidence: Array<{
    primitive: string;
    value: string | number | boolean;
    source?: string;
  }>;
}

export interface UploadResponse {
  deal_id: string;
  deal_name: string;
  status: 'processing';
  message: string;
}

export interface DealStatus {
  deal_id: string;
  status: 'pending' | 'extracting' | 'storing' | 'complete' | 'error';
  progress: number;
  current_step: string | null;
  error: string | null;
}

export type UploadStatus = 'idle' | 'uploading' | 'extracting' | 'complete' | 'error';
