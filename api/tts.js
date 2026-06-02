/**
 * Vercel Serverless Function — TTS 代理
 * 将 Google Translate TTS 包装为 CORS 友好的接口
 * 调用: GET /api/tts?text=你好&lang=zh-CN
 * 返回: audio/mpeg
 */
export default async function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let text, lang;
  if (req.method === 'POST') {
    const body = req.body || {};
    text = body.text;
    lang = body.lang || 'zh-CN';
  } else {
    text = req.query.text;
    lang = req.query.lang || 'zh-CN';
  }

  if (!text) {
    return res.status(400).json({ error: 'Missing "text" parameter' });
  }

  // 截断过长文本（Google TTS 限制约 200 字符）
  const maxLen = 200;
  const truncated = text.length > maxLen ? text.slice(0, maxLen) : text;

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(truncated)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Upstream TTS error: ${response.status}` });
    }

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Length', buffer.byteLength);
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error('[tts] Proxy error:', err.message);
    res.status(502).json({ error: 'TTS proxy failed' });
  }
}
