# PB: Não ao cartório de 8.000%

Landing page de denúncia + abaixo-assinado eletrônico contra os aumentos de
até 8.000% nas taxas cartorárias da Paraíba (Lei Estadual 14.343/2026).

**Características:**
- Contador de assinaturas 100% real (lido do banco, jamais inventado)
- Assinatura simples: nome completo + CPF
- 1 assinatura por CPF (unicidade garantida no banco)
- 100% gratuito para manter (Vercel + Supabase)
- Acessível (WCAG AA), responsivo, com fontes citadas

---

## Arquivos
| Arquivo | Função |
|---|---|
| `index.html` | Página principal (frontend + lógica) |
| `supabase.sql` | Criação do banco (tabela, índice único, view, políticas) |

---

## 🚀 Deploy gratuito em ~30 minutos

### Etapa 1 — Banco de dados (Supabase, grátis)
1. Acesse `supabase.com` → **Start your project** (login com GitHub).
2. Crie um projeto (região **South America - São Paulo**).
3. No menu lateral: **SQL Editor** → **New query** → cole o conteúdo de
   `supabase.sql` → **Run**.
4. Em **Settings → API**, copie: **URL** e **anon public key**.

### Etapa 2 — Preencha a configuração
No `index.html`, substitua:
- `SUPABASE_URL` → a URL copiada (ex.: `https://xyz.supabase.co`)
- `SUPABASE_KEY` → a anon key copiada

### Etapa 3 — Publicar (Vercel, grátis)
1. Crie um repositório no GitHub (`github.com` → **New repository**).
2. Faça upload de `index.html` e `README.md`.
3. Acesse `vercel.com` → **Add New → Project** → escolha o repositório.
4. O Vercel detecta projeto estático (zero config) → **Deploy** (~40s).
5. Pronto: `https://nome-do-projeto.vercel.app` com HTTPS e CDN global.

**Alternativas:** Netlify (arrastar a pasta), Cloudflare Pages, GitHub Pages.

---

## Sempre online e gratuito? Sim.
- Vercel free tier: sem custo, SSL automático, sem limite prático de acesso.
- Supabase free tier: banco de dados com teto de uso generoso para um
  abaixo-assinado. Leia os limites grátis atuais do Supabase.

---

## LGPD
- CPF é obrigatório e usado só para garantir "uma assinatura por pessoa".
- Dados não são vendidos nem exibidos publicamente (RLS bloqueia leitura
  anônima da tabela; só a contagem agregada é pública).
- Política de privacidade resumida está na página.
