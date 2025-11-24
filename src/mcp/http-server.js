/**
 * HTTP Server wrapper for MCP Server
 * Allows testing MCP tools via Postman or curl
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const handlers = require('./handlers');

// Import all tool definitions to get schemas
const customerTools = require('./tools/customer-tools');
const cardTools = require('./tools/card-tools');
const transactionTools = require('./tools/transaction-tools');
const alertTools = require('./tools/alert-tools');
const disputeTools = require('./tools/dispute-tools');
const cardServiceTools = require('./tools/card-service-tools');

const app = express();
const PORT = process.env.MCP_HTTP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Combine all tools
const allTools = [
  ...customerTools,
  ...cardTools,
  ...transactionTools,
  ...alertTools,
  ...disputeTools,
  ...cardServiceTools,
];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'MCP HTTP Server is running',
    toolsAvailable: allTools.length,
    timestamp: new Date().toISOString(),
  });
});

// List all available tools
app.get('/tools', (req, res) => {
  res.json({
    success: true,
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
    totalTools: allTools.length,
  });
});

// Get specific tool info
app.get('/tools/:toolName', (req, res) => {
  const { toolName } = req.params;
  const tool = allTools.find(t => t.name === toolName);

  if (!tool) {
    return res.status(404).json({
      success: false,
      error: `Tool '${toolName}' not found`,
      availableTools: allTools.map(t => t.name),
    });
  }

  res.json({
    success: true,
    tool: {
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
  });
});

// Execute a tool
app.post('/tools/:toolName/execute', async (req, res) => {
  const { toolName } = req.params;
  const args = req.body;

  console.log(`📞 Tool called: ${toolName}`);
  console.log(`📦 Arguments:`, JSON.stringify(args, null, 2));

  try {
    // Find the handler
    const handler = handlers[toolName];

    if (!handler) {
      return res.status(404).json({
        success: false,
        error: `Tool '${toolName}' not found`,
        availableTools: Object.keys(handlers),
      });
    }

    // Execute the handler
    const startTime = Date.now();
    const result = await handler(args);
    const duration = Date.now() - startTime;

    console.log(`✅ Tool executed successfully in ${duration}ms`);

    res.json({
      success: true,
      toolName,
      result,
      executionTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error(`❌ Tool execution error:`, error.message);

    res.status(500).json({
      success: false,
      toolName,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
});

// Batch execute multiple tools
app.post('/tools/batch', async (req, res) => {
  const { tools } = req.body;

  if (!Array.isArray(tools)) {
    return res.status(400).json({
      success: false,
      error: 'Request body must contain a "tools" array',
    });
  }

  console.log(`📞 Batch execution: ${tools.length} tools`);

  const results = [];

  for (const toolRequest of tools) {
    const { name, args } = toolRequest;

    try {
      const handler = handlers[name];
      if (!handler) {
        results.push({
          name,
          success: false,
          error: `Tool '${name}' not found`,
        });
        continue;
      }

      const result = await handler(args);
      results.push({
        name,
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        name,
        success: false,
        error: error.message,
      });
    }
  }

  res.json({
    success: true,
    batchResults: results,
    totalRequests: tools.length,
    successCount: results.filter(r => r.success).length,
    failureCount: results.filter(r => !r.success).length,
  });
});

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CMS MCP HTTP Server',
    version: '1.0.0',
    description: 'HTTP wrapper for MCP Server - Test MCP tools via HTTP/Postman',
    endpoints: {
      'GET /health': 'Health check',
      'GET /tools': 'List all available tools',
      'GET /tools/:toolName': 'Get tool information',
      'POST /tools/:toolName/execute': 'Execute a specific tool',
      'POST /tools/batch': 'Execute multiple tools in batch',
    },
    examples: {
      listTools: `GET http://localhost:${PORT}/tools`,
      executeCustomerTool: `POST http://localhost:${PORT}/tools/cms_get_customers/execute`,
      executeCardTool: `POST http://localhost:${PORT}/tools/cms_get_cards/execute`,
    },
    toolCategories: {
      customer: Object.keys(handlers).filter(k => k.includes('customer')).length,
      card: Object.keys(handlers).filter(k => k.includes('card')).length,
      transaction: Object.keys(handlers).filter(k => k.includes('transaction')).length,
      alert: Object.keys(handlers).filter(k => k.includes('alert')).length,
      dispute: Object.keys(handlers).filter(k => k.includes('dispute')).length,
    },
    totalTools: allTools.length,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /tools',
      'GET /tools/:toolName',
      'POST /tools/:toolName/execute',
      'POST /tools/batch',
    ],
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 ==========================================');
  console.log('🤖 CMS MCP HTTP Server');
  console.log('🚀 ==========================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`🔧 Tools Available: http://localhost:${PORT}/tools`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('🚀 ==========================================');
  console.log(`📊 Total MCP Tools Loaded: ${allTools.length}`);
  console.log('🚀 ==========================================\n');
  console.log('Ready for Postman testing! 🚀\n');
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

