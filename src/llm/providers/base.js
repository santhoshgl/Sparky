/**
 * Base LLM Provider Interface
 * All LLM providers must implement this interface
 */
export class BaseLLMProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Initialize the provider
   * @abstract
   */
  async initialize() {
    throw new Error("initialize() must be implemented by provider");
  }

  /**
   * Generate a chat completion
   * @param {Array} messages - Array of message objects
   * @param {Array} tools - Array of tool definitions (optional)
   * @param {string} toolChoice - Tool choice strategy (optional)
   * @returns {Promise<Object>} Chat completion response
   * @abstract
   */
  async chatCompletion(messages, tools = null, toolChoice = null) {
    throw new Error("chatCompletion() must be implemented by provider");
  }

  /**
   * Convert tools to provider-specific format
   * @param {Array} tools - MCP tools
   * @returns {Array} Provider-specific tool format
   * @abstract
   */
  formatTools(tools) {
    throw new Error("formatTools() must be implemented by provider");
  }

  /**
   * Extract tool calls from response
   * @param {Object} response - Provider response
   * @returns {Array} Array of tool calls
   * @abstract
   */
  extractToolCalls(response) {
    throw new Error("extractToolCalls() must be implemented by provider");
  }

  /**
   * Extract content from response
   * @param {Object} response - Provider response
   * @returns {string} Response content
   * @abstract
   */
  extractContent(response) {
    throw new Error("extractContent() must be implemented by provider");
  }
}
