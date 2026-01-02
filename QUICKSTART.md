# Quick Start Guide

Get up and running with Sparky AI Agent in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

## Step 3: Run Your First Query

```bash
npm start "What is 15 multiplied by 23?"
```

You should see the agent:
1. Start the MCP server
2. Process your query
3. Use the calculator tool
4. Return the result

## Step 4: Try More Examples

```bash
# Math operations
npm start "Calculate the square root of 144"

# Weather (mock data)
npm start "What's the weather in San Francisco?"

# Complex queries
npm start "What is 42 * 7, then add 100 to that result?"
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out [src/examples/basic-usage.js](src/examples/basic-usage.js) for code examples
- Create your own custom tools in `src/mcp-server/tools/`

## Troubleshooting

**Error: "Configuration validation failed"**
- Make sure your `.env` file exists and contains `OPENAI_API_KEY`

**Error: "Port 8000 already in use"**
- Change `MCP_SERVER_PORT` in `.env` to a different port

**Error: "Failed to fetch tools"**
- Make sure the MCP server started successfully
- Check the logs in `logs/agent.log`

Happy coding! 🚀

