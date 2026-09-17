/**
 * In-Memory Client-Side Cache for Progress Pulse API requests.
 * 
 * Features:
 * - Instant (0ms) data resolution for cached GET endpoints
 * - Normalized, deterministic cache keys (sorted params)
 * - 5-minute default Time-To-Live (TTL)
 * - Automatic mutation-based invalidation (POST / PUT / DELETE)
 * - Manual invalidation & forceRefresh bypass support
 */

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Normalizes URL and query parameters into a consistent cache key.
   */
  generateKey(url = "", params = {}) {
    if (!url) return "";
    let cleanUrl = String(url).trim();

    // Strip leading /api prefix if present
    if (cleanUrl.startsWith("/api/")) {
      cleanUrl = cleanUrl.replace("/api", "");
    }
    if (!cleanUrl.startsWith("/")) {
      cleanUrl = "/" + cleanUrl;
    }

    if (!params || typeof params !== "object" || Object.keys(params).length === 0) {
      return cleanUrl;
    }

    // Sort query keys alphabetically, ignoring bypass flags
    const sortedKeys = Object.keys(params)
      .filter((k) => k !== "forceRefresh" && k !== "_t")
      .sort();

    if (sortedKeys.length === 0) return cleanUrl;

    const queryString = sortedKeys
      .map((key) => {
        const val = params[key];
        return `${encodeURIComponent(key)}=${encodeURIComponent(val ?? "")}`;
      })
      .join("&");

    return `${cleanUrl}?${queryString}`;
  }

  /**
   * Retrieves valid cached response data or returns null if expired / missing.
   */
  get(url, params) {
    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data,
      status: entry.status,
      headers: entry.headers,
    };
  }

  /**
   * Stores response data with expiration timestamp.
   */
  set(url, params, response, ttl = this.defaultTTL) {
    if (!response || response.status !== 200) return;
    const key = this.generateKey(url, params);
    this.cache.set(key, {
      data: response.data,
      status: response.status,
      headers: response.headers || {},
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Invalidates all cache keys matching a substring or pattern.
   */
  invalidate(pattern) {
    if (!pattern) return;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache.
   */
  clear() {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
export default apiCache;
