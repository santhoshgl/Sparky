/**
 * Basic Usage Example
 * Demonstrates how to use the AI Agent
 */

import AIAgent from '../agent/index.js';
import { createLogger } from '../utils/logger.js';
import getConfig from '../config/index.js';

const config = getConfig();
const logger = createLogger(config);

async function example() {
  const agent = new AIAgent();

  try {
    // Initialize the agent
    console.log('🚀 Initializing agent...');
    await agent.initialize();

    // Example queries
    const queries = [
      'What is 15 multiplied by 23?',
      'Calculate the square root of 144',
      'What is the weather like in San Francisco?',
    ];

    for (const query of queries) {
      console.log(`\n📝 Query: ${query}`);
      console.log('⏳ Processing...\n');

      const result = await agent.processQuery(query);

      console.log('🤖 Response:');
      console.log(result.response);
      console.log(`\n📊 Metadata: ${result.messages} messages, ${result.toolCalls} tool calls`);
      console.log('─'.repeat(50));
    }

    // Shutdown
    console.log('\n🛑 Shutting down...');
    await agent.shutdown();
    console.log('✅ Done!');

  } catch (error) {
    logger.error('Example error', { error: error.message, stack: error.stack });
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run example
example();

