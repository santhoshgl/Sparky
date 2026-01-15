import { BaseLLMProvider } from "./base.js";

/**
 * Groq LLM Provider
 * Fast inference with free tier
 * Get API key: https://console.groq.com
 */
export class GroqProvider extends BaseLLMProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.groq?.apiKey || process.env.GROQ_API_KEY;
    this.model = config.groq?.model || "llama-3.1-8b-instant";
    this.baseUrl = "https://api.groq.com/openai/v1";
  }

  async initialize() {
    if (!this.apiKey) {
      throw new Error(
        "Groq API key is required. Set GROQ_API_KEY in .env or in config.\n" +
          "Get your key: https://console.groq.com"
      );
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

    const payload = {
      model: this.model,
      messages: messages,
    };

    if (formattedTools && formattedTools.length > 0) {
      payload.tools = formattedTools;
      payload.tool_choice = toolChoice || "auto";
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `Groq API error (${response.status}): ${
          error.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    return {
      choices: [
        {
          message: data.choices[0].message,
        },
      ],
    };
  }

  extractToolCalls(response) {
    return response.choices[0]?.message?.tool_calls || [];
  }

  extractContent(response) {
    return response.choices[0]?.message?.content || "";
  }
}
