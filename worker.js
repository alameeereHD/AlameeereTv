export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const SECRET = "Alam33re#2026";
    const VALIDITY = 2 * 60 * 60 * 1000;
    async function makeToken(ts) {
      const w = Math.floor(ts / VALIDITY);
      const data = new TextEncoder().encode(`${SECRET}:${w}`);
      const hash = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("").substring(0,24);
    }
    const BASE = "http://ahm79.store/live/0545580310/7337741654/";
    const CHANNELS = {
      "bein1":  BASE+"14670.m3u8",
      "bein2":  BASE+"769629.m3u8",
      "bein3":  BASE+"14672.m3u8",
      "bein4":  BASE+"14673.m3u8",
      "bein5":  BASE+"14657.m3u8",
      "8a-j1":  BASE+"746713.m3u8",
      "8a-j2":  BASE+"746716.m3u8",
      "8b":     BASE+"746717.m3u8",
      "8c-j1":  BASE+"746719.m3u8",
      "8c-j2":  BASE+"746720.m3u8",
      "alwan1-j1": BASE+"772277.m3u8",
      "alwan1-j2": BASE+"772276.m3u8",
      "alwan2-j1": BASE+"772274.m3u8",
      "alwan2-j2": BASE+"772273.m3u8",
      "alwan3-j1": BASE+"772270.m3u8",
      "alwan3-j2": BASE+"772269.m3u8",
    };
    if (path === "/token") {
      const now = Date.now();
      const token = await makeToken(now);
      const expires = VALIDITY - (now % VALIDITY);
      return new Response(JSON.stringify({ token, expires }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/stream") {
      const ch = url.searchParams.get("ch");
      const token = url.searchParams.get("token");
      if (!token || !ch) return new Response("Missing params", { status: 400, headers: corsHeaders });
      const now = Date.now();
      const cur = await makeToken(now);
      const prev = await makeToken(now - VALIDITY);
      if (token !== cur && token !== prev) return new Response("Token Expired", { status: 403, headers: corsHeaders });
      const streamUrl = CHANNELS[ch];
      if (!streamUrl) return new Response("Not Found", { status: 404, headers: corsHeaders });
      try {
        const resp = await fetch(streamUrl, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
        return new Response(resp.body, { status: resp.status, headers: { ...corsHeaders, "Content-Type": resp.headers.get("Content-Type") || "application/vnd.apple.mpegurl" } });
      } catch(e) { return new Response(`Error: ${e.message}`, { status: 500, headers: corsHeaders }); }
    }
    return new Response("Not Found", { status: 404 });
  }
};
