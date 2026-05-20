-- ============================================================
-- agencia-sites — Schema Supabase
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id                UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ  DEFAULT now() NOT NULL,
  nome              TEXT         NOT NULL,
  cidade            TEXT         NOT NULL DEFAULT '',
  nicho             TEXT         NOT NULL DEFAULT '',
  telefone          TEXT         NOT NULL DEFAULT '',
  instagram         TEXT,
  preview_url       TEXT,
  status            TEXT         NOT NULL DEFAULT 'novo'
                                 CHECK (status IN ('novo', 'aguardando_preview', 'negociacao', 'fechado', 'entregue')),
  ticket            NUMERIC,
  notas             TEXT,
  nome_negocio      TEXT         NOT NULL DEFAULT '',
  servico_principal TEXT         NOT NULL DEFAULT '',
  cor_marca         TEXT,
  site_atual        TEXT
);

-- Índice para buscas por status (kanban)
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Permissão total via anon key (ajuste conforme sua política de segurança)
-- Em produção, use autenticação e restrinja o acesso
CREATE POLICY "anon_full_access" ON public.leads
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Realtime — permite que o dashboard receba updates em tempo real
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- ============================================================
-- Dados de exemplo para teste
-- ============================================================

INSERT INTO public.leads (nome, nome_negocio, servico_principal, cidade, nicho, telefone, status, cor_marca)
VALUES
  ('Maria Silva', 'Beleza da Maria', 'Corte e coloração', 'São Paulo', 'Salão de Beleza', '11999990001', 'aguardando_preview', '#FF69B4'),
  ('João Pereira', 'Pizza do João', 'Pizzas artesanais', 'Campinas', 'Restaurante', '19988880002', 'novo', null),
  ('Ana Costa', 'Clínica Ana Costa', 'Fisioterapia', 'Rio de Janeiro', 'Saúde', '21977770003', 'negociacao', '#4A90D9'),
  ('Carlos Mendes', 'Auto Mendes', 'Mecânica geral', 'Belo Horizonte', 'Automotivo', '31966660004', 'fechado', null)
ON CONFLICT DO NOTHING;
