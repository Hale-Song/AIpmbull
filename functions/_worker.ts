export interface Env {
  CMS_KV: KVNamespace;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/", "");
  const method = request.method;

  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  const [resource, id] = path.split("/");

  if (!resource) {
    return jsonResponse({ error: "Invalid API path" }, 400);
  }

  if (resource === "sync-all" && method === "POST") {
    try {
      const body = await request.json();
      for (const [key, value] of Object.entries(body)) {
        if (["articles", "products", "agents", "videos", "images", "portfolio"].includes(key)) {
          await env.CMS_KV.put(key, JSON.stringify(value));
        }
      }
      return jsonResponse({ success: true });
    } catch (error) {
      return jsonResponse({ error: "Invalid sync data" }, 400);
    }
  }

  if (resource === "seed" && method === "POST") {
    try {
      const body = await request.json();
      for (const [key, value] of Object.entries(body)) {
        await env.CMS_KV.put(key, JSON.stringify(value));
      }
      return jsonResponse({ success: true });
    } catch (error) {
      return jsonResponse({ error: "Invalid seed data" }, 400);
    }
  }

  if (method === "GET") {
    const data = await env.CMS_KV.get(resource, "json");
    return jsonResponse(data || []);
  }

  if (method === "POST") {
    try {
      const body = await request.json();
      const items = (await env.CMS_KV.get(resource, "json")) || [];
      const now = new Date().toISOString();
      const newItem = { ...body, id: generateId(), createdAt: now, updatedAt: now };
      items.unshift(newItem);
      await env.CMS_KV.put(resource, JSON.stringify(items));
      return jsonResponse(newItem, 201);
    } catch (error) {
      return jsonResponse({ error: "Invalid data" }, 400);
    }
  }

  if (method === "PUT" && id) {
    try {
      const body = await request.json();
      const items = (await env.CMS_KV.get(resource, "json")) || [];
      const index = items.findIndex((item: any) => item.id === id);
      if (index === -1) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      items[index] = { ...items[index], ...body, id, updatedAt: new Date().toISOString() };
      await env.CMS_KV.put(resource, JSON.stringify(items));
      return jsonResponse(items[index]);
    } catch (error) {
      return jsonResponse({ error: "Invalid data" }, 400);
    }
  }

  if (method === "DELETE" && id) {
    try {
      const items = (await env.CMS_KV.get(resource, "json")) || [];
      const filtered = items.filter((item: any) => item.id !== id);
      if (filtered.length === items.length) {
        return jsonResponse({ error: "Not found" }, 404);
      }
      await env.CMS_KV.put(resource, JSON.stringify(filtered));
      return jsonResponse({ success: true });
    } catch (error) {
      return jsonResponse({ error: "Delete failed" }, 500);
    }
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
}

async function translateWithMyMemory(text: string, from: string, to: string): Promise<{ result: string | null; debug?: string }> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const resp = await fetch(url);
  const body = await resp.text();
  if (!resp.ok) return { result: null, debug: `status ${resp.status}` };
  try {
    const data = JSON.parse(body) as { responseData?: { translatedText?: string }; responseStatus?: number };
    const translated = data?.responseData?.translatedText;
    if (!translated) return { result: null, debug: `no translatedText, status=${data?.responseStatus}` };
    if (translated === text) return { result: null, debug: `translated equals original` };
    return { result: translated };
  } catch {
    return { result: null, debug: `parse error: ${body.slice(0, 200)}` };
  }
}

async function translateWithGoogle(text: string, from: string, to: string): Promise<{ result: string | null; debug?: string }> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const resp = await fetch(url);
  const body = await resp.text();
  if (!resp.ok) return { result: null, debug: `status ${resp.status}` };
  try {
    const data = JSON.parse(body);
    if (!Array.isArray(data) || !data[0]) return { result: null, debug: `unexpected format` };
    const translated = data[0].map((item: unknown[]) => item[0] || "").join("");
    if (!translated) return { result: null, debug: `empty translation` };
    if (translated === text) return { result: null, debug: `translated equals original` };
    return { result: translated };
  } catch {
    return { result: null, debug: `parse error: ${body.slice(0, 200)}` };
  }
}

async function handleTranslate(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  try {
    const { text, from, to } = await request.json() as { text: string; from: string; to: string };
    if (!text || !text.trim()) {
      return jsonResponse({ translated: "" });
    }

    const mm = await translateWithMyMemory(text, from, to);
    if (mm.result) return jsonResponse({ translated: mm.result });

    const g = await translateWithGoogle(text, from, to);
    if (g.result) return jsonResponse({ translated: g.result });

    return jsonResponse({ translated: "", error: "All translation APIs failed", mm: mm.debug, google: g.debug });
  } catch (error) {
    return jsonResponse({ error: "Translation failed", details: error instanceof Error ? error.message : String(error) }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/translate") {
      return handleTranslate(request);
    }

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
