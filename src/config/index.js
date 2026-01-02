import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables
dotenv.config();

// Configuration schema validation
const configSchema = z.object({
  llm: z.object({
    provider: z
      .enum(["openai", "ollama", "groq", "huggingface"])
      .default("ollama"),
  }),
  openai: z
    .object({
      apiKey: z.string().optional(),
      model: z.string().default("gpt-4o"),
    })
    .optional(),
  ollama: z
    .object({
      baseUrl: z.string().default("http://localhost:11434"),
      model: z.string().default("llama3.2"),
    })
    .optional(),
  groq: z
    .object({
      apiKey: z.string().optional(),
      model: z.string().default("llama-3.1-8b-instant"),
    })
    .optional(),
  huggingface: z
    .object({
      apiKey: z.string().optional(),
      model: z.string().default("meta-llama/Meta-Llama-3-8B-Instruct"),
    })
    .optional(),
  mcp: z.object({
    serverPort: z.coerce.number().default(8000),
    serverUrl: z.string().default("http://localhost:8000/mcp"),
    name: z.string().default("Sparky MCP Server"),
  }),
  agent: z.object({
    name: z.string().default("Sparky"),
    instructions: z
      .string()
      .default(
        "You are a helpful AI assistant that uses MCP tools to provide accurate and useful information."
      ),
  }),
  logging: z.object({
    level: z.enum(["error", "warn", "info", "debug"]).default("info"),
    file: z.string().default("logs/agent.log"),
  }),
});

/**
 * Validates and returns the application configuration
 * @returns {Object} Validated configuration object
 * @throws {Error} If configuration is invalid
 */
export function getConfig() {
  const rawConfig = {
    llm: {
      provider: process.env.LLM_PROVIDER || "ollama",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o",
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: process.env.OLLAMA_MODEL || "llama3.2",
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    },
    huggingface: {
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model:
        process.env.HUGGINGFACE_MODEL || "meta-llama/Meta-Llama-3-8B-Instruct",
    },
    mcp: {
      serverPort: process.env.MCP_SERVER_PORT || 8000,
      serverUrl: process.env.MCP_SERVER_URL || "http://localhost:8000/mcp",
      name: process.env.MCP_SERVER_NAME || "Sparky MCP Server",
    },
    agent: {
      name: process.env.AGENT_NAME || "Sparky",
      instructions:
        process.env.AGENT_INSTRUCTIONS ||
        "You are a helpful AI assistant that uses MCP tools to provide accurate and useful information.",
    },
    logging: {
      level: process.env.LOG_LEVEL || "info",
      file: process.env.LOG_FILE || "logs/agent.log",
    },
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`Configuration validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// Export the function as default for convenience
export default getConfig;
