const TARGET = "https://iwwwpgdrasrhmrhncsim.supabase.co/functions/v1/content-manager";

exports.handler = async (event) => {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return { statusCode: 405, headers: { Allow: 'GET, POST' }, body: 'Method Not Allowed' };
  }

  const headers = {};
  for (const name of ['apikey', 'authorization', 'content-type']) {
    const value = event.headers?.[name];
    if (value) headers[name] = value;
  }

  try {
    const response = await fetch(TARGET, {
      method: event.httpMethod,
      headers,
      body: event.httpMethod === 'POST' ? event.body : undefined
    });
    return {
      statusCode: response.status,
      headers: { 'content-type': response.headers.get('content-type') || 'application/json; charset=utf-8' },
      body: await response.text()
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'content_proxy_failed', detail: error.message })
    };
  }
};
