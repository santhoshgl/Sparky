import { BaseLLMProvider } from "./base.js";

/**
 * Ollama LLM Provider
 * Runs models locally - completely free!
 * Install Ollama: https://ollama.ai
 * Example: ollama pull llama3.2
 */
export class OllamaProvider extends BaseLLMProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.ollama?.baseUrl || "http://localhost:11434";
    this.model = config.ollama?.model || "llama3.2";
  }

  async initialize() {
    // Check if Ollama is running
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(
          `Ollama is not running. Please start Ollama and ensure the model "${this.model}" is installed.\n` +
            `Install: https://ollama.ai\n` +
            `Pull model: ollama pull ${this.model}`
        );
      }
    } catch (error) {
      throw new Error(
        `Cannot connect to Ollama at ${this.baseUrl}. ` +
          `Make sure Ollama is running: https://ollama.ai`
      );
    }
  }

  formatTools(tools) {
    if (!tools || tools.length === 0) return null;

    // Ollama uses OpenAI-compatible format
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
      stream: false,
    };

    if (formattedTools && formattedTools.length > 0) {
      payload.tools = formattedTools;
      payload.tool_choice = toolChoice || "auto";
    }

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json();
    // Ollama returns response in a different format, normalize it
    // Ollama API returns: { message: { content: "...", tool_calls: [...] } }
    const message = data.message || { content: "", tool_calls: [] };
    return {
      choices: [
        {
          message: {
            content: message.content || "",
            tool_calls: message.tool_calls || [],
          },
        },
      ],
    };
  }

  extractToolCalls(response) {
    // Ollama returns tool_calls in the message object
    return response.choices[0]?.message?.tool_calls || [];
  }

  extractContent(response) {
    return response.choices[0]?.message?.content || "";
  }
}
