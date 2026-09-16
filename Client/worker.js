export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy API requests to Render
    if (url.pathname.startsWith('/api/')) {
      const backendUrl =
        `https://progress-pulse-8cdj.onrender.com${url.pathname}${url.search}`;

      return fetch(new Request(backendUrl, request));
    }

    // Serve React frontend
    return env.ASSETS.fetch(request);
  }
};