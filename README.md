# PB: Não ao cartório de 8.000%

Landing page de denúncia + abaixo-assinado eletrônico contra os aumentos de
até 8.000% nas taxas cartorárias da Paraíba (Lei Estadual 14.343/2026).

**Características:**
- Contador de assinaturas 100% real (lido do banco, jamais inventado)
- 1 assinatura por CPF **e** por conta gov.br (unicidade dupla no banco)
- Assinatura via gov.br (Login Único) para confirmar identidade
- 100% gratuito para manter (Vercel + Supabase)
- Acessível (WCAG AA), responsivo, com fontes citadas

---

## Arquivos
| Arquivo | Função |
|---|---|
| `index.html` | Página principal (frontend + lógica) |
| `callback.html` | Retorno do OAuth gov.br |
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
No `index.html` e no `callback.html`, substitua:
- `@@SUPABASE_URL@@` → a URL copiada (ex.: `https://xyz.supabase.co`)
- `@@SUPABASE_KEY@@` → a anon key copiada

(As tags restantes `@@GOVBR_*@@` são opcionais — sem elas o formulário
registra direto, mas AINDA respeita a unicidade por CPF.)

### Etapa 3 — Publicar (Vercel, grátis)
1. Crie um repositório no GitHub (`github.com` → **New repository**).
2. Faça upload de `index.html`, `callback.html` e `README.md`.
3. Acesse `vercel.com` → **Add New → Project** → escolha o repositório.
4. O Vercel detecta projeto estático (zero config) → **Deploy** (~40s).
5. Pronto: `https://nome-do-projeto.vercel.app` com HTTPS e CDN global.

**Alternativas:** Netlify (arrastar a pasta), Cloudflare Pages, GitHub Pages.

---

## 🔐 Opcional: configurar o gov.br (Login Único)

1. Crie a conta de desenvolvedor e o **app** indicando `redirect_uri`
   apontando para `https://SEU-PROJETO.vercel.app/callback.html`.
2. Preencha `@@GOVBR_CLIENT_ID@@` e `@@GOVBR_REDIRECT_URI@@` em `index.html`.

> ⚠️ **Importante (transparência):**
> A **API oficial de Assinatura Eletrônica GOV.BR** (validade jurídica plena,
> PKCS#7) exige **domínio oficial** e credencial solicitada por **Gestor
> Público** (Portaria SGD/MGI 7.076/2024). Portanto, aqui usamos a **conta
> gov.br via OAuth** apenas para **confirmar identidade** no ato da assinatura.
> Se um órgão parceiro (OAB-PB, mandato, associação) hospedar em domínio
> oficial, basta plugar a API de assinatura no mesmo fluxo.
>
> Também: para produção segura, a troca `code→token` do OAuth deve rodar em
> uma **Edge Function** do Supabase (não no navegador), para não expor o
> `client_secret`. O `callback.html` documenta o fluxo; recomendo mover essa
> troca para uma function antes de ir a produção com gov.br ativo.

---

## Sempre online e gratuito? Sim.
- Vercel free tier: sem custo, SSL automático, sem limite prático de acesso.
- Supabase free tier: banco, auth e edge functions (com teto de uso; para um
  abaixo-assinado fica folgado). Leia os limites grátis atuais do Supabase.

---

## LGPD
- CPF é opcional e usado só para garantir "uma assinatura por pessoa".
- Dados não são vendidos nem exibidos publicamente.
- Política de privacidade resumida está na página.
