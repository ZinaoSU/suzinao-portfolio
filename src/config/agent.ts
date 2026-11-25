/**
 * 自研 RAG + Agent API 配置（替代 Coze）
 *
 * 后端：Cloudflare Worker `resume-agent`
 *  - 知识块存 KV，Workers AI bge-m3 在线向量化，llama-3.3-70b 做 ReAct 工具循环
 *  - SSE 事件格式：
 *      { type: 'trace',  step: { name, detail?, ms? } }
 *      { type: 'answer', delta: '...' }
 *      { type: 'done',   usage: { total_ms, tool_rounds, trace_steps } }
 *      { type: 'error',  message: '...' }
 */

const isDev = import.meta.env.DEV;

export const AGENT_API = {
  // 本地: /api/agent → Vite proxy → wrangler dev (http://127.0.0.1:8787)
  // 生产: resume-agent Worker（鉴权、知识库、LLM 全部在 Worker 内，前端零密钥）
  endpoint: isDev ? '/api/agent' : 'https://resume-agent.suzinao-apply.workers.dev/chat',
  // 联想提问接口（回答完成后单独请求，不阻塞语音播报）
  suggestEndpoint: isDev ? '/api/agent-suggest' : 'https://resume-agent.suzinao-apply.workers.dev/suggest',
} as const;

export interface AgentTraceStep {
  name: string;
  detail?: Record<string, unknown>;
  ms?: number;
}

export interface AgentUsage {
  total_ms?: number;
  tool_rounds?: number;
  trace_steps?: number;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

type AgentEvent =
  | { type: 'trace'; step: AgentTraceStep }
  | { type: 'answer'; delta: string }
  | { type: 'done'; usage: AgentUsage };

/**
 * 调用自研 Agent，SSE 流式返回
 *
 * @param question 当前用户问题
 * @param history  对话历史（前端维护，含本轮之前的 user/assistant 消息）
 * @param signal   AbortSignal（打断支持）
 * @param onEvent  流式事件回调（trace / answer delta）
 * @returns 完整回答文本
 */
export async function callAgent(
  question: string,
  history: ChatHistoryMessage[],
  signal: AbortSignal | undefined,
  onEvent?: (event: AgentEvent) => void
): Promise<string> {
  const response = await fetch(AGENT_API.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [...history, { role: 'user', content: question }] }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Agent API error: ${response.status} ${response.statusText}`);
  }
  if (!response.body) {
    throw new Error('Agent API: No response body (streaming not supported)');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      try {
        const event = JSON.parse(trimmed.slice(5).trim()) as AgentEvent;
        if (event.type === 'answer') {
          result += event.delta;
        }
        onEvent?.(event);
      } catch {
        // 忽略非 JSON 行
      }
    }
  }

  return result;
}

/**
 * 生成 3 个联想提问（回答完成后调用，失败静默返回空数组）
 *
 * @param question 访客刚问的问题
 * @param answer   助手给出的回答（用于往下延伸）
 * @param signal   AbortSignal（新提问时取消上一次请求）
 */
export async function fetchSuggestions(
  question: string,
  answer: string,
  signal?: AbortSignal
): Promise<string[]> {
  try {
    const res = await fetch(AGENT_API.suggestEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
      signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { questions?: string[] };
    return Array.isArray(data.questions) ? data.questions.slice(0, 3) : [];
  } catch {
    return [];
  }
}
