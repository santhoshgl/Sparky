import { OpenAIProvider } from "./providers/openai.js";
import { OllamaProvider } from "./providers/ollama.js";
import { GroqProvider } from "./providers/groq.js";
import { HuggingFaceProvider } from "./providers/huggingface.js";
import { createLogger } from "../utils/logger.js";
import getConfig from "../config/index.js";

const config = getConfig();
const logger = createLogger(config);

/**
 * LLM Provider Factory
 * Creates and returns the appropriate LLM provider based on configuration
 */
export function createLLMProvider() {
  const provider = config.llm?.provider || "ollama"; // Default to Ollama (free)

  logger.info(`Initializing LLM provider: ${provider}`);

  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAIProvider(config);

    case "ollama":
      return new OllamaProvider(config);

    case "groq":
      return new GroqProvider(config);

    case "huggingface":
    case "hf":
      return new HuggingFaceProvider(config);

    default:
      throw new Error(
        `Unknown LLM provider: ${provider}. ` +
          `Supported providers: openai, ollama, groq, huggingface`
      );
  }
}

export { OpenAIProvider, OllamaProvider, GroqProvider, HuggingFaceProvider };
