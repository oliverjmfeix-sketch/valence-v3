import type { Deal, OntologyQuestion, DealAnswer, Provenance, QAResponse, UploadResponse, DealStatus } from '@/types';

const API_URL = 'https://valencev3-production.up.railway.app';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Deals
export async function uploadDeal(file: File, dealName: string, borrower: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('deal_name', dealName);
  formData.append('borrower', borrower);

  const response = await fetch(`${API_URL}/api/deals/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getDealStatus(dealId: string): Promise<DealStatus> {
  return fetchAPI<DealStatus>(`/api/deals/${dealId}/status`);
}

export async function getDeals(): Promise<Deal[]> {
  return fetchAPI<Deal[]>('/api/deals');
}

export async function getDeal(id: string): Promise<Deal> {
  return fetchAPI<Deal>(`/api/deals/${id}`);
}

// Ontology
export async function getOntologyQuestions(): Promise<OntologyQuestion[]> {
  return fetchAPI<OntologyQuestion[]>('/api/ontology/questions');
}

// Answers
export async function getDealAnswers(dealId: string): Promise<DealAnswer[]> {
  return fetchAPI<DealAnswer[]>(`/api/deals/${dealId}/answers`);
}

// Provenance
export async function getProvenance(dealId: string, attribute: string): Promise<Provenance> {
  return fetchAPI<Provenance>(`/api/deals/${dealId}/provenance/${attribute}`);
}

// Q&A
export async function askQuestion(dealId: string, question: string): Promise<QAResponse> {
  return fetchAPI<QAResponse>(`/api/deals/${dealId}/qa`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}
