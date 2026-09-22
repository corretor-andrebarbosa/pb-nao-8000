-- =====================================================
-- PB: Não ao cartório de 8.000%
-- Script completo do banco (Supabase Postgres)
-- Assinatura = nome + CPF. Garante UNICIDADE por CPF.
-- =====================================================

-- 1. Tabela principal
create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text not null,        -- somente dígitos
  criado_em timestamptz not null default now()
);

-- 2. Índice de unicidade (defesa em profundidade — 1 assinatura por CPF)
create unique index if not exists assinaturas_cpf_uniq
  on public.assinaturas (cpf);

-- 3. View de contagem REAL (o frontend lê exatamente daqui)
create or replace view public.contador_assinaturas as
  select count(*) as total from public.assinaturas;

-- 4. Row Level Security
alter table public.assinaturas enable row level security;

--    (A view contador_assinaturas roda com os privilégios do dono e não
--    precisa/aceita policy própria — policies só existem em tabelas.)

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
