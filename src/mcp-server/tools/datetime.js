/**
 * DateTime Tool for MCP
 * Provides current date, time, and timezone information
 */

export const datetimeTool = {
  name: "datetime",
  description:
    "Get the current date, time, or datetime information. Returns the day of the week prominently (e.g., 'Friday', 'Monday'). Can return current date, time, datetime, or timezone information. Always includes the day of the week.",
  inputSchema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: [
          "date",
          "time",
          "datetime",
          "iso",
          "timestamp",
          "mmddyyyy",
          "ddmmyyyy",
        ],
        default: "datetime",
        description:
          "Format to return: 'date' (long format like 'January 2, 2026'), 'time' (HH:MM:SS), 'datetime' (full datetime), 'iso' (ISO 8601), 'timestamp' (Unix timestamp), 'mmddyyyy' (MM-DD-YYYY), or 'ddmmyyyy' (DD-MM-YYYY)",
      },
      timezone: {
        type: "string",
        description:
          "Timezone (e.g., 'America/New_York', 'UTC', 'Europe/London'). Defaults to system timezone.",
      },
    },
  },
  handler: async (params) => {
    const { format = "datetime", timezone } = params;

    try {
      const now = new Date();
      let result;

      // If timezone is specified, we'd need a library like date-fns-tz
      // For now, we'll use the system timezone
      switch (format) {
        case "date":
          const dayOfWeek = now.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const fullDate = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          result = {
            dayOfWeek: dayOfWeek, // Make day of week prominent
            day: dayOfWeek, // Alias for clarity
            date: fullDate,
            dateWithDay: `${dayOfWeek}, ${fullDate}`, // Combined format
            dateShort: now.toISOString().split("T")[0],
            dayNumber: now.getDay(), // 0=Sunday, 1=Monday, ..., 6=Saturday
          };
          break;

        case "time":
          result = {
            time: now.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            time12h: now.toLocaleTimeString("en-US", {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          };
          break;

        case "datetime":
          const dayOfWeekDT = now.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const fullDateDT = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          result = {
            dayOfWeek: dayOfWeekDT, // Make day of week prominent
            day: dayOfWeekDT, // Alias for clarity
            datetime: now.toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }),
            date: fullDateDT,
            dateWithDay: `${dayOfWeekDT}, ${fullDateDT}`, // Combined format
            time: now.toLocaleTimeString("en-US", {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            dayNumber: now.getDay(), // 0=Sunday, 1=Monday, ..., 6=Saturday
          };
          break;

        case "iso":
          result = {
            iso: now.toISOString(),
            isoDate: now.toISOString().split("T")[0],
            isoTime: now.toISOString().split("T")[1].split(".")[0],
          };
          break;

        case "timestamp":
          result = {
            timestamp: Math.floor(now.getTime() / 1000),
            timestampMs: now.getTime(),
          };
          break;

        case "mmddyyyy":
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          const year = now.getFullYear();
          result = {
            mmddyyyy: `${month}-${day}-${year}`,
            formatted: `${month}-${day}-${year}`,
            month,
            day,
            year,
          };
          break;

        case "ddmmyyyy":
          const dayDD = String(now.getDate()).padStart(2, "0");
          const monthMM = String(now.getMonth() + 1).padStart(2, "0");
          const yearYYYY = now.getFullYear();
          result = {
            ddmmyyyy: `${dayDD}-${monthMM}-${yearYYYY}`,
            formatted: `${dayDD}-${monthMM}-${yearYYYY}`,
            day: dayDD,
            month: monthMM,
            year: yearYYYY,
          };
          break;

        default:
          throw new Error(`Unknown format: ${format}`);
      }

      // Add timezone info
      result.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      result.utcOffset = now.getTimezoneOffset();

      return {
        success: true,
        format,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
