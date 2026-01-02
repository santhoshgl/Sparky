import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * File System Tool for MCP
 * Provides safe file system operations
 * Note: In production, add proper security checks and path validation
 */

export const fileSystemTool = {
  name: 'filesystem',
  description: 'Read, write, and manage files in the workspace. Use with caution as it can modify files.',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['read', 'write', 'list', 'exists', 'delete'],
        description: 'The file system operation to perform',
      },
      path: {
        type: 'string',
        description: 'File or directory path (relative to workspace root)',
      },
      content: {
        type: 'string',
        description: 'Content to write (required for write operation)',
      },
    },
    required: ['operation', 'path'],
  },
  handler: async (params) => {
    const { operation, path: filePath, content } = params;

    try {
      // Security: Resolve path to prevent directory traversal
      const workspaceRoot = path.resolve(process.cwd());
      const resolvedPath = path.resolve(workspaceRoot, filePath);
      
      // Ensure the resolved path is within workspace
      if (!resolvedPath.startsWith(workspaceRoot)) {
        throw new Error('Path traversal detected. Access denied.');
      }

      let result;

      switch (operation) {
        case 'read':
          const fileContent = await fs.readFile(resolvedPath, 'utf-8');
          result = {
            path: filePath,
            content: fileContent,
            size: fileContent.length,
          };
          break;

        case 'write':
          if (!content) {
            throw new Error('Content is required for write operation');
          }
          await fs.writeFile(resolvedPath, content, 'utf-8');
          result = {
            path: filePath,
            message: 'File written successfully',
            size: content.length,
          };
          break;

        case 'list':
          const items = await fs.readdir(resolvedPath);
          const itemsWithStats = await Promise.all(
            items.map(async (item) => {
              const itemPath = path.join(resolvedPath, item);
              const stats = await fs.stat(itemPath);
              return {
                name: item,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                modified: stats.mtime.toISOString(),
              };
            })
          );
          result = {
            path: filePath,
            items: itemsWithStats,
          };
          break;

        case 'exists':
          try {
            await fs.access(resolvedPath);
            result = {
              path: filePath,
              exists: true,
            };
          } catch {
            result = {
              path: filePath,
              exists: false,
            };
          }
          break;

        case 'delete':
          const stats = await fs.stat(resolvedPath);
          if (stats.isDirectory()) {
            await fs.rmdir(resolvedPath, { recursive: true });
          } else {
            await fs.unlink(resolvedPath);
          }
          result = {
            path: filePath,
            message: 'Deleted successfully',
          };
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        success: true,
        operation,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'File system operation failed',
      };
    }
  },
};

