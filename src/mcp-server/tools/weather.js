/**
 * Weather Tool for MCP
 * Provides weather information (mock implementation)
 * In production, this would connect to a real weather API
 */

export const weatherTool = {
  name: 'weather',
  description: 'Get current weather information for a specific location. Returns temperature, conditions, and other weather data.',
  inputSchema: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or location (e.g., "San Francisco", "New York, NY")',
      },
      units: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius',
        description: 'Temperature units',
      },
    },
    required: ['location'],
  },
  handler: async (params) => {
    const { location, units = 'celsius' } = params;

    try {
      // Mock weather data - In production, replace with actual API call
      // Example: const response = await fetch(`https://api.weather.com/v1/current?location=${location}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Mock weather response
      const mockWeatherData = {
        location: location,
        temperature: units === 'celsius' ? 22 : 72,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 15,
        units: units,
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockWeatherData,
        note: 'This is mock data. Replace with actual weather API integration in production.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch weather data',
      };
    }
  },
};

