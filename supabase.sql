-- =====================================================
-- PB: Não ao cartório de 8.000%
-- Script completo do banco (Supabase Postgres)
-- Garante UNICIDADE por CPF E por conta gov.br
-- =====================================================

-- 1. Tabela principal
create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  cpf text,                 -- opcional, somente dígitos
  govbr_sub text,           -- identificador único da conta gov.br
  criado_em timestamptz not null default now()
);

-- 2. Índices de unicidade (defesa em profundidade)
--    Uma assinatura por CPF (quando informado)
create unique index if not exists assinaturas_cpf_uniq
  on public.assinaturas (cpf)
  where cpf is not null;

--    Uma assinatura por conta gov.br (quando autenticado)
create unique index if not exists assinaturas_govbr_uniq
  on public.assinaturas (govbr_sub)
  where govbr_sub is not null;

-- 3. View de contagem REAL (o frontend lê exatamente daqui)
create or replace view public.contador_assinaturas as
  select count(*) as total from public.assinaturas;

-- 4. Row Level Security
alter table public.assinaturas enable row level security;

--    Leitura da contagem liberada a todos (somente a view precisa)
drop policy if exists "le_contagem_publica" on public.contador_assinaturas;
create policy"le_contagem_publica" on public.contador_assinaturas
  for select using (true);

--    Insert controlado (qualquer um pode assinar, com regras de unicidade
--    já garantidas pelos índices únicos acima)
drop policy if exists "insert_permitido" on public.assinaturas;
create policy "insert_permitido" on public.assinaturas
  for insert with check (true);

--    Nega leitura da tabela cheia (dados pessoais) para anônimos
drop policy if exists "le_dados_negada_anonimo" on public.assinaturas;
create policy "le_dados_negada_anonimo" on public.assinaturas
  for select using (false);

--    Nega update/delete anônimo
drop policy if exists "sem_update" on public.assinaturas;
create policy "sem_update" on public.assinaturas
  for update using (false);
drop policy if exists "sem_delete" on public.assinaturas;
create policy "sem_delete" on public.assinaturas
  for delete using (false);
