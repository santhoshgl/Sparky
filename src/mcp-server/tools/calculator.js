/**
 * Calculator Tool for MCP
 * Provides basic mathematical operations
 */

export const calculatorTool = {
  name: 'calculator',
  description: 'Perform basic mathematical calculations including addition, subtraction, multiplication, division, and more advanced operations.',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'modulo'],
        description: 'The mathematical operation to perform',
      },
      a: {
        type: 'number',
        description: 'First number (or base for power/sqrt)',
      },
      b: {
        type: 'number',
        description: 'Second number (or exponent for power, optional for sqrt)',
      },
    },
    required: ['operation', 'a'],
  },
  handler: async (params) => {
    const { operation, a, b } = params;

    try {
      let result;

      switch (operation) {
        case 'add':
          if (b === undefined) {
            throw new Error('Second number (b) is required for addition');
          }
          result = a + b;
          break;

        case 'subtract':
          if (b === undefined) {
            throw new Error('Second number (b) is required for subtraction');
          }
          result = a - b;
          break;

        case 'multiply':
          if (b === undefined) {
            throw new Error('Second number (b) is required for multiplication');
          }
          result = a * b;
          break;

        case 'divide':
          if (b === undefined) {
            throw new Error('Second number (b) is required for division');
          }
          if (b === 0) {
            throw new Error('Division by zero is not allowed');
          }
          result = a / b;
          break;

        case 'power':
          if (b === undefined) {
            throw new Error('Exponent (b) is required for power operation');
          }
          result = Math.pow(a, b);
          break;

        case 'sqrt':
          if (a < 0) {
            throw new Error('Cannot calculate square root of negative number');
          }
          result = Math.sqrt(a);
          break;

        case 'modulo':
          if (b === undefined) {
            throw new Error('Second number (b) is required for modulo operation');
          }
          if (b === 0) {
            throw new Error('Modulo by zero is not allowed');
          }
          result = a % b;
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        success: true,
        result,
        operation: `${operation}(${a}${b !== undefined ? `, ${b}` : ''})`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

