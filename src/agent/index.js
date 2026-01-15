import { createLogger } from "../utils/logger.js";
import getConfig from "../config/index.js";
import { MCPServer } from "../mcp-server/index.js";
import { createLLMProvider } from "../llm/index.js";

const config = getConfig();
const logger = createLogger(config);

/**
 * AI Agent using MCP Protocol
 * Supports multiple LLM providers (OpenAI, Ollama, Groq, Hugging Face)
 */
export class AIAgent {
  constructor() {
    this.config = config;
    this.llmProvider = createLLMProvider();
    this.mcpServer = null;
    this.mcpServerInstance = null;
  }

  /**
   * Initialize the agent and MCP server
   */
  async initialize() {
    try {
      logger.info("Initializing AI Agent...");

      // Initialize LLM provider
      await this.llmProvider.initialize();
      logger.info(`LLM Provider initialized: ${config.llm.provider}`);

      // Start MCP server
      this.mcpServerInstance = new MCPServer();
      await this.mcpServerInstance.start();

      // Wait a bit for server to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info("AI Agent initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize agent", { error: error.message });
      throw error;
    }
  }

  /**
   * Get available tools from MCP server
   */
  async getAvailableTools() {
    try {
      const response = await fetch(`${config.mcp.serverUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "tools/list",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      logger.error("Failed to get tools", { error: error.message });
      throw error;
    }
  }

  /**
   * Call a tool via MCP server
   */
  async callTool(toolName, toolArgs) {
    try {
      logger.info(`Calling tool: ${toolName}`, { args: toolArgs });

      const response = await fetch(`${config.mcp.serverUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "tools/call",
          params: {
            name: toolName,
            arguments: toolArgs,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.content[0].text);

      logger.info(`Tool ${toolName} completed`, { success: result.success });
      return result;
    } catch (error) {
      logger.error(`Tool call error: ${toolName}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Process a user query using LLM provider with MCP tools
   */
  async processQuery(userQuery) {
    try {
      logger.info("Processing query", { query: userQuery });

      // Get available tools
      const tools = await this.getAvailableTools();

      // Initial chat completion
      const messages = [
        {
          role: "system",
          content: config.agent.instructions,
        },
        {
          role: "user",
          content: userQuery,
        },
      ];

      let response = await this.llmProvider.chatCompletion(
        messages,
        tools.length > 0 ? tools : null,
        tools.length > 0 ? "auto" : null
      );

      let assistantMessage = {
        role: "assistant",
        content: this.llmProvider.extractContent(response),
        tool_calls: this.llmProvider.extractToolCalls(response),
      };
      messages.push(assistantMessage);

      // Handle tool calls if any
      while (
        assistantMessage.tool_calls &&
        assistantMessage.tool_calls.length > 0
      ) {
        logger.info("Tool calls detected", {
          count: assistantMessage.tool_calls.length,
        });

        // Execute all tool calls in parallel
        const toolResults = await Promise.all(
          assistantMessage.tool_calls.map(async (toolCall) => {
            const toolName = toolCall.function?.name || toolCall.name;
            const functionArgs =
              toolCall.function?.arguments || toolCall.arguments;

            // Handle both string and object arguments (different providers return different formats)
            let toolArgs;
            if (typeof functionArgs === "string") {
              try {
                toolArgs = JSON.parse(functionArgs);
              } catch (e) {
                logger.warn(
                  `Failed to parse tool arguments as JSON, using as string`,
                  {
                    tool: toolName,
                    args: functionArgs,
                  }
                );
                // If parsing fails, treat as a single string argument
                toolArgs = { query: functionArgs };
              }
            } else if (functionArgs && typeof functionArgs === "object") {
              // Already an object
              toolArgs = functionArgs;
            } else {
              // No arguments provided
              toolArgs = {};
            }

            logger.debug(`Processing tool call`, {
              tool: toolName,
              args: toolArgs,
            });

            try {
              const result = await this.callTool(toolName, toolArgs);
              return {
                tool_call_id:
                  toolCall.id || toolCall.tool_call_id || `call_${Date.now()}`,
                role: "tool",
                name: toolName,
                content: JSON.stringify(result),
              };
            } catch (error) {
              logger.error(`Tool execution failed`, {
                tool: toolName,
                error: error.message,
              });
              return {
                tool_call_id:
                  toolCall.id || toolCall.tool_call_id || `call_${Date.now()}`,
                role: "tool",
                name: toolName,
                content: JSON.stringify({
                  success: false,
                  error: error.message,
                }),
              };
            }
          })
        );

        // Add tool results to messages
        messages.push(...toolResults);

        // Get next response from LLM provider
        response = await this.llmProvider.chatCompletion(
          messages,
          tools.length > 0 ? tools : null,
          tools.length > 0 ? "auto" : null
        );

        assistantMessage = {
          role: "assistant",
          content: this.llmProvider.extractContent(response),
          tool_calls: this.llmProvider.extractToolCalls(response),
        };
        messages.push(assistantMessage);
      }

      const finalResponse =
        assistantMessage.content ||
        "I processed your request but have no text response.";

      logger.info("Query processed successfully", {
        responseLength: finalResponse.length,
      });

      return {
        query: userQuery,
        response: finalResponse,
        messages: messages.length,
        toolCalls: messages.filter((m) => m.role === "tool").length,
      };
    } catch (error) {
      // Handle LLM provider errors with user-friendly messages
      const status = error.status || error.statusCode;
      const provider = config.llm.provider;

      if (status === 429) {
        const friendlyError = new Error(
          `${provider.toUpperCase()} API quota exceeded. ${error.message}`
        );
        friendlyError.status = 429;
        friendlyError.originalError = error;
        logger.error(`${provider} quota exceeded`, {
          error: error.message,
        });
        throw friendlyError;
      } else if (status === 401) {
        const friendlyError = new Error(
          `${provider.toUpperCase()} API authentication failed. ${
            error.message
          }`
        );
        friendlyError.status = 401;
        friendlyError.originalError = error;
        logger.error(`${provider} authentication failed`, {
          error: error.message,
        });
        throw friendlyError;
      } else if (status >= 400 && status < 500) {
        const friendlyError = new Error(
          `${provider.toUpperCase()} API error (${status}): ${error.message}`
        );
        friendlyError.status = status;
        friendlyError.originalError = error;
        logger.error(`${provider} API error`, {
          status: status,
          error: error.message,
        });
        throw friendlyError;
      }

      logger.error("Query processing error", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    try {
      logger.info("Shutting down AI Agent...");
      if (this.mcpServerInstance) {
        await this.mcpServerInstance.stop();
      }
      logger.info("AI Agent shut down successfully");
    } catch (error) {
      logger.error("Error during shutdown", { error: error.message });
      throw error;
    }
  }
}

export default AIAgent;
