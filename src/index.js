#!/usr/bin/env node

import readline from "readline";
import AIAgent from "./agent/index.js";
import { createLogger } from "./utils/logger.js";
import getConfig from "./config/index.js";

const config = getConfig();
const logger = createLogger(config);

/**
 * Create interactive readline interface
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "🤖 Sparky> ",
  });
}

/**
 * Interactive mode - continuous Q&A
 */
async function interactiveMode(agent) {
  const rl = createInterface();

  console.log("\n🤖 Sparky AI Agent - Interactive Mode");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log('Type your questions (or "exit"/"quit" to quit)\n');
  console.log("💡 Example queries:");
  console.log('   • "What is 15 * 23?"');
  console.log('   • "Calculate the square root of 144"');
  console.log('   • "What\'s the weather in San Francisco?"');
  console.log("\n");

  rl.prompt();

  rl.on("line", async (input) => {
    const query = input.trim();

    // Handle exit commands
    if (
      query === "" ||
      query.toLowerCase() === "exit" ||
      query.toLowerCase() === "quit"
    ) {
      console.log("\n👋 Goodbye!\n");
      rl.close();
      await agent.shutdown();
      process.exit(0);
      return;
    }

    // Handle clear command
    if (query.toLowerCase() === "clear") {
      console.clear();
      rl.prompt();
      return;
    }

    // Process the query
    try {
      console.log("⏳ Processing...\n");
      const result = await agent.processQuery(query);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("💬 Response:");
      console.log(result.response);
      if (result.toolCalls > 0) {
        console.log(`\n🔧 Used ${result.toolCalls} tool(s)`);
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } catch (error) {
      console.error("\n❌ Error:", error.message);
      if (error.stack && process.env.NODE_ENV === "development") {
        console.error("\nStack trace:", error.stack);
      }
      console.log();
    }

    rl.prompt();
  });

  rl.on("close", async () => {
    console.log("\n👋 Goodbye!\n");
    await agent.shutdown();
    process.exit(0);
  });
}

/**
 * Main entry point for the AI Agent application
 */
async function main() {
  const agent = new AIAgent();

  try {
    // Initialize agent
    await agent.initialize();

    // Check if query provided as command line argument
    if (process.argv.length > 2) {
      // Command line query mode
      const query = process.argv.slice(2).join(" ");
      logger.info("Processing command line query", { query });

      const result = await agent.processQuery(query);
      console.log("\n=== AI Agent Response ===");
      console.log(result.response);
      console.log("\n=== Metadata ===");
      console.log(
        `Messages: ${result.messages}, Tool Calls: ${result.toolCalls}`
      );

      await agent.shutdown();
      process.exit(0);
    } else {
      // Interactive mode
      await interactiveMode(agent);
    }

    // Graceful shutdown handlers
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully");
      await agent.shutdown();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully");
      await agent.shutdown();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Fatal error", {
      error: error.message,
      stack: error.stack,
    });

    // Provide helpful error messages
    const status = error.status || error.statusCode;

    if (status === 429) {
      console.error("\n❌ OpenAI API Quota Exceeded");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error(error.message);
      console.error("\n💡 To resolve this:");
      console.error(
        "   1. Check your usage at https://platform.openai.com/usage"
      );
      console.error("   2. Upgrade your plan if needed");
      console.error("   3. Wait for your quota to reset\n");
    } else if (status === 401) {
      console.error("\n❌ OpenAI API Authentication Failed");
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.error(error.message);
      console.error("\n💡 To resolve this:");
      console.error("   1. Check your .env file has OPENAI_API_KEY set");
      console.error("   2. Verify your API key is correct");
      console.error(
        "   3. Get a new key at https://platform.openai.com/api-keys\n"
      );
    } else {
      console.error("❌ Fatal error:", error.message);
      if (error.stack && process.env.NODE_ENV === "development") {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    }

    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
