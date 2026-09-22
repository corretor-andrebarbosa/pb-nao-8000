// Edge Function: govbr-exchange
// Troca o "code" do OAuth gov.br por um token, no servidor (nunca no navegador),
// para não expor o GOVBR_CLIENT_SECRET. Depois registra a assinatura.
//
// Segredos necessários (configure em Project Settings -> Edge Functions -> Secrets):
//   GOVBR_CLIENT_ID
//   GOVBR_CLIENT_SECRET
//   GOVBR_REDIRECT_URI        (ex.: https://pare14343-26.vercel.app/callback.html)
// (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY já são injetados automaticamente
//  pelo runtime das Edge Functions do Supabase.)

const GOVBR_TOKEN_URL = "https://sso.acesso.gov.br/token";

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const { code, nome, cpf, email } = await req.json();
    if (!code || !nome) {
      return new Response(JSON.stringify({ error: "missing_code_or_nome" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("GOVBR_CLIENT_ID");
    const clientSecret = Deno.env.get("GOVBR_CLIENT_SECRET");
    const redirectUri = Deno.env.get("GOVBR_REDIRECT_URI");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "function_not_configured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 1) Troca code -> token (Basic auth com client_id:client_secret, padrão gov.br SSO)
    const basicAuth = btoa(`${clientId}:${clientSecret}`);
    const tokenRes = await fetch(GOVBR_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const detail = await tokenRes.text();
      return new Response(JSON.stringify({ error: "token_exchange_failed", detail }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const tok = await tokenRes.json();
    let sub: string | null = null;
    if (tok.id_token) {
      const payload = JSON.parse(atob(tok.id_token.split(".")[1]));
      sub = payload.sub ?? null;
    }
    if (!sub) {
      return new Response(JSON.stringify({ error: "missing_sub_claim" }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 2) Registra a assinatura (service role -> ignora RLS, checagem de unicidade
    //    continua garantida pelos índices únicos de cpf e govbr_sub no banco).
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/assinaturas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({ nome, cpf: cpf || null, email: email || null, govbr_sub: sub }),
    });

    if (insertRes.status === 409) {
      return new Response(JSON.stringify({ status: "duplicate" }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (!insertRes.ok) {
      const detail = await insertRes.text();
      return new Response(JSON.stringify({ error: "insert_failed", detail }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "unexpected_error", detail: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
