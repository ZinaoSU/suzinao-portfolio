/**
 * Cloudflare Worker - Coze API CORS Proxy
 * 
 * 部署步骤：
 * 1. 登录 https://dash.cloudflare.com/ (免费注册)
 * 2. Workers & Pages → Create application → Create Worker
 * 3. 编辑代码，把下面内容贴进去
 * 4. Save and deploy
 * 5. 把 worker 的 URL 填到 src/config/coze.ts 的 endpoint 里
 */

const COZE_ORIGIN = 'https://p7gpkjk7wn.coze.site';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 只代理 /stream_run 路径
    if (!url.pathname.endsWith('/stream_run')) {
      return new Response('Not Found', { status: 404 });
    }

    // 构建目标 URL
    const targetUrl = COZE_ORIGIN + '/stream_run';

    // 复制请求头（除了 host）
    const headers = new Headers(request.headers);
    headers.delete('host');

    // 转发请求
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
    });

    // 复制响应并添加 CORS 头
    const corsHeaders = new Headers(response.headers);
    corsHeaders.set('Access-Control-Allow-Origin', '*');
    corsHeaders.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    corsHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: corsHeaders,
    });
  },
};
