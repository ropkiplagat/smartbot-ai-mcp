#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "smartbot-ai-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Define the tools available for SmartBot AI Agency
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_agency_pricing",
        description: "Get the current pricing guide for SmartBot AI services",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "get_case_studies",
        description: "View brief case studies of AI automations implemented by the agency",
        inputSchema: { type: "object", properties: {} },
      }
    ],
  };
});

/**
 * Handle the logic for each tool call
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get_agency_pricing":
      return {
        content: [{ type: "text", text: `
SmartBot AI Agency Pricing Guide:
- Simple Chatbot: $500 - $800
- Appointment Automation: $1,000 - $1,500
- Email Automation: $800 - $1,200
- Data Processing: $1,500 - $2,000
- Custom Complex Solution: $2,000 - $3,000
- Monthly Maintenance: $200 - $500
        ` }],
      };

    case "get_case_studies":
      return {
        content: [{ type: "text", text: "Case studies include Real Estate Hyper-Targeting engines and automated lead qualification for international car imports." }];
      };

    default:
      throw new Error("Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
