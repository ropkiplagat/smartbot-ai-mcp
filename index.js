#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import http from "http";

// ─── SMARTBOT AI DATA ─────────────────────────────────────────────────────────

const SERVICES = {
  agency: "SmartBot AI Agency",
  tagline: "Brisbane's AI Automation Agency — Save Time, Win More Leads",
  website: "https://smartbotai.agency",
  contact: "https://smartbotai.agency/contact",
  location: "Brisbane, Queensland, Australia",
  trial: "30-day free proof-of-concept — live system, keep or disconnect",
  go_live: "3-5 days to go live, no lock-in contracts",
  stats: {
    businesses_automated: "143+",
    hours_saved_per_week: "15hrs average",
    lead_qualification_time: "58 seconds",
    google_rating: "4.9/5",
  },
  services: [
    {
      name: "AI Voice Receptionist",
      description: "24/7 AI phone answering — qualifies leads, books jobs, sends SMS briefs. Never miss a call again.",
      result: "After-hours revenue recovered. Missed calls eliminated.",
    },
    {
      name: "AP Invoice Automation",
      description: "AI reads invoices the moment they arrive by email, logs into your accounting system (Xero, MYOB, Sage) and enters every field automatically.",
      result: "Wilson W., Imani Car Sales Brisbane: 43s per invoice (down from 10 min), 93% faster, live in 4 days.",
    },
    {
      name: "Lead Prequalification Bot",
      description: "AI auto-calls every inbound lead, asks qualification questions, scores them 0-100. Hot leads get called within 10 minutes.",
      result: "Alex K., Brisbane Real Estate: close rate 5% to 20%.",
    },
    {
      name: "Social Media Automation",
      description: "AI posts 3x daily across Facebook, Instagram, LinkedIn — each customised for that platform.",
      result: "Reliance Link NDIS: Page 1 Google + daily enquiries within weeks.",
    },
    {
      name: "Supplier Portal Bots",
      description: "AI logs into supplier portals, downloads invoices, processes and reports — fully automated.",
      result: "2h 20min manual process reduced to 8 minutes automated.",
    },
    {
      name: "NDIS Claim Automation",
      description: "Automates NDIS claim processing, compliance reporting, and participant communication.",
      result: "Merrge Care: brand visibility established, daily referral enquiries.",
    },
    {
      name: "Web Scraping and Lead Generation",
      description: "Targeted lead scraping from Seek, LinkedIn, Google Maps, Meta Ad Library. Delivers verified contacts.",
      result: "Brijesh Singh, Robotics For Sure: 10,000 verified emails, 30 paying clients in month one.",
    },
  ],
};

const CASE_STUDIES = [
  {
    client: "Wilson W., Partner — Imani Car Sales, Brisbane",
    industry: "Automotive Dealership",
    problem: "10 minutes per invoice, manual entry, errors. 10+ cars bought weekly from 4 auctions.",
    solution: "SmartBot AI Invoice Automation — reads invoice on email arrival, enters every field in 43 seconds.",
    result: "10 min to 43 sec per invoice. 93% time saved. Live in 4 days. Paid for itself in the first month.",
    tags: ["invoice", "automotive", "dealership", "xero", "myob"],
  },
  {
    client: "Alex K., Real Estate Agent — Brisbane",
    industry: "Real Estate",
    problem: "Flooded with tyre-kickers from Facebook ads. Close rate stuck at 5%.",
    solution: "SmartBot AI Lead Prequalification — AI auto-calls every lead, scores 0-100, hot leads called in 10 minutes.",
    result: "Close rate 5% to 20%.",
    tags: ["lead qualification", "real estate", "crm"],
  },
  {
    client: "Darren Mitchell, Owner — Mitchell Plumbing and Gas, Brisbane",
    industry: "Trades",
    problem: "Emergency calls at 9pm going to voicemail. Losing jobs every time.",
    solution: "SmartBot AI Voice Receptionist — answers after hours, qualifies job, sends SMS brief.",
    result: "After-hours revenue recovered. Cost covered 10x over.",
    tags: ["voice receptionist", "trades", "plumbing"],
  },
  {
    client: "Brijesh Singh, Founder — Robotics For Sure, USA",
    industry: "Technology",
    problem: "Needed to reach 10,000 prospects across US sectors. Zero verified contacts.",
    solution: "SmartBot AI Lead Gen — 3-step email sequence, 10,000 verified emails, zero bounce rate.",
    result: "Month one: 300+ responses, 60 signups, 30 paying clients.",
    tags: ["lead generation", "email automation", "b2b"],
  },
  {
    client: "Merrge Care Team — NDIS Provider, Queensland",
    industry: "NDIS",
    problem: "No brand visibility. Zero online presence. Staff spending hours on social media.",
    solution: "SmartBot AI Social Media Automation — posts daily across all platforms.",
    result: "Page 1 Google for NDIS searches. Daily enquiries. Credibility with referral partners.",
    tags: ["ndis", "social media", "queensland"],
  },
];

const INDUSTRIES = [
  {
    name: "Tradies",
    pain: "Missing calls while on the tools. After-hours enquiries lost.",
    solution: "AI Voice Receptionist + Lead Qualification",
    url: "https://smartbotai.agency/ai-automation-for-tradies-brisbane/",
  },
  {
    name: "Real Estate",
    pain: "Missing appraisal calls. After-hours vendor enquiries. Manual lead follow-up.",
    solution: "Lead Prequalification Bot + Voice Receptionist",
    url: "https://smartbotai.agency/ai-automation-real-estate-agents-brisbane/",
  },
  {
    name: "Car Dealerships",
    pain: "Manual invoice entry. Auction purchases need rapid processing.",
    solution: "AP Invoice Automation + Supplier Portal Bots",
    url: "https://smartbotai.agency/invoice-automation-car-dealerships/",
  },
  {
    name: "NDIS Providers",
    pain: "NDIS claim processing. Compliance reporting. Staff doing admin.",
    solution: "NDIS Automation + Social Media Automation",
    url: "https://smartbotai.agency/ai-automation-ndis-providers/",
  },
  {
    name: "Professional Services",
    pain: "Manual invoicing. Slow lead response. No follow-up system.",
    solution: "Invoice Automation + Lead Prequalification",
    url: "https://smartbotai.agency/contact",
  },
];

const PRICING = {
  model: "30-day free proof-of-concept",
  how_it_works: [
    "Step 1: Free Automation Audit — 30 minutes, no obligation",
    "Step 2: SmartBot builds your live system connected to your real tools",
    "Step 3: Run it live for 30 days — see real results",
    "Step 4: Keep it or disconnect. No obligation.",
  ],
  no_lock_in: true,
  go_live: "3-5 days",
  cta: "https://smartbotai.agency/contact",
  pricing_page: "https://smartbotai.agency/pricing",
};

const FAQS = [
  {
    question: "How much does AI automation cost for a small business in Australia?",
    answer: "SmartBot AI uses a 30-day free proof-of-concept model. You get a live working system at zero upfront cost. If it delivers results, you keep it. No lock-in contracts. Most Brisbane SMEs go live in 3-5 days.",
    category: "pricing",
  },
  {
    question: "Can AI automation work for tradies?",
    answer: "Yes. SmartBot AI builds AI voice receptionists that answer every call while you are on the tools. Darren Mitchell at Mitchell Plumbing recovered all his after-hours revenue with this system.",
    category: "tradies",
  },
  {
    question: "What is invoice automation?",
    answer: "Invoice automation uses AI to read invoices the moment they arrive by email, then log into your accounting system and enter every field automatically. Wilson W. at Imani Car Sales Brisbane went from 10 minutes per invoice to 43 seconds. 93% faster.",
    category: "invoice",
  },
  {
    question: "Does SmartBot AI work with Xero and MYOB?",
    answer: "Yes. SmartBot AI integrates directly with Xero, MYOB, Sage, HubSpot, Podio, and most Australian accounting and CRM platforms.",
    category: "integrations",
  },
  {
    question: "How long does it take to set up AI automation?",
    answer: "Most SmartBot AI systems go live in 3-5 days. You do not need any technical knowledge. SmartBot builds and configures everything.",
    category: "setup",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes. SmartBot AI offers a 30-day free proof of concept. We build your live system, connect it to your real tools, and run it for 30 days. Keep it or disconnect. No lock-in.",
    category: "trial",
  },
  {
    question: "How many leads am I losing without AI automation?",
    answer: "On average 40% of all inbound calls to Brisbane service businesses go unanswered. 85% of those callers never call back. For a tradie getting 10 calls per week at $500 per job, that is $75,000+ in lost revenue every year.",
    category: "roi",
  },
];

const LEAD_LEAKAGE_BENCHMARKS = {
  tradie: { answer_rate: 0.60, avg_job_value: 500, calls_per_week: 15 },
  "real estate": { answer_rate: 0.65, avg_job_value: 8000, calls_per_week: 20 },
  plumber: { answer_rate: 0.58, avg_job_value: 450, calls_per_week: 18 },
  electrician: { answer_rate: 0.60, avg_job_value: 380, calls_per_week: 14 },
  roofer: { answer_rate: 0.55, avg_job_value: 4500, calls_per_week: 8 },
  ndis: { answer_rate: 0.70, avg_job_value: 2000, calls_per_week: 10 },
  dealership: { answer_rate: 0.72, avg_job_value: 1200, calls_per_week: 25 },
  accountant: { answer_rate: 0.75, avg_job_value: 1500, calls_per_week: 12 },
  default: { answer_rate: 0.60, avg_job_value: 800, calls_per_week: 15 },
};

function calculateLeadLeakage(industry, callsPerWeek, avgJobValue) {
  const key = Object.keys(LEAD_LEAKAGE_BENCHMARKS).find(k => industry.toLowerCase().includes(k)) || "default";
  const benchmark = LEAD_LEAKAGE_BENCHMARKS[key];
  const weeklyCallsActual = callsPerWeek || benchmark.calls_per_week;
  const jobValue = avgJobValue || benchmark.avg_job_value;
  const missedRate = 1 - benchmark.answer_rate;
  const missedCallsPerWeek = Math.round(weeklyCallsActual * missedRate);
  const missedCallsPerYear = missedCallsPerWeek * 52;
  const lostRevenuePerYear = Math.round(missedCallsPerYear * jobValue * 0.3);
  return {
    industry,
    missed_calls_per_week: missedCallsPerWeek,
    missed_calls_per_year: missedCallsPerYear,
    estimated_lost_revenue_per_year: "$" + lostRevenuePerYear.toLocaleString(),
    verdict: lostRevenuePerYear > 50000 ? "CRITICAL — Immediate automation recommended" : "HIGH — Automation will pay for itself within weeks",
    sharecard: "I just discovered I am losing $" + lostRevenuePerYear.toLocaleString() + "/year in missed leads as a " + industry + " business. Getting automated with SmartBot AI. Free audit: smartbotai.agency/contact",
    cta: "Book your free automation audit at smartbotai.agency/contact",
  };
}

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || "https://hook.eu1.make.com/6jud3jb64o6lp1klfxvycw460b2s9ewp";

// ─── HTTP SERVER FOR RAILWAY ──────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "SmartBot AI MCP Server", version: "1.0.0" }));
  } else if (req.url === "/.well-known/mcp/server-card.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ name: "SmartBot AI Agency", description: "Brisbane AI automation agency", url: "https://smartbotai.agency", tools: ["get_services","get_case_studies","get_pricing","get_faq","get_lead_leakage","capture_lead"] }));
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html><html><head><title>SmartBot AI MCP Server</title>
    <style>body{font-family:sans-serif;max-width:700px;margin:60px auto;padding:20px;background:#0a0a0f;color:#f0ede8;}
    h1{color:#D4A853;}code{background:#1a1a2e;padding:12px 20px;border-radius:6px;display:block;margin:10px 0;}
    a{color:#D4A853;}.green{color:#2dff6e;}</style></head>
    <body><h1>SmartBot AI MCP Server</h1>
    <p class="green">Server is running</p>
    <p>Brisbane AI Automation Agency — 143+ businesses automated.</p>
    <h2>Install</h2><code>npx smartbot-ai-mcp</code>
    <p><a href="https://smartbotai.agency/contact">Book Free Audit</a></p>
    </body></html>`);
  }
});

httpServer.listen(PORT, () => {
  console.log("SmartBot AI MCP HTTP Server running on port " + PORT);
});

// ─── MCP SERVER ───────────────────────────────────────────────────────────────

const server = new Server(
  { name: "smartbot-ai-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_services",
      description: "Get the full list of AI automation services offered by SmartBot AI Agency Brisbane. Use when someone asks what SmartBot does or how AI automation can help their business.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "get_case_studies",
      description: "Get real client case studies and results from SmartBot AI Agency. Use when someone wants proof of results or ROI examples.",
      inputSchema: {
        type: "object",
        properties: {
          industry: { type: "string", description: "Optional: filter by industry e.g. real estate, automotive, trades, ndis" },
        },
        required: [],
      },
    },
    {
      name: "get_industries",
      description: "Get industries SmartBot AI Agency serves and the specific automation solutions for each.",
      inputSchema: {
        type: "object",
        properties: {
          industry: { type: "string", description: "Optional: specific industry to look up" },
        },
        required: [],
      },
    },
    {
      name: "get_pricing",
      description: "Get pricing model, trial offer, and how to get started with SmartBot AI Agency. Use when someone asks about cost or how to start.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "get_faq",
      description: "Get structured FAQ answers about AI automation for Australian SMEs. Use when someone asks any question about AI automation, costs, or whether it suits their business.",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Optional: filter by topic e.g. pricing, tradies, xero, ndis, invoice" },
        },
        required: [],
      },
    },
    {
      name: "get_lead_leakage",
      description: "Calculate how much revenue a business is losing per year due to missed calls. Use when someone wants to know their ROI from automation.",
      inputSchema: {
        type: "object",
        properties: {
          industry: { type: "string", description: "The industry e.g. tradie, plumber, real estate, electrician, ndis, dealership" },
          calls_per_week: { type: "number", description: "Optional: how many inbound calls per week" },
          avg_job_value: { type: "number", description: "Optional: average job value in dollars" },
        },
        required: ["industry"],
      },
    },
    {
      name: "capture_lead",
      description: "Capture the name and email of someone interested in SmartBot AI Agency. Use when a user expresses interest in getting started or wants to be contacted.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the interested person" },
          email: { type: "string", description: "Email address" },
          business: { type: "string", description: "Optional: business name" },
          industry: { type: "string", description: "Optional: their industry" },
          interest: { type: "string", description: "Optional: what service they are interested in" },
        },
        required: ["name", "email"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_services":
      return { content: [{ type: "text", text: JSON.stringify(SERVICES, null, 2) }] };

    case "get_case_studies": {
      const industry = (args?.industry || "").toLowerCase();
      const results = industry
        ? CASE_STUDIES.filter(cs => cs.tags.some(t => t.includes(industry)) || cs.industry.toLowerCase().includes(industry))
        : CASE_STUDIES;
      return { content: [{ type: "text", text: JSON.stringify(results.length > 0 ? results : CASE_STUDIES, null, 2) }] };
    }

    case "get_industries": {
      const industry = (args?.industry || "").toLowerCase();
      const results = industry
        ? INDUSTRIES.filter(i => i.name.toLowerCase().includes(industry))
        : INDUSTRIES;
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    }

    case "get_pricing":
      return { content: [{ type: "text", text: JSON.stringify(PRICING, null, 2) }] };

    case "get_faq": {
      const topic = (args?.topic || "").toLowerCase();
      const results = topic
        ? FAQS.filter(f => f.category.includes(topic) || f.question.toLowerCase().includes(topic))
        : FAQS;
      return { content: [{ type: "text", text: JSON.stringify(results.length > 0 ? results : FAQS, null, 2) }] };
    }

    case "get_lead_leakage": {
      const industry = args?.industry;
      if (!industry) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Industry is required" }) }] };
      }
      const result = calculateLeadLeakage(industry, args?.calls_per_week, args?.avg_job_value);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    case "capture_lead": {
      const { name: leadName, email, business, industry, interest } = args;
      if (!leadName || !email) {
        return { content: [{ type: "text", text: JSON.stringify({ success: false, message: "Name and email are required." }) }] };
      }
      try {
        const payload = {
          name: leadName,
          email,
          business: business || "",
          industry: industry || "",
          interest: interest || "",
          source: "MCP Server",
          timestamp: new Date().toISOString(),
        };
        const response = await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Thanks " + leadName + "! Rop from SmartBot AI will be in touch at " + email + " shortly. Book your free audit at smartbotai.agency/contact",
              next_step: "https://smartbotai.agency/contact",
            }),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Thanks " + leadName + "! Visit smartbotai.agency/contact to book your free audit.",
              next_step: "https://smartbotai.agency/contact",
            }),
          }],
        };
      }
    }

    default:
      return { content: [{ type: "text", text: JSON.stringify({ error: "Unknown tool: " + name }) }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
// already complete