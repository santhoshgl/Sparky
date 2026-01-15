import { BaseLLMProvider } from "./base.js";

/**
 * Hugging Face Inference API Provider
 * Free tier available
 * Get API key: https://huggingface.co/settings/tokens
 * Note: Function calling support may vary by model
 */
export class HuggingFaceProvider extends BaseLLMProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.huggingface?.apiKey || process.env.HUGGINGFACE_API_KEY;
    this.model =
      config.huggingface?.model || "meta-llama/Meta-Llama-3-8B-Instruct";
    this.baseUrl = "https://api-inference.huggingface.co/models";
  }

  async initialize() {
    if (!this.apiKey) {
      throw new Error(
        "Hugging Face API key is required. Set HUGGINGFACE_API_KEY in .env\n" +
          "Get your key: https://huggingface.co/settings/tokens"
      );
    }
  }

  formatTools(tools) {
    // Hugging Face doesn't support function calling in the same way
    // We'll need to inject tool descriptions into the system prompt
    if (!tools || tools.length === 0) return null;
    return tools; // Return tools for prompt injection
  }

  async chatCompletion(messages, tools = null, toolChoice = null) {
    // Hugging Face API format is different
    // We'll format the messages for their API
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");

    // Inject tool information into system prompt if tools are available
    let systemContent = systemMessage?.content || "";
    if (tools && tools.length > 0) {
      const toolDescriptions = tools
        .map(
          (tool) =>
            `- ${tool.name}: ${
              tool.description
            }\n  Parameters: ${JSON.stringify(tool.inputSchema)}`
        )
        .join("\n");
      systemContent += `\n\nAvailable tools:\n${toolDescriptions}\n\nWhen you need to use a tool, respond with JSON in this format: {"tool": "tool_name", "arguments": {...}}`;
    }

    const payload = {
      inputs: {
        text: userMessages.map((m) => m.content).join("\n"),
        system_prompt: systemContent,
      },
      parameters: {
        return_full_text: false,
        max_new_tokens: 500,
      },
    };

    const response = await fetch(`${this.baseUrl}/${this.model}`, {
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
        .catch(() => ({ error: response.statusText }));
      throw new Error(
        `Hugging Face API error (${response.status}): ${
          error.error || response.statusText
        }`
      );
    }

    const data = await response.json();
    const content = Array.isArray(data)
      ? data[0]?.generated_text
      : data?.generated_text || "";

    // Try to parse tool calls from response
    let toolCalls = [];
    try {
      const toolCallMatch = content.match(
        /\{"tool":\s*"([^"]+)",\s*"arguments":\s*({[^}]+})\}/
      );
      if (toolCallMatch) {
        toolCalls = [
          {
            id: `call_${Date.now()}`,
            function: {
              name: toolCallMatch[1],
              arguments: toolCallMatch[2],
            },
          },
        ];
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return {
      choices: [
        {
          message: {
            content: content,
            tool_calls: toolCalls,
          },
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
