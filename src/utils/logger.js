import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Creates and configures a Winston logger instance
 * @param {Object} config - Logger configuration
 * @returns {winston.Logger} Configured logger instance
 */
export function createLogger(config) {
  const { level, file } = config.logging;

  // Ensure logs directory exists
  const logDir = path.dirname(file);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: 'sparky-agent' },
    transports: [
      // Write all logs to console
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }) => {
              let msg = `${timestamp} [${level}]: ${message}`;
              if (Object.keys(meta).length > 0) {
                msg += ` ${JSON.stringify(meta)}`;
              }
              return msg;
            }
          )
        ),
      }),
      // Write all logs to file
      new winston.transports.File({
        filename: file,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
      // Write errors to separate file
      new winston.transports.File({
        filename: file.replace('.log', '-error.log'),
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
    ],
  });

  return logger;
}

export default createLogger;

