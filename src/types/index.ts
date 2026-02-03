// Core domain types for Valence Covenant Intelligence Platform

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

// ============ RP Provision Types ============

export interface RPProvision {
  provision_id: string;
  deal_id: string;
  
  // General Structure (Category A)
  general_dividend_prohibition_exists?: boolean;
  
  // Management Equity (Category C)
  mgmt_equity_basket_exists?: boolean;
  mgmt_equity_annual_cap_usd?: number;
  mgmt_equity_cumulative_cap_usd?: number;
  mgmt_equity_purchase_permitted?: boolean;
  mgmt_equity_repurchase_trigger_exists?: boolean;
  mgmt_equity_clawback_cap_usd?: number;
  
  // Builder Basket (Category F)
  builder_basket_exists?: boolean;
  builder_starter_amount_usd?: number;
  builder_cni_addition_pct?: number;
  builder_retained_epo_permitted?: boolean;
  builder_equity_issuance_permitted?: boolean;
  builder_debt_issuance_permitted?: boolean;
  builder_asset_sale_permitted?: boolean;
  builder_insurance_proceeds_permitted?: boolean;
  
  // Ratio Basket (Category G)
  ratio_dividend_basket_exists?: boolean;
  ratio_leverage_threshold?: number;
  ratio_basket_unlimited?: boolean;
  ratio_basket_cap_usd?: number;
  
  // J.Crew Blocker (Category K)
  jcrew_blocker_exists?: boolean;
  jcrew_blocker_ip_transfer_restricted?: boolean;
  jcrew_blocker_material_asset_protected?: boolean;
  jcrew_blocker_unrestricted_sub_limited?: boolean;
  jcrew_blocker_designation_restrictions?: boolean;
  jcrew_blocker_trapdoor_blocked?: boolean;
  jcrew_blocker_rating_downgrade_protection?: boolean;
  jcrew_blocker_overall_strength?: 'strong' | 'moderate' | 'weak' | 'none';
  
  // Pattern Detection (Category Z)
  jcrew_risk_level?: 'high' | 'moderate' | 'low' | 'none';
  serta_risk_level?: 'high' | 'moderate' | 'low' | 'none';
  collateral_leakage_risk?: 'high' | 'moderate' | 'low' | 'none';
  
  // Dynamic scalar fields (the API may return additional fields)
  [key: string]: string | number | boolean | ConceptApplicability[] | undefined;
  
  // Multiselect answers as concept applicabilities
  concept_applicabilities: ConceptApplicability[];
}

export interface ConceptApplicability {
  concept_type: string;  // e.g., "covered_person", "builder_source"
  concept_id: string;    // e.g., "current_officers", "bs_net_income"
  concept_name: string;  // e.g., "Current Officers", "Net Income"
  applicability_status: 'INCLUDED' | 'EXCLUDED';
  source_text: string;
  source_page: number;
}

// ============ Ontology Types ============

export interface OntologyQuestion {
  question_id: string;
  question_text: string;
  answer_type: 'boolean' | 'currency' | 'percentage' | 'number' | 'multiselect';
  category_id: string;
  category_name: string;
  target_attribute?: string;
  concept_type?: string; // For multiselect questions
}

export interface OntologyQuestionsResponse {
  questions: OntologyQuestion[];
}

export interface OntologyConcept {
  concept_id: string;
  concept_name: string;
  concept_type: string;
  description?: string;
}

export interface OntologyConceptsResponse {
  concepts: OntologyConcept[];
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

export interface QAResponse {
  answer: string;
  evidence?: Array<{
    primitive: string;
    value: string | number | boolean;
    source?: string;
  }>;
  relevant_fields?: Record<string, unknown>;
}

// ============ Provenance Types ============

export interface Provenance {
  source_text: string;
  page_number: number;
  section?: string;
  confidence?: 'high' | 'medium' | 'low';
}

// ============ Legacy Types (for backwards compatibility) ============

export interface DealAnswer {
  question_id: string;
  answer: boolean | number | string | null;
  has_provenance: boolean;
}
