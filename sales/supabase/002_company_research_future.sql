-- W1 Sales / future Fichário prospect pipeline
--
-- DO NOT APPLY TO LEXISPREDICT. Apply ONLY to a verified, independent
-- commercial Supabase project after provisioning authenticated roles.
-- Future data is public company research, not opt-in leads.
-- No public insert, select, update or delete grants are created.
BEGIN;

CREATE TABLE IF NOT EXISTS public.sales_company_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj text NOT NULL UNIQUE CHECK (cnpj ~ '^[0-9]{14}$'),
  company_name text NOT NULL DEFAULT '' CHECK (char_length(company_name)<=200),
  company_segment text NOT NULL DEFAULT '' CHECK (char_length(company_segment)<=150),
  company_uf text CHECK (company_uf IS NULL OR company_uf ~ '^[A-Z]{2}$'),
  cnae text CHECK (cnae IS NULL OR cnae ~ '^[0-9]{7}$'),
  source_id text NOT NULL DEFAULT 'fichario_genesis_innovation'
    CHECK (source_id='fichario_genesis_innovation'),
  source_url text NOT NULL
    CHECK (source_url ~ '^https://cnpj[.]genesisinnovation[.]io/cnpj/[0-9]{14}$'),
  source_base text,
  source_retrieved_at timestamptz,
  source_credit text NOT NULL DEFAULT
    'Fonte: Fichário (cnpj.genesisinnovation.io), dados abertos da Receita Federal',
  workflow_stage text NOT NULL DEFAULT 'pesquisa'
    CHECK (workflow_stage IN ('pesquisa','revisao','qualificada','descartada')),
  reviewed_by_human boolean NOT NULL DEFAULT false,
  contact_allowed boolean NOT NULL DEFAULT false,
  legal_basis_reviewed boolean NOT NULL DEFAULT false,
  reviewer_auth_user_id uuid,
  reviewed_at timestamptz,
  internal_notes text NOT NULL DEFAULT '' CHECK (char_length(internal_notes)<=1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT not_an_automatically_approved_lead CHECK
    (NOT contact_allowed OR (reviewed_by_human AND legal_basis_reviewed AND reviewed_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS sales_company_research_stage_idx
  ON public.sales_company_research(workflow_stage,created_at DESC);

ALTER TABLE public.sales_company_research ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sales_company_research FROM anon, authenticated;
-- No policies: API requests from anonymous and normal authenticated browser
-- sessions cannot access company research records. A future private backend
-- must implement authorization + audit before any read or write is enabled.

COMMENT ON TABLE public.sales_company_research IS
  'Future W1 Sales prospect research. Public company data are not opt-in leads. No direct public API access; separated from legal case CRM.';

COMMIT;
