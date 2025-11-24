/**
 * MCP Server with SSE Transport for MCP Protocol
 * Properly implements SSE transport according to MCP SDK specification
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

// Store active transports by sessionId
const activeSessions = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'MCP SSE Server is running',
    toolsAvailable: allTools.length,
    activeSessions: activeSessions.size,
    transport: 'SSE',
    timestamp: new Date().toISOString(),
  });
});

// Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CMS MCP Server with SSE',
    version: '1.0.0',
    description: 'MCP Server with Server-Sent Events transport',
    transport: 'SSE (Server-Sent Events)',
    endpoints: {
      'GET /sse': 'SSE connection endpoint for MCP protocol',
      'POST /message': 'Message endpoint (with ?sessionId)',
      'GET /health': 'Health check',
    },
    toolsAvailable: allTools.length,
    activeSessions: activeSessions.size,
  });
});

// SSE endpoint - establishes the event stream
app.get('/sse', async (req, res) => {
  console.log('📡 New SSE connection request');
  
  try {
    // Create a new MCP server instance for this session
    const server = new Server(
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

    // Setup tool handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log('📋 ListTools request received');
      return { tools: allTools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.log(`🔧 Executing tool: ${name}`);

      try {
        const handler = handlers[name];
        if (!handler) {
          throw new Error(`Unknown tool: ${name}`);
        }

        const result = await handler(args);
        console.log(`✅ Tool ${name} executed successfully`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`❌ Tool ${name} error:`, error.message);
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
    
    // Get the session ID before connecting
    const sessionId = transport.sessionId;
    
    // Store the transport by sessionId for routing POST messages
    activeSessions.set(sessionId, { server, transport });
    
    console.log(`✅ Session created: ${sessionId}`);
    
    // Connect server to transport - this calls transport.start() automatically
    await server.connect(transport);
    
    console.log(`✅ MCP Server connected via SSE`);

    // Handle disconnect
    req.on('close', () => {
      console.log(`📴 Session closed: ${sessionId}`);
      activeSessions.delete(sessionId);
      transport.close();
    });

  } catch (error) {
    console.error('❌ SSE connection error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Message endpoint - receives JSON-RPC messages from client
// We need to route these to the correct transport based on sessionId
app.post('/message', async (req, res) => {
  const sessionId = req.query.sessionId;
  
  if (!sessionId) {
    console.error('❌ No sessionId in message request');
    return res.status(400).json({ error: 'sessionId required' });
  }

  console.log(`📨 Message received for session: ${sessionId}`);
  console.log(`📨 Method: ${req.body.method}, ID: ${req.body.id}`);

  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.error(`❌ Session not found: ${sessionId}`);
    console.log(`📋 Active sessions: ${Array.from(activeSessions.keys()).join(', ')}`);
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    // Route the POST message to the transport's handlePostMessage method
    // Pass the parsed body as the third parameter
    await session.transport.handlePostMessage(req, res, req.body);
    console.log(`✅ Message processed successfully`);
  } catch (error) {
    console.error('❌ Message handling error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Start server
const httpServer = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ==========================================');
  console.log('🤖 CMS MCP Server with SSE Transport');
  console.log('🚀 ==========================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📡 SSE Endpoint: http://localhost:${PORT}/sse`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('🚀 ==========================================');
  console.log(`📊 Tools Available: ${allTools.length}`);
  console.log(`🔌 Transport: SSE (Server-Sent Events)`);
  console.log('🚀 ==========================================');
  console.log('');
  console.log('✅ Ready for MCP SSE connections!');
  console.log('');
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down...');
  activeSessions.forEach((session, sessionId) => {
    console.log(`📴 Closing session: ${sessionId}`);
    if (session.transport) {
      session.transport.close();
    }
  });
  activeSessions.clear();
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
