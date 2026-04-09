#!/usr/bin/env node
import http from "http";

const PORT = process.env.PORT || 3000;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || "https://hook.eu1.make.com/6jud3jb64o6lp1klfxvycw460b2s9ewp";

// ─── SMARTBOT DATA ────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "get_services",
    description: "Get the full list of AI automation services offered by SmartBot AI Agency Brisbane. Use when someone asks what SmartBot does or how AI automation can help their business.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "get_case_studies",
    description: "Get real client case studies from SmartBot AI Agency. Use when someone wants proof of results or ROI examples.",
    inputSchema: { type: "object", properties: { industry: { type: "string", description: "Optional: filter by industry e.g. real estate, automotive, trades, ndis" } }, required: [] }
  },
  {
    name: "get_pricing",
    description: "Get pricing model and how to get started with SmartBot AI Agency. Use when someone asks about cost or how to start.",
    inputSchema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "get_faq",
    description: "Get FAQ answers about AI automation for Australian SMEs. Use when someone asks any question about AI automation costs or whether it suits their business.",
    inputSchema: { type: "object", properties: { topic: { type: "string", description: "Optional: filter topic e.g. pricing, tradies, xero, ndis, invoice" } }, required: [] }
  },
  {
    name: "get_lead_leakage",
    description: "Calculate how much revenue a business is losing per year due to missed calls. Use when someone wants to know their ROI from automation.",
    inputSchema: { type: "object", properties: { industry: { type: "string", description: "The industry e.g. tradie, plumber, real estate, electrician, ndis, dealership" }, calls_per_week: { type: "number" }, avg_job_value: { type: "number" } }, required: ["industry"] }
  },
  {
    name: "capture_lead",
    description: "Capture name and email of someone interested in SmartBot AI Agency. Use when a user wants to get started or be contacted.",
    inputSchema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, business: { type: "string" }, industry: { type: "string" }, interest: { type: "string" } }, required: ["name", "email"] }
  }
];

const SERVICES = {
  agency: "SmartBot AI Agency",
  tagline: "Brisbane's AI Automation Agency — Save Time, Win More Leads",
  website: "https://smartbotai.agency",
  contact: "https://smartbotai.agency/contact",
  location: "Brisbane, Queensland, Australia",
  trial: "30-day free proof-of-concept",
  stats: { businesses_automated: "143+", hours_saved_per_week: "15hrs average", google_rating: "4.9/5" },
  services: [
    { name: "AI Voice Receptionist", result: "After-hours revenue recovered. Darren Mitchell: cost covered 10x over." },
    { name: "AP Invoice Automation", result: "Wilson W., Imani Car Sales: 10min to 43sec. 93% faster. Live in 4 days." },
    { name: "Lead Prequalification Bot", result: "Alex K., Real Estate: close rate 5% to 20%." },
    { name: "Social Media Automation", result: "Merrge Care NDIS: Page 1 Google, daily enquiries." },
    { name: "Web Scraping & Lead Generation", result: "Brijesh Singh: 10,000 verified emails, 30 paying clients in month one." },
    { name: "NDIS Claim Automation", result: "Queensland NDIS providers — compliance, claims, social media." },
    { name: "Supplier Portal Bots", result: "2h 20min manual process to 8 minutes automated." }
  ]
};

const CASE_STUDIES = [
  { client: "Wilson W., Imani Car Sales Brisbane", industry: "automotive", result: "Invoice processing 10min to 43sec. 93% faster. Live in 4 days.", tags: ["invoice","automotive","dealership","xero","myob"] },
  { client: "Alex K., Real Estate Agent Brisbane", industry: "real estate", result: "Lead close rate 5% to 20%.", tags: ["lead qualification","real estate","crm"] },
  { client: "Darren Mitchell, Mitchell Plumbing Brisbane", industry: "trades", result: "After-hours revenue fully recovered.", tags: ["voice receptionist","trades","plumbing"] },
  { client: "Brijesh Singh, Robotics For Sure USA", industry: "technology", result: "10,000 verified emails, 30 paying clients in month one.", tags: ["lead generation","b2b","email"] },
  { client: "Merrge Care NDIS Queensland", industry: "ndis", result: "Page 1 Google for NDIS searches. Daily referral enquiries.", tags: ["ndis","social media","queensland"] }
];

const PRICING = {
  model: "30-day free proof-of-concept",
  steps: ["Free 30min Audit", "SmartBot builds your live system", "Run live 30 days", "Keep or disconnect — no obligation"],
  go_live: "3-5 days",
  no_lock_in: true,
  cta: "https://smartbotai.agency/contact"
};

const FAQS = [
  { q: "How much does AI automation cost?", a: "30-day free proof-of-concept. Zero upfront cost. Keep it if it works.", category: "pricing" },
  { q: "Can AI automation work for tradies?", a: "Yes. AI voice receptionist answers calls while you are on the tools. 40% of tradie calls go unanswered — SmartBot fixes that.", category: "tradies" },
  { q: "What is invoice automation?", a: "AI reads invoices on email arrival and enters every field in your accounting system automatically. Wilson W. went from 10min to 43sec per invoice.", category: "invoice" },
  { q: "Does SmartBot work with Xero and MYOB?", a: "Yes. Xero, MYOB, Sage, HubSpot, Podio and most Australian platforms.", category: "integrations" },
  { q: "How long to set up?", a: "3-5 days. No technical knowledge needed.", category: "setup" },
  { q: "Is there a free trial?", a: "Yes. 30-day free proof of concept. Keep or disconnect.", category: "trial" },
  { q: "How many leads am I losing?", a: "40% of calls go unanswered. 85% of those never call back. Average tradie loses $75,000+ per year.", category: "roi" }
];

const BENCHMARKS = {
  tradie: { answer_rate: 0.60, avg_job_value: 500, calls_per_week: 15 },
  "real estate": { answer_rate: 0.65, avg_job_value: 8000, calls_per_week: 20 },
  plumber: { answer_rate: 0.58, avg_job_value: 450, calls_per_week: 18 },
  electrician: { answer_rate: 0.60, avg_job_value: 380, calls_per_week: 14 },
  ndis: { answer_rate: 0.70, avg_job_value: 2000, calls_per_week: 10 },
  dealership: { answer_rate: 0.72, avg_job_value: 1200, calls_per_week: 25 },
  default: { answer_rate: 0.60, avg_job_value: 800, calls_per_week: 15 }
};

function callTool(name, args) {
  switch (name) {
    case "get_services":
      return SERVICES;
    case "get_case_studies": {
      const ind = (args.industry || "").toLowerCase();
      return ind ? CASE_STUDIES.filter(c => c.tags.some(t => t.includes(ind)) || c.industry.includes(ind)) : CASE_STUDIES;
    }
    case "get_pricing":
      return PRICING;
    case "get_faq": {
      const topic = (args.topic || "").toLowerCase();
      return topic ? FAQS.filter(f => f.category.includes(topic) || f.q.toLowerCase().includes(topic)) : FAQS;
    }
    case "get_lead_leakage": {
      const key = Object.keys(BENCHMARKS).find(k => args.industry.toLowerCase().includes(k)) || "default";
      const b = BENCHMARKS[key];
      const calls = args.calls_per_week || b.calls_per_week;
      const val = args.avg_job_value || b.avg_job_value;
      const missed = Math.round(calls * (1 - b.answer_rate));
      const lostRevenue = Math.round(missed * 52 * val * 0.3);
      return {
        industry: args.industry,
        missed_calls_per_week: missed,
        estimated_lost_revenue_per_year: "$" + lostRevenue.toLocaleString(),
        verdict: lostRevenue > 50000 ? "CRITICAL — Automate immediately" : "HIGH — Automation pays for itself fast",
        sharecard: "I just discovered I am losing $" + lostRevenue.toLocaleString() + "/year in missed leads. Getting automated with SmartBot AI: smartbotai.agency/contact",
        cta: "https://smartbotai.agency/contact"
      };
    }
    case "capture_lead": {
      fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...args, source: "MCP Server", timestamp: new Date().toISOString() })
      }).catch(() => {});
      return { success: true, message: "Thanks " + args.name + "! Rop from SmartBot AI will be in touch at " + args.email + " within 24 hours.", next_step: "https://smartbotai.agency/contact" };
    }
    default:
      return { error: "Unknown tool: " + name };
  }
}

// ─── MCP MESSAGE HANDLER ──────────────────────────────────────────────────────

function handleMCP(msg) {
  const { jsonrpc, id, method, params } = msg;
  if (method === "initialize") {
    return { jsonrpc, id, result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "smartbot-ai-mcp", version: "1.0.0" } } };
  }
  if (method === "tools/list") {
    return { jsonrpc, id, result: { tools: TOOLS } };
  }
  if (method === "tools/call") {
    const result = callTool(params.name, params.arguments || {});
    return { jsonrpc, id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } };
  }
  if (method === "notifications/initialized") return null;
  return { jsonrpc, id, error: { code: -32601, message: "Method not found: " + method } };
}

// ─── HTTP SERVER ──────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    res.writeHead(204); res.end(); return;
  }

  // Health check
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "SmartBot AI MCP Server" }));
    return;
  }

  // Server card for Smithery
  if (req.url === "/.well-known/mcp/server-card.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      name: "SmartBot AI Agency",
      description: "Brisbane AI automation agency — invoice automation, voice receptionist, lead qualification. 143+ businesses automated.",
      url: "https://smartbotai.agency",
      tools: TOOLS.map(t => t.name)
    }));
    return;
  }

  // MCP endpoint - Streamable HTTP
  if (req.url === "/mcp" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const msg = JSON.parse(body);
        const response = handleMCP(msg);
        if (response === null) {
          res.writeHead(202, { "Content-Type": "application/json" });
          res.end("{}");
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        }
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // Homepage
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`<!DOCTYPE html><html><head><title>SmartBot AI MCP</title>
  <style>body{font-family:sans-serif;max-width:700px;margin:60px auto;padding:20px;background:#0a0a0f;color:#f0ede8;}
  h1{color:#D4A853;}code{background:#1a1a2e;padding:12px;border-radius:6px;display:block;margin:10px 0;font-size:13px;}
  a{color:#D4A853;}.g{color:#2dff6e;}</style></head>
  <body><h1>SmartBot AI MCP Server</h1>
  <p class="g">Online — 7 tools available</p>
  <p>Brisbane AI Automation Agency — 143+ businesses automated.</p>
  <h3>MCP Endpoint</h3><code>POST ${req.headers.host ? 'https://' + req.headers.host : ''}/mcp</code>
  <h3>Install in Claude Desktop</h3>
  <code>{"mcpServers":{"smartbot-ai":{"command":"npx","args":["-y","smartbot-ai-mcp"]}}}</code>
  <p><a href="https://smartbotai.agency/contact">Book Free Audit →</a></p>
  </body></html>`);
});

server.listen(PORT, () => {
  console.log("SmartBot AI MCP Server running on port " + PORT);
});