/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 * @returns {Promise}       A Promise that resolves to the JSON data.
 */
async function fetchModel(url, options = {}) {
  let targetUrl = url;
  if (typeof window !== "undefined") {
    const host = window.location.host;
    if (host.includes(".csb.app")) {
      // Map frontend port 3000 to backend port 8081 in CodeSandbox
      const cleanHost = host.replace("-3000", "-8081");
      targetUrl = `https://${cleanHost}${url}`;
    }
  }

  const response = await fetch(targetUrl, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include", // Essential to pass session cookies across sandbox domains
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage =
      payload?.message || `Request failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return { data: payload };
}

export default fetchModel;
