# Sparky - AI Agent with MCP (Model Context Protocol)

A sophisticated AI agent boilerplate that uses the Model Context Protocol (MCP) to connect with multiple LLM providers and custom tools. This project provides a complete, production-ready foundation for building AI agents that can interact with external tools and services.

## Features

- 🤖 **Multiple LLM Providers**: Support for OpenAI, Ollama (local/free), Groq (free tier), and Hugging Face (free tier)
- 🔌 **MCP Protocol**: Full implementation of Model Context Protocol for tool communication
- 🛠️ **Extensible Tools**: Easy-to-add custom tools (Calculator, Weather, FileSystem included)
- 💰 **Free Options**: Use Ollama for completely free, local AI inference
- 📝 **Structured Logging**: Comprehensive logging with Winston
- ⚙️ **Configuration Management**: Environment-based configuration with validation
- 🚀 **Production Ready**: Error handling, graceful shutdown, and best practices

## Project Structure

```
Sparky/
├── src/
│   ├── agent/           # AI Agent implementation
│   │   └── index.js
│   ├── llm/             # LLM Provider abstraction
│   │   ├── index.js     # Provider factory
│   │   └── providers/   # LLM provider implementations
│   │       ├── base.js
│   │       ├── openai.js
│   │       ├── ollama.js
│   │       ├── groq.js
│   │       └── huggingface.js
│   ├── mcp-server/      # MCP Server implementation
│   │   ├── index.js
│   │   └── tools/       # Custom MCP tools
│   │       ├── index.js
│   │       ├── calculator.js
│   │       ├── weather.js
│   │       └── filesystem.js
│   ├── config/          # Configuration management
│   │   └── index.js
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   └── index.js         # Main entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- **For Ollama (recommended, free)**: Install [Ollama](https://ollama.ai) and pull a model (e.g., `ollama pull llama3.2`)
- **For OpenAI**: OpenAI API key
- **For Groq**: Groq API key (free tier available at https://console.groq.com)
- **For Hugging Face**: Hugging Face API key (free tier available at https://huggingface.co/settings/tokens)

## Installation

1. **Clone or navigate to the project directory:**

   ```bash
   cd Sparky
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   **For Ollama (Free, Recommended):**

   ```bash
   # Install Ollama first: https://ollama.ai
   # Then pull a model: ollama pull llama3.2
   LLM_PROVIDER=ollama
   OLLAMA_MODEL=llama3.2
   ```

   **For OpenAI:**

   ```bash
   LLM_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   **For Groq (Free Tier):**

   ```bash
   LLM_PROVIDER=groq
   GROQ_API_KEY=your_groq_api_key_here
   ```

   **For Hugging Face (Free Tier):**

   ```bash
   LLM_PROVIDER=huggingface
   HUGGINGFACE_API_KEY=your_hf_api_key_here
   ```

## Configuration

The application uses environment variables for configuration. Key settings:

| Variable              | Description                                                | Default                               |
| --------------------- | ---------------------------------------------------------- | ------------------------------------- |
| `LLM_PROVIDER`        | LLM provider: `ollama`, `openai`, `groq`, or `huggingface` | `ollama`                              |
| `OPENAI_API_KEY`      | OpenAI API key (required if using OpenAI)                  | -                                     |
| `OPENAI_MODEL`        | OpenAI model to use                                        | `gpt-4o`                              |
| `OLLAMA_BASE_URL`     | Ollama server URL                                          | `http://localhost:11434`              |
| `OLLAMA_MODEL`        | Ollama model name                                          | `llama3.2`                            |
| `GROQ_API_KEY`        | Groq API key (required if using Groq)                      | -                                     |
| `GROQ_MODEL`          | Groq model to use                                          | `llama-3.1-8b-instant`                |
| `HUGGINGFACE_API_KEY` | Hugging Face API key (required if using HF)                | -                                     |
| `HUGGINGFACE_MODEL`   | Hugging Face model                                         | `meta-llama/Meta-Llama-3-8B-Instruct` |
| `MCP_SERVER_PORT`     | Port for MCP server                                        | `8000`                                |
| `MCP_SERVER_URL`      | MCP server URL                                             | `http://localhost:8000/mcp`           |
| `AGENT_NAME`          | Name of the agent                                          | `Sparky`                              |
| `AGENT_INSTRUCTIONS`  | System instructions for the agent                          | Default instructions                  |
| `LOG_LEVEL`           | Logging level                                              | `info`                                |

## LLM Providers

Sparky supports multiple LLM providers. Choose the one that best fits your needs:

### 🆓 Ollama (Recommended - Completely Free)

**Best for**: Local development, privacy, no API costs

- **Completely free** - runs models locally on your machine
- **No API keys required** - works offline
- **Privacy-focused** - data never leaves your machine
- **Setup**: Install [Ollama](https://ollama.ai), then pull a model:
  ```bash
  ollama pull llama3.2
  # or
  ollama pull mistral
  ollama pull codellama
  ```

**Configuration:**

```bash
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

### ⚡ Groq (Free Tier Available)

**Best for**: Fast inference, free tier with generous limits

- **Very fast inference** - optimized for speed
- **Free tier available** - Get API key at https://console.groq.com
- **Good function calling support**

**Configuration:**

```bash
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

### 🤗 Hugging Face (Free Tier Available)

**Best for**: Access to many open-source models

- **Free tier available** - Get API key at https://huggingface.co/settings/tokens
- **Many model options**
- **Note**: Function calling support varies by model

**Configuration:**

```bash
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=your_hf_api_key
HUGGINGFACE_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
```

### 💰 OpenAI (Paid)

**Best for**: Best function calling, production use

- **Best function calling support**
- **Requires paid API key**
- **Most reliable for production**

**Configuration:**

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
```

## Usage

### Basic Usage

Run a query directly from the command line:

```bash
npm start "What is 15 multiplied by 23?"
```

### Server Mode

Start the agent in server mode (keeps MCP server running):

```bash
npm start
```

The MCP server will be available at `http://localhost:8000/mcp`

### Development Mode

Run with auto-reload on file changes:

```bash
npm run dev
```

### Run MCP Server Separately

If you want to run the MCP server as a standalone service:

```bash
npm run mcp-server
```

## Available Tools

The boilerplate includes three example tools:

### 1. Calculator Tool

Performs mathematical operations:

- Addition, subtraction, multiplication, division
- Power, square root, modulo

**Example:**

```javascript
{
  operation: "multiply",
  a: 15,
  b: 23
}
```

### 2. Weather Tool

Gets weather information (currently mock data):

- Temperature, conditions, humidity, wind speed

**Example:**

```javascript
{
  location: "San Francisco",
  units: "celsius"
}
```

### 3. FileSystem Tool

Safe file system operations:

- Read, write, list, exists, delete

**Example:**

```javascript
{
  operation: "read",
  path: "README.md"
}
```

## Creating Custom Tools

To add a new tool, create a file in `src/mcp-server/tools/`:

```javascript
// src/mcp-server/tools/my-tool.js
export const myTool = {
  name: "my-tool",
  description: "Description of what the tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Parameter description",
      },
    },
    required: ["param1"],
  },
  handler: async (params) => {
    const { param1 } = params;

    try {
      // Your tool logic here
      const result = await doSomething(param1);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
```

Then register it in `src/mcp-server/tools/index.js`:

```javascript
import { myTool } from "./my-tool.js";

export function getAllTools() {
  return [
    // ... existing tools
    myTool,
  ];
}
```

## API Reference

### AIAgent Class

Main agent class for processing queries with MCP tools.

#### Methods

- `initialize()`: Initialize the agent and start MCP server
- `processQuery(userQuery)`: Process a user query using OpenAI with MCP tools
- `getAvailableTools()`: Get list of available tools from MCP server
- `callTool(toolName, toolArgs)`: Call a specific tool
- `shutdown()`: Gracefully shutdown the agent and MCP server

#### Example

```javascript
import AIAgent from "./agent/index.js";

const agent = new AIAgent();
await agent.initialize();

const result = await agent.processQuery("Calculate 42 * 7");
console.log(result.response);

await agent.shutdown();
```

### MCP Server

The MCP server exposes tools via HTTP endpoints:

- `POST /mcp` - Main MCP protocol endpoint
  - `method: "tools/list"` - List all available tools
  - `method: "tools/call"` - Call a specific tool
- `GET /health` - Health check endpoint

## Error Handling

The boilerplate includes comprehensive error handling:

- Configuration validation with Zod
- Tool execution error handling
- Graceful shutdown on SIGTERM/SIGINT
- Structured logging for debugging

## Logging

Logs are written to:

- Console (with colors)
- `logs/agent.log` (all logs)
- `logs/agent-error.log` (errors only)

Log levels: `error`, `warn`, `info`, `debug`

## Security Considerations

- **API Keys**: Never commit `.env` files to version control
- **File System Tool**: Includes path traversal protection
- **Input Validation**: All tool inputs are validated against schemas
- **Error Messages**: Sensitive information is not exposed in error messages

## Development

### Adding New Dependencies

```bash
npm install <package-name>
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## Troubleshooting

### "Configuration validation failed"

- Ensure your `.env` file exists and contains `OPENAI_API_KEY`
- Check that all required environment variables are set

### "Failed to start MCP server"

- Check if port 8000 is already in use
- Change `MCP_SERVER_PORT` in `.env` if needed

### "Tool not found"

- Ensure the tool is registered in `src/mcp-server/tools/index.js`
- Check tool name spelling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Support

For issues and questions, please open an issue on the repository.

---

Built with ❤️ for the AI community
