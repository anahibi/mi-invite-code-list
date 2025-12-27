export interface Env {
  MISSKEY_HOST: string;
  MISSKEY_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/codes') {
      return handleCodesApi(env);
    }

    // 静的ファイルはそのまま返す
    return fetch(request);
  }
};

async function handleCodesApi(env: Env): Promise<Response> {
  const apiUrl = `https://${env.MISSKEY_HOST}/api/admin/invite/list`;
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.MISSKEY_TOKEN}`
    },
    body: JSON.stringify({ limit: 5, type: 'unused', sort: '-createdAt' })
  });

  if (!res.ok) {
    return new Response('API Error', { status: 500 });
  }

  const data = await res.json();
  const codes = Array.isArray(data)
    ? data.filter(item => item.createdBy.username === 'admin').map(item => item.code)
    : [];

  return new Response(JSON.stringify(codes), {
    headers: { 'Content-Type': 'application/json' }
  });
}
