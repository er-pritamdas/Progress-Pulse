/**
 * Geographic Location & Timezone Utilities for Progress Pulse
 * Automatically detects user geographic timezone with manual override support.
 */

export const COMMON_TIMEZONES = [
  { value: "auto", label: "Auto-Detect Geographic Location", city: "Auto (Local)", abbr: "AUTO", flag: "🌐" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST - Asia/Kolkata)", city: "India / Kolkata", abbr: "IST", flag: "🇮🇳" },
  { value: "America/New_York", label: "US Eastern Time (ET - America/New_York)", city: "New York", abbr: "ET", flag: "🇺🇸" },
  { value: "America/Chicago", label: "US Central Time (CT - America/Chicago)", city: "Chicago", abbr: "CT", flag: "🇺🇸" },
  { value: "America/Denver", label: "US Mountain Time (MT - America/Denver)", city: "Denver", abbr: "MT", flag: "🇺🇸" },
  { value: "America/Los_Angeles", label: "US Pacific Time (PT - America/Los_Angeles)", city: "Los Angeles", abbr: "PT", flag: "🇺🇸" },
  { value: "Europe/London", label: "London / UK (GMT/BST - Europe/London)", city: "London", abbr: "GMT/BST", flag: "🇬🇧" },
  { value: "Europe/Paris", label: "Central European Time (CET - Europe/Paris)", city: "Paris", abbr: "CET", flag: "🇪🇺" },
  { value: "Europe/Berlin", label: "Germany / Berlin (CET - Europe/Berlin)", city: "Berlin", abbr: "CET", flag: "🇩🇪" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST - Asia/Dubai)", city: "Dubai", abbr: "GST", flag: "🇦🇪" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT - Asia/Singapore)", city: "Singapore", abbr: "SGT", flag: "🇸🇬" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST - Asia/Tokyo)", city: "Tokyo", abbr: "JST", flag: "🇯🇵" },
  { value: "Asia/Hong_Kong", label: "Hong Kong Time (HKT - Asia/Hong_Kong)", city: "Hong Kong", abbr: "HKT", flag: "🇭🇰" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AEST - Australia/Sydney)", city: "Sydney", abbr: "AEST", flag: "🇦🇺" },
  { value: "Pacific/Auckland", label: "New Zealand Time (NZST - Pacific/Auckland)", city: "Auckland", abbr: "NZST", flag: "🇳🇿" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)", city: "UTC", abbr: "UTC", flag: "🌐" },
];

/**
 * Returns the browser's automatically resolved geographic timezone (e.g., "Asia/Kolkata")
 */
export const getSystemGeoTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch (e) {
    return "Asia/Kolkata";
  }
};

/**
 * Gets the active timezone, respecting user preference stored in localStorage
 */
export const getActiveTimeZone = () => {
  const stored = localStorage.getItem("user_timezone");
  if (stored && stored !== "auto") {
    return stored;
  }
  return getSystemGeoTimeZone();
};

/**
 * Formats current date and time based on the active geographic timezone
 */
export const getGeoDateTime = (timeZoneOverride) => {
  const timeZone = timeZoneOverride || getActiveTimeZone();
  const now = new Date();

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).formatToParts(now);

    const lookup = {};
    parts.forEach((p) => {
      lookup[p.type] = p.value;
    });

    const formattedDate = `${lookup.day} ${lookup.month} ${lookup.year}`;

    // Normalize known timezone abbreviations
    let tzAbbr = lookup.timeZoneName || "";
    if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta") {
      tzAbbr = "IST";
    } else if (timeZone === "America/New_York" && tzAbbr.startsWith("GMT")) {
      tzAbbr = "EDT";
    } else if (timeZone === "America/Los_Angeles" && tzAbbr.startsWith("GMT")) {
      tzAbbr = "PDT";
    } else if (timeZone === "Europe/London" && tzAbbr.startsWith("GMT")) {
      tzAbbr = "BST";
    } else if (timeZone === "Asia/Tokyo" && tzAbbr.startsWith("GMT")) {
      tzAbbr = "JST";
    } else if (timeZone === "Asia/Dubai" && tzAbbr.startsWith("GMT")) {
      tzAbbr = "GST";
    } else if (timeZone === "Asia/Singapore" && tzAbbr.startsWith("GMT")) {
      tzAbbr = "SGT";
    }

    const timeOnly = `${lookup.hour}:${lookup.minute}:${lookup.second} ${
      lookup.dayPeriod ? lookup.dayPeriod.toUpperCase() : ""
    }`.trim();

    const formattedTime = tzAbbr ? `${timeOnly} ${tzAbbr}` : timeOnly;

    // Friendly city name extraction
    const city = timeZone.includes("/")
      ? timeZone.split("/")[1].replace(/_/g, " ")
      : timeZone;

    return {
      formattedDate,
      formattedTime,
      timeOnly,
      tzAbbr,
      timeZone,
      city,
    };
  } catch (error) {
    // Fallback gracefully
    const timeOnly = now.toLocaleTimeString();
    return {
      formattedDate: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      formattedTime: timeOnly,
      timeOnly,
      tzAbbr: "",
      timeZone: "UTC",
      city: "UTC",
    };
  }
};
