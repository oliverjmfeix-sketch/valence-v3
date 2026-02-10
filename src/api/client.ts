import type { 
  Deal, 
  DealStatus, 
  UploadResponse,
  AskResponse,
  AnswersResponse,
  EvalResult
} from '@/types';

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

// ============ Deals ============

export async function getDeals(): Promise<Deal[]> {
  return fetchAPI<Deal[]>('/api/deals');
}

export async function getDeal(dealId: string): Promise<Deal> {
  return fetchAPI<Deal>(`/api/deals/${dealId}`);
}

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

// ============ Q&A ============

export async function askDealQuestion(dealId: string, question: string): Promise<AskResponse> {
  return fetchAPI<AskResponse>(`/api/deals/${dealId}/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

// ============ Extracted Answers ============

export async function getAnswers(dealId: string): Promise<AnswersResponse> {
  return fetchAPI<AnswersResponse>(`/api/deals/${dealId}/answers`);
}

// ============ Delete Deal ============

export async function deleteDeal(dealId: string): Promise<void> {
  await fetchAPI<void>(`/api/deals/${dealId}`, {
    method: 'DELETE',
  });
}

// ============ Health Check ============

export async function healthCheck(): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>('/health');
}

// ============ Eval ============

export async function runEval(
  dealId: string,
  numQuestions: number,
  categories: string[]
): Promise<EvalResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 900_000);

  try {
    const response = await fetch(`${API_URL}/api/deals/${dealId}/eval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num_questions: numQuestions, categories }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(text || `API Error: ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============ Batched Status Fetching ============

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function getDealStatusesBatch(dealIds: string[]): Promise<Record<string, DealStatus>> {
  if (dealIds.length === 0) return {};

  const response = await fetch(`${SUPABASE_URL}/functions/v1/deal-statuses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deal_ids: dealIds }),
  });

  if (!response.ok) {
    console.error('Failed to fetch batched statuses:', response.status);
    return {};
  }

  const data = await response.json();
  return data.statuses || {};
}
