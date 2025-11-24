const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Import tool definitions
const customerTools = require('./tools/customer-tools');
const cardTools = require('./tools/card-tools');
const transactionTools = require('./tools/transaction-tools');
const alertTools = require('./tools/alert-tools');
const disputeTools = require('./tools/dispute-tools');
const cardServiceTools = require('./tools/card-service-tools');

// Import handlers
const handlers = require('./handlers');

class CMSMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cms-admin-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Combine all tools
    this.tools = [
      ...customerTools,
      ...cardTools,
      ...transactionTools,
      ...alertTools,
      ...disputeTools,
      ...cardServiceTools,
    ];

    this.setupHandlers();
  }

  setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.tools,
    }));

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Find the appropriate handler for the tool
        const handler = handlers[name];

        if (!handler) {
          throw new Error(`Unknown tool: ${name}`);
        }

        // Execute the handler
        const result = await handler(args);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🤖 CMS Admin MCP Server running on stdio');
  }
}

// Start the MCP server if this file is run directly
if (require.main === module) {
  const server = new CMSMCPServer();
  server.start().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

module.exports = CMSMCPServer;

