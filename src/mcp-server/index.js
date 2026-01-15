import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { getAllTools } from './tools/index.js';
import { createLogger } from '../utils/logger.js';
import getConfig from '../config/index.js';

const config = getConfig();
const logger = createLogger(config);

/**
 * MCP Server Implementation
 * Provides HTTP endpoint for MCP protocol communication
 */
class MCPServer {
  constructor() {
    this.app = express();
    this.port = config.mcp.serverPort;
    this.tools = getAllTools();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, { body: req.body });
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', server: config.mcp.name });
    });

    // MCP protocol endpoint
    this.app.post('/mcp', async (req, res) => {
      try {
        const { method, params } = req.body;

        switch (method) {
          case 'tools/list':
            res.json({
              tools: this.tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
              })),
            });
            break;

          case 'tools/call':
            await this.handleToolCall(params, res);
            break;

          default:
            res.status(400).json({
              error: 'Unknown method',
              method,
            });
        }
      } catch (error) {
        logger.error('MCP request error', { error: error.message, stack: error.stack });
        res.status(500).json({
          error: 'Internal server error',
          message: error.message,
        });
      }
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error', { error: err.message, stack: err.stack });
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      });
    });
  }

  async handleToolCall(params, res) {
    const { name, arguments: toolArgs } = params;

    const tool = this.tools.find(t => t.name === name);
    if (!tool) {
      return res.status(404).json({
        error: 'Tool not found',
        tool: name,
      });
    }

    try {
      logger.info(`Calling tool: ${name}`, { args: toolArgs });
      const result = await tool.handler(toolArgs);
      logger.info(`Tool ${name} completed`, { success: result.success });

      res.json({
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      });
    } catch (error) {
      logger.error(`Tool ${name} error`, { error: error.message, stack: error.stack });
      res.status(500).json({
        error: 'Tool execution failed',
        message: error.message,
        tool: name,
      });
    }
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        logger.info(`MCP Server started on port ${this.port}`, {
          url: `http://localhost:${this.port}`,
          tools: this.tools.map(t => t.name),
        });
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('MCP Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Start server if run directly
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  const server = new MCPServer();
  server.start().catch(error => {
    logger.error('Failed to start MCP server', { error: error.message });
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });
}

export { MCPServer };
export default MCPServer;

