/**
 * Coze 智能体 API 配置
 *
 * 端点类型：项目型智能体（非标准 Bot），通过 coze.site 流式端点调用
 * 认证方式：JWT Token（来自 Coze 部署页面的 API 密钥）
 */

// 开发环境走 Vite 代理，生产环境走 Cloudflare Workers 代理（或 coze.site 直接）
const isDev = import.meta.env.DEV;

export const COZE_API = {
  // 本地: /api/coze → Vite proxy → coze.site
  // 生产: 需要换成 Cloudflare Workers 代理地址
  endpoint: isDev ? '/api/coze' : 'https://coze-proxy.25434675.workers.dev/stream_run',
  jwt: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjczYzAxZjc3LTY2OWEtNDE1Ni1hMDk2LTU4OWZkOGJiYWYxMSJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbInR6TU9sYXE2aVd1a3A0ZHhpWG5yUzFYS2M4U1lwSDk0Il0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzgwNzUyMjg5LCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjQ4MjU3OTUzMzcxMjU4OTIzIiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjQ4MjcyODQ1MDg0MDMzMDMwIn0.homK_YxXlVq5NxfmJADYjGW6tPB9Enh5I7E14Gc52se1BJG5bw8jz7RIUKfAUgFHClUjGUykYZ_K5XYFCF5iF-mKQgaJOetemlX1Pn4KkZ-uQKpbDxTzHW3W9JlENQ3sDd0-H2hMUzxq9e17SG0wMNWiH42d7Xo_6uz8QmUdO3d08MBd0VVUIXoaLqbicEPOMo2AjbO7ZGh4uFc3NxuQoiQQwcphgwTag5A6Pk59y8zL5MSrnyL3G1Q09IZbValSyGvPXyesuP3CYRKbj8ln4ZcYrZjjOT8_XmGJJFwfDw-WtdlMF_dhBkax6TCOj9jyN3XqehT-NMcXhxgPm_6i9w',
  projectId: 7648247511169335339,
} as const;

/**
 * SSE 事件中的单条消息
 */
interface CozeSSEEvent {
  type: string;
  content: {
    answer: string | null;
    thinking: string | null;
    [key: string]: unknown;
  };
  finish: boolean;
  session_id: string;
  [key: string]: unknown;
}

/**
 * 调用 Coze 智能体，通过 SSE 流式获取回复
 *
 * @param text 用户发送的消息
 * @param sessionId 会话 ID（用于维持多轮对话上下文）
 * @returns 完整的 AI 回复文本
 */
export async function callCozeAgent(text: string, sessionId: string, signal?: AbortSignal): Promise<string> {
  // Coze 官方请求格式（多模态嵌套结构）
  const body = {
    content: {
      query: {
        prompt: [
          {
            type: 'text',
            content: { text },
          },
        ],
      },
    },
    type: 'query',
    session_id: sessionId,
    project_id: COZE_API.projectId,
  };

  const response = await fetch(COZE_API.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COZE_API.jwt}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Coze API error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Coze API: No response body (streaming not supported)');
  }

  // 读取 SSE 流
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // 保留最后一个可能不完整的行
    buffer = lines.pop() || '';

    for (const line of lines) {
      // SSE 格式: "data: {json}" （可能以 "data: " 开头）
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'event: message') continue;

      let jsonStr = trimmed;
      if (jsonStr.startsWith('data: ')) {
        jsonStr = jsonStr.slice(6);
      }

      try {
        const event = JSON.parse(jsonStr) as CozeSSEEvent;
        if (event.type === 'answer' && event.content.answer) {
          result += event.content.answer;
        }
      } catch {
        // 忽略非 JSON 行（如注释或空行）
      }
    }
  }

  return result;
}

/**
 * 生成唯一 session_id
 */
export function generateSessionId(): string {
  return `suzinao_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
