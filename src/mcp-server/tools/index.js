/**
 * MCP Tools Registry
 * This module exports all available MCP tools
 */

import { calculatorTool } from "./calculator.js";
import { weatherTool } from "./weather.js";
import { fileSystemTool } from "./filesystem.js";
import { datetimeTool } from "./datetime.js";

/**
 * Get all available MCP tools
 * @returns {Array} Array of tool definitions
 */
export function getAllTools() {
  return [calculatorTool, weatherTool, fileSystemTool, datetimeTool];
}

/**
 * Get a specific tool by name
 * @param {string} toolName - Name of the tool to retrieve
 * @returns {Object|null} Tool definition or null if not found
 */
export function getTool(toolName) {
  const tools = getAllTools();
  return tools.find((tool) => tool.name === toolName) || null;
}

export { calculatorTool, weatherTool, fileSystemTool, datetimeTool };
