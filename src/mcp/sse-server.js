/**
 * MCP Server with SSE Transport
 * Supports Server-Sent Events for real MCP protocol communication
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Import tool definitions and handlers
const customerTools = require('./tools/customer-tools');
const cardTools = require('./tools/card-tools');
const transactionTools = require('./tools/transaction-tools');
const alertTools = require('./tools/alert-tools');
const disputeTools = require('./tools/dispute-tools');
const cardServiceTools = require('./tools/card-service-tools');
const handlers = require('./handlers');

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Combine all tools
const allTools = [
  ...customerTools,
  ...cardTools,
  ...transactionTools,
  ...alertTools,
  ...disputeTools,
  ...cardServiceTools,
];

// Create MCP server instance
const mcpServer = new Server(
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

// Setup MCP handlers
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const handler = handlers[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'MCP SSE Server is running',
    toolsAvailable: allTools.length,
    transport: 'SSE',
    timestamp: new Date().toISOString(),
  });
});

// Store active servers by session ID (each connection gets its own server instance)
const activeSessions = new Map();

// MCP SSE endpoint
app.get('/sse', async (req, res) => {
  console.log('📡 New SSE connection established');

  // Create a new MCP server instance for this connection
  const sessionServer = new Server(
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

  // Setup handlers for this session
  sessionServer.setRequestHandler(ListToolsRequestSchema, async () => {
    console.log('📋 ListTools request received');
    return { tools: allTools };
  });

  sessionServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.log(`🔧 CallTool request: ${name}`);

    try {
      const handler = handlers[name];
      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

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
      console.error(`❌ Tool error: ${error.message}`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  // Create SSE transport
  const transport = new SSEServerTransport('/message', res);

  // Connect the server to this transport
  await sessionServer.connect(transport);

  // Extract session ID from the transport's endpoint message
  // The transport sends: event: endpoint, data: /message?sessionId=...
  const match = res._getData && res._getData().match(/sessionId=([^&\s]+)/);
  const sessionId = match ? match[1] : Date.now().toString();
  
  activeSessions.set(sessionId, { server: sessionServer, transport });

  console.log(`✅ MCP Server connected via SSE (session: ${sessionId})`);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`📴 SSE connection closed (session: ${sessionId})`);
    activeSessions.delete(sessionId);
  });
});

// MCP message endpoint (for client to send messages)
app.post('/message', async (req, res) => {
  const sessionId = req.query.sessionId;
  console.log(`📨 Received MCP message (session: ${sessionId}):`, JSON.stringify(req.body, null, 2));
  
  try {
    // Get the session for this sessionId
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      console.error(`❌ No session found for: ${sessionId}`);
      console.log(`📋 Active sessions:`, Array.from(activeSessions.keys()));
      return res.status(404).json({ error: 'Session not found' });
    }

    // The transport and server should handle the message
    // For SSEServerTransport, we need to acknowledge receipt
    res.status(202).json({ received: true });
    
  } catch (error) {
    console.error('❌ Error handling message:', error, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Also log all requests for debugging
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.url}`);
  next();
});

// Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CMS MCP Server with SSE',
    version: '1.0.0',
    description: 'MCP Server with Server-Sent Events transport for real-time communication',
    transport: 'SSE (Server-Sent Events)',
    endpoints: {
      'GET /health': 'Health check',
      'GET /sse': 'SSE connection endpoint for MCP protocol',
      'POST /message': 'Send messages to MCP server',
    },
    connect: {
      sse: `http://localhost:${PORT}/sse`,
      message: `http://localhost:${PORT}/message`,
    },
    toolsAvailable: allTools.length,
    tools: allTools.map(t => ({ name: t.name, description: t.description })),
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 ==========================================');
  console.log('🤖 CMS MCP Server with SSE Transport');
  console.log('🚀 ==========================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📡 SSE Endpoint: http://localhost:${PORT}/sse`);
  console.log(`📬 Message Endpoint: http://localhost:${PORT}/message`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 Server Info: http://localhost:${PORT}/`);
  console.log('🚀 ==========================================');
  console.log(`📊 Total MCP Tools: ${allTools.length}`);
  console.log(`🔌 Transport: SSE (Server-Sent Events)`);
  console.log('🚀 ==========================================\n');
  console.log('✅ Ready for MCP client connections!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;

