import { OpenAI } from "openai";
import { BaseLLMProvider } from "./base.js";

/**
 * OpenAI LLM Provider
 * Original provider - requires API key and paid account
 */
export class OpenAIProvider extends BaseLLMProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.openai?.apiKey;
    this.model = config.openai?.model || "gpt-4o";
    this.client = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  async initialize() {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is required. Set OPENAI_API_KEY in .env");
    }
  }

  formatTools(tools) {
    if (!tools || tools.length === 0) return null;

    return tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    }));
  }

  async chatCompletion(messages, tools = null, toolChoice = null) {
    const formattedTools = this.formatTools(tools);

    const options = {
      model: this.model,
      messages: messages,
    };

    if (formattedTools && formattedTools.length > 0) {
      options.tools = formattedTools;
      options.tool_choice = toolChoice || "auto";
    }

    const response = await this.client.chat.completions.create(options);
    return response;
  }

  extractToolCalls(response) {
    return response.choices[0]?.message?.tool_calls || [];
  }

  extractContent(response) {
    return response.choices[0]?.message?.content || "";
  }
}
