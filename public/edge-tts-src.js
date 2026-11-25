/**
 * edge-tts-proxy — Cloudflare Worker
 *
 * 把微软 Edge "大声朗读" 的 WebSocket TTS 协议封装成简单的 HTTP 接口:
 *   GET /tts?text=你好&voice=zh-CN-XiaoxiaoNeural&rate=+0%&pitch=+0Hz  → audio/mpeg (流式)
 *   GET /voices                                                        → 可用音色列表 (JSON)
 *   GET /                                                              → 自带测试页面
 */

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = "143.0.3650.75"; // 与 edge-tts 7.3.x 保持一致,过旧会被 403
const SYNTH_URL =
  "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
const VOICES_URL =
  "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list";
const OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
const DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";
const MAX_TEXT_LEN = 2000; // 单次请求文本上限,过长请在前端分句

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ===== Sec-MS-GEC v2 令牌（2026-10 微软升级：修改版 SHA-256 + CS64） =====
// 从 rany2/edge-tts drm.py 精确移植，已与 Python 基准逐字节比对通过

const _V2_M = 0xFFFFFFFFn;
const _V2_INITIAL = [
  0x6A09E667n, 0xBB67AE85n, 0x3C6EF372n, 0xA54FF53An,
  0x510E527Fn, 0x9B05688Cn, 0x1F83D9ABn, 0x5BE0CD19n,
];
const _V2_STATE = [
  0xFD9FBEA2n, 0x91243CE7n, 0xBE499094n, 0xCD2E1E0An,
  0x6C006F49n, 0x04BD35ABn, 0xFEB0A7E4n, 0x03EFFBD2n,
];
const _V2_SCHEDULE = [
  0xEB24BF9En, 0x1558691Fn, 0xA0C09EE2n, 0x0CFA32BAn,
  0xA622EE8Cn, 0xD1DD9491n, 0xC0DD25A0n, 0xF9E70AB6n,
  0xF0C31573n, 0x7058CE4En, 0x7188E606n, 0x00E5AB33n,
  0xD258B060n, 0x72766564n,
];
const _V2_RC = [
  0x428A2F98n, 0x71374491n, 0xB5C0FBCFn, 0xE9B5DBA5n,
  0x3956C25Bn, 0x59F111F1n, 0x923F82A4n, 0xAB1C5ED5n,
  0xD807AA98n, 0x12835B01n, 0x243185BEn, 0x550C7DC3n,
  0x72BE5D74n, 0x80DEB1FEn, 0x9BDC06A7n, 0xC19BF174n,
  0xE49B69C1n, 0xEFBE4786n, 0x0FC19DC6n, 0x240CA1CCn,
  0x2DE92C6Fn, 0x4A7484AAn, 0x5CB0A9DCn, 0x76F988DAn,
  0x983E5152n, 0xA831C66Dn, 0xB00327C8n, 0xBF597FC7n,
  0xC6E00BF3n, 0xD5A79147n, 0x06CA6351n, 0x14292967n,
  0x27B70A85n, 0x2E1B2138n, 0x4D2C6DFCn, 0x53380D13n,
  0x650A7354n, 0x766A0ABBn, 0x81C2C92En, 0x92722C85n,
  0xA2BFE8A1n, 0xA81A664Bn, 0xC24B8B70n, 0xC76C51A3n,
  0xD192E819n, 0xD6990624n, 0xF40E3585n, 0x106AA070n,
  0x19A4C116n, 0x1E376C08n, 0x2748774Cn, 0x34B0BCB5n,
  0x391C0CB3n, 0x4ED8AA4An, 0x5B9CCA4Fn, 0x682E6FF3n,
  0x748F82EEn, 0x78A5636Fn, 0x84C87814n, 0x8CC70208n,
  0x90BEFFFAn, 0xA4506CEBn, 0xBEF9A3F7n, 0xC67178F2n,
];
const _V2_ADJ = 0xC9DC06A7n;
const _V2_BLOCK_CONSTANTS = [..._V2_RC.slice(0, 14), _V2_ADJ, ..._V2_RC.slice(15)];
const _V2_SIGMA0_ADJ = 0x059C0B80n;
const _V2_SIGMA1_ADJ = 0x000B92C0n;
const _V2_CS64_COEF = [
  [0xE82E91B1n, 0xB32700D0n], [0x44DE24C6n, 0x88DFF51Dn],
  [0x3BEB65BCn, 0x29514038n], [0xC89C5933n, 0xB328CBDFn],
  [0x8D1EC211n, 0xD405B4D5n], [0x314EF5D5n, 0x26E55F3Cn],
  [0xE92491B1n, 0x607801C6n], [0xF0A5B9D5n, 0x82B2C1FBn],
  [0x06064CF3n, 0xFA51A3DAn], [0xDA79FA60n, 0x207CC464n],
  [0xBED20560n, 0x3C3C74F3n], [0x89F9C9F8n, 0xD2D14B61n],
  [0x35FA38C6n, 0xBB04A2C1n], [0xCB49E3C6n, 0xC5626167n],
];
const _V2_CS64_FACTOR = 0x82893933n;
const _V2_CS64_ADJ0 = 0xF2F90B1An;
const _V2_CS64_ADJ1 = 0x0B1A0000n;

function _v2rol16(v) {
  v &= _V2_M;
  return ((v << 16n) | (v >> 16n)) & _V2_M;
}

function _v2wordsLe4Even(bytes) {
  const paddedLen = bytes.length + (((-bytes.length) % 4) + 4) % 4;
  const words = [];
  for (let i = 0; i < paddedLen; i += 4) {
    let w = 0n;
    for (let j = 0; j < 4; j++) {
      const b = i + j < bytes.length ? bytes[i + j] : 0;
      w |= BigInt(b) << BigInt(8 * j);
    }
    words.push(w);
  }
  if (words.length % 2) words.push(0n);
  return words;
}

function _v2sigma0Raw(v) {
  return (v >> 7n) ^ (v << 25n) ^ (v >> 18n) ^ (v << 14n) ^ (v >> 3n);
}
function _v2sigma1Raw(v) {
  return (v >> 17n) ^ (v << 15n) ^ (v >> 19n) ^ (v << 13n) ^ (v >> 10n);
}

function _v2rounds(state, words, firstRound = 0) {
  let [a, b, c, d, e, f, g, h] = state;
  const K = firstRound === 14 ? _V2_BLOCK_CONSTANTS : _V2_RC;
  const aligned = Math.min(64, Math.floor((firstRound + 7) / 8) * 8);
  for (let i = firstRound; i < aligned; i++) {
    const rotE = e * 0x100000001n;
    const rotA = a * 0x100000001n;
    const t1 = h + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (g ^ (e & (f ^ g))) + K[i] + words[i];
    const t2 = ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((a & b) | (c & (a | b)));
    [a, b, c, d, e, f, g, h] = [(t1 + t2) & _V2_M, a, b, c, (d + t1) & _V2_M, e, f, g];
  }
  for (let i = aligned; i < 64; i += 8) {
    let rotE = e * 0x100000001n;
    let rotA = a * 0x100000001n;
    let t1 = h + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (g ^ (e & (f ^ g))) + K[i] + words[i];
    d = (d + t1) & _V2_M;
    h = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((a & b) | (c & (a | b)))) & _V2_M;

    rotE = d * 0x100000001n;
    rotA = h * 0x100000001n;
    t1 = g + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (f ^ (d & (e ^ f))) + K[i + 1] + words[i + 1];
    c = (c + t1) & _V2_M;
    g = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((h & a) | (b & (h | a)))) & _V2_M;

    rotE = c * 0x100000001n;
    rotA = g * 0x100000001n;
    t1 = f + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (e ^ (c & (d ^ e))) + K[i + 2] + words[i + 2];
    b = (b + t1) & _V2_M;
    f = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((g & h) | (a & (g | h)))) & _V2_M;

    rotE = b * 0x100000001n;
    rotA = f * 0x100000001n;
    t1 = e + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (d ^ (b & (c ^ d))) + K[i + 3] + words[i + 3];
    a = (a + t1) & _V2_M;
    e = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((f & g) | (h & (f | g)))) & _V2_M;

    rotE = a * 0x100000001n;
    rotA = e * 0x100000001n;
    t1 = d + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (c ^ (a & (b ^ c))) + K[i + 4] + words[i + 4];
    h = (h + t1) & _V2_M;
    d = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((e & f) | (g & (e | f)))) & _V2_M;

    rotE = h * 0x100000001n;
    rotA = d * 0x100000001n;
    t1 = c + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (b ^ (h & (a ^ b))) + K[i + 5] + words[i + 5];
    g = (g + t1) & _V2_M;
    c = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((d & e) | (f & (d | e)))) & _V2_M;

    rotE = g * 0x100000001n;
    rotA = c * 0x100000001n;
    t1 = b + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (a ^ (g & (h ^ a))) + K[i + 6] + words[i + 6];
    f = (f + t1) & _V2_M;
    b = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((c & d) | (e & (c | d)))) & _V2_M;

    rotE = f * 0x100000001n;
    rotA = b * 0x100000001n;
    t1 = a + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (h ^ (f & (g ^ h))) + K[i + 7] + words[i + 7];
    e = (e + t1) & _V2_M;
    a = (t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((b & c) | (d & (b | c)))) & _V2_M;
  }
  return [a, b, c, d, e, f, g, h];
}

function _v2expand(words, firstWord = 16) {
  for (let index = firstWord; index < 64; index++) {
    const x = words[index - 2];
    const y = words[index - 15];
    const s1 = (x >> 17n) ^ (x << 15n) ^ (x >> 19n) ^ (x << 13n) ^ (x >> 10n);
    const s0 = (y >> 7n) ^ (y << 25n) ^ (y >> 18n) ^ (y << 14n) ^ (y >> 3n);
    words.push((s1 + words[index - 7] + s0 + words[index - 16]) & _V2_M);
  }
}

function _v2init(head7) {
  const words = new Array(14).fill(0n);
  words.push(BigInt((head7[0] << 16) | (head7[1] << 8) | head7[2]));
  words.push(BigInt((head7[3] << 24) | (head7[4] << 16) | (head7[5] << 8) | head7[6]));
  for (let index = 16; index < 30; index++) {
    let value = _V2_SCHEDULE[index - 16];
    if (index - 2 >= 14) {
      value += index === 16 ? (_v2sigma1Raw(words[index - 2]) ^ _V2_SIGMA1_ADJ) : _v2sigma1Raw(words[index - 2]);
    }
    if (index - 7 >= 14) value += words[index - 7];
    if (index - 15 >= 14) {
      value += index === 29 ? (_v2sigma0Raw(words[index - 15]) ^ _V2_SIGMA0_ADJ) : _v2sigma0Raw(words[index - 15]);
    }
    words.push(value & _V2_M);
  }
  words.push(
    (_v2sigma1Raw(words[28]) + words[23] + _v2sigma0Raw(words[15]) + words[14] + _V2_ADJ - _V2_RC[14]) & _V2_M
  );
  _v2expand(words, 31);
  const working = _v2rounds(_V2_STATE, words, 14);
  return _V2_INITIAL.map((x, i) => (x + working[i]) & _V2_M);
}

function _v2sha256(data) {
  if (data.length < 7) throw new Error("Token salt must contain at least seven bytes");
  const length = 57 + data.length;
  const zeros = (((55 - length) % 64) + 64) % 64;
  const padded = [...data.slice(7), 0x80, ...new Array(zeros).fill(0)];
  const lenBits = BigInt(length) * 8n;
  for (let i = 7; i >= 0; i--) padded.push(Number((lenBits >> BigInt(8 * i)) & 0xffn));
  let state = _v2init(data.slice(0, 7));
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = [];
    for (let i = 0; i < 16; i++) {
      let w = 0n;
      for (let j = 0; j < 4; j++) w = (w << 8n) | BigInt(padded[offset + i * 4 + j]);
      words.push(w);
    }
    _v2expand(words);
    const working = _v2rounds(state, words);
    state = state.map((x, i) => (x + working[i]) & _V2_M);
  }
  return state;
}

function _v2bswap32(w) {
  return ((w & 0xffn) << 24n) | ((w & 0xff00n) << 8n) | ((w >> 8n) & 0xff00n) | ((w >> 24n) & 0xffn);
}

function _v2cs64(data, digestWords) {
  const keyA = (_v2bswap32(digestWords[0]) | 1n) & _V2_M;
  const keyB = (_v2bswap32(digestWords[1]) | 1n) & _V2_M;
  const factors = [(keyA * _V2_CS64_FACTOR) & _V2_M, (keyB * _V2_CS64_FACTOR) & _V2_M];
  const terms = _V2_CS64_COEF.map(([coef], i) => (coef * factors[i % 2]) & _V2_M);
  const offsets = _V2_CS64_COEF.map(([, off]) => off);
  const wordsIn = _v2wordsLe4Even([0, ...data]);
  for (let index = 0; index < wordsIn.length; index++) {
    const word = wordsIn[index];
    let term = word * (index % 2 === 0 ? keyA : keyB);
    let offset = _v2rol16(word) * (index % 2 === 0 ? 0xEF0569FBn : 0xC31713DBn);
    if (index === 0) {
      term += _V2_CS64_ADJ0 * factors[0];
      offset += _V2_CS64_ADJ1;
    }
    terms.push(term & _V2_M);
    offsets.push(offset & _V2_M);
  }
  let swapAcc = 0n, swapLast = 0n, state = 0n, acc = 0n;
  for (let index = 0; index < terms.length; index += 2) {
    const x = terms[index];
    const y = terms[index + 1];
    let t = _v2rol16((offsets[index] + x) & _V2_M);
    let q = (t * 0x76F50F34n) & _V2_M;
    swapAcc += (_v2rol16(q) * 0xC3EFEA97n + q) & _V2_M;
    t = _v2rol16((offsets[index + 1] + y) & _V2_M);
    q = (t * 0x1881CE3Cn) & _V2_M;
    swapLast = (_v2rol16(q) * 0x35BD1EC9n + q) & _V2_M;
    swapAcc = (swapAcc + swapLast) & _V2_M;

    state = (state * keyA + x) & _V2_M;
    state = (_v2rol16(state) * 0xCF98B111n) & _V2_M;
    state = (_v2rol16(state) * 0x87085B9Fn) & _V2_M;
    state = (_v2rol16(state) * 0x12CEB96Dn) & _V2_M;
    state = (_v2rol16(state) * 0x257E1D83n) & _V2_M;
    acc += state;
    t = (state * keyB + y) & _V2_M;
    t = (_v2rol16(t) * 0xA27416F5n) & _V2_M;
    t = (_v2rol16(t) * 0xD38396FFn) & _V2_M;
    state = (_v2rol16((_v2rol16(t) * 0x7C932B89n) & _V2_M) * 0xBFA49F69n) & _V2_M;
    acc = (acc + state) & _V2_M;
  }
  return [swapLast ^ state, swapAcc ^ acc];
}

/** 生成 v2 令牌，格式 "<cs64 16hex>-<sha256 64hex>" */
function genSecMsGecV2() {
  // 与 Python f"{ticks:.0f}" 保持同一浮点路径（ticks 会超过 2^53，舍入必须一致）
  let ticks = Math.floor(Date.now() / 1000) + 11644473600;
  ticks -= ticks % 300;
  ticks *= 1e7;
  const strToHash = Math.round(ticks).toString() + TRUSTED_CLIENT_TOKEN;
  const bytes = [...new TextEncoder().encode(strToHash)];
  const digestWords = _v2sha256(bytes);
  const [wA, wB] = _v2cs64(bytes, digestWords.slice(0, 2));
  const le = (w) =>
    [Number(w & 0xffn), Number((w >> 8n) & 0xffn), Number((w >> 16n) & 0xffn), Number((w >> 24n) & 0xffn)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  const sha256Hex = digestWords.map((w) => w.toString(16).toUpperCase().padStart(8, "0")).join("");
  return `${le(wA)}${le(wB)}-${sha256Hex}`;
}


function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function uuid() {
  return crypto.randomUUID().replace(/-/g, "");
}

/** edge-tts 使用的 JS 风格日期串,如 "Sun Jun 08 2026 02:30:00 GMT+0000 (Coordinated Universal Time)" */
function jsDateString() {
  const d = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${p(d.getUTCDate())} ` +
    `${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:` +
    `${p(d.getUTCSeconds())} GMT+0000 (Coordinated Universal Time)`
  );
}

/** 建立到微软 TTS 服务的 WebSocket 连接(Workers 的 fetch-upgrade 方式) */
async function connectTts() {
  const gec = genSecMsGecV2();
  const url =
    `${SYNTH_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}` +
    `&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=2-${CHROMIUM_FULL_VERSION}` +
    `&ConnectionId=${uuid()}`;
  const resp = await fetch(url, {
    headers: {
      Upgrade: "websocket",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: "muid=" + crypto.randomUUID().replace(/-/g, "").toUpperCase() + ";",
      Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
    },
  });
  const ws = resp.webSocket;
  if (!ws) {
    const body = await resp.text().catch(() => "");
    throw new Error(
      `WebSocket upgrade failed: HTTP ${resp.status} ${body.slice(0, 300)}`
    );
  }
  ws.accept();
  return ws;
}

/** 合成一段文本,返回流式 Response (audio/mpeg) */
async function handleTts(params) {
  const text = (params.get("text") || "").trim();
  if (!text) return jsonError(400, "missing ?text=");
  if (text.length > MAX_TEXT_LEN) {
    return jsonError(400, `text too long (>${MAX_TEXT_LEN} chars), split it client-side`);
  }
  const voice = params.get("voice") || DEFAULT_VOICE;
  const rate = params.get("rate") || "+0%";
  const pitch = params.get("pitch") || "+0Hz";
  const volume = params.get("volume") || "+0%";

  const ws = await connectTts();
  const requestId = uuid();
  const timestamp = jsDateString();

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  let closed = false;
  const finish = (err) => {
    if (closed) return;
    closed = true;
    try { ws.close(); } catch (_) {}
    if (err) writer.abort(err).catch(() => {});
    else writer.close().catch(() => {});
  };

  /** 兼容 ArrayBuffer / TypedArray / Blob 的二进制取值 */
  const toU8 = async (data) => {
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    if (data && typeof data.arrayBuffer === "function") {
      return new Uint8Array(await data.arrayBuffer()); // Blob
    }
    return null;
  };

  const handleMessage = async (data) => {
    if (typeof data === "string") {
      if (data.includes("Path:turn.end")) finish();
      return;
    }
    // 二进制帧: [2字节大端 header 长度][headers][audio payload]
    const buf = await toU8(data);
    if (!buf || buf.length < 2) return;
    const headerLen = (buf[0] << 8) | buf[1];
    const header = new TextDecoder().decode(buf.subarray(2, 2 + headerLen));
    if (header.includes("Path:audio")) {
      const payload = buf.subarray(2 + headerLen);
      if (payload.length > 0) await writer.write(payload);
    }
  };

  // 串行处理,保证音频帧顺序(Blob 取值是异步的)
  let queue = Promise.resolve();
  ws.addEventListener("message", (ev) => {
    queue = queue.then(() => handleMessage(ev.data)).catch(() => {});
  });
  ws.addEventListener("close", () => {
    queue = queue.then(() => finish());
  });
  ws.addEventListener("error", () => {
    queue = queue.then(() => finish(new Error("upstream websocket error")));
  });

  // 1) speech.config — 注意:JSON 后的尾部 \r\n 是协议要求,缺了服务端不响应
  ws.send(
    `X-Timestamp:${timestamp}\r\n` +
    `Content-Type:application/json; charset=utf-8\r\n` +
    `Path:speech.config\r\n\r\n` +
    `{"context":{"synthesis":{"audio":{"metadataoptions":{` +
    `"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},` +
    `"outputFormat":"${OUTPUT_FORMAT}"}}}}\r\n`
  );
  // 2) SSML — X-Timestamp 末尾的 Z 是 Edge 自身的 bug,服务端依赖它
  const ssml =
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>` +
    `<voice name='${voice}'>` +
    `<prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>` +
    escapeXml(text) +
    `</prosody></voice></speak>`;
  ws.send(
    `X-RequestId:${requestId}\r\n` +
    `Content-Type:application/ssml+xml\r\n` +
    `X-Timestamp:${timestamp}Z\r\n` +
    `Path:ssml\r\n\r\n` +
    ssml
  );

  return new Response(readable, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
    },
  });
}

/** 音色列表 */
async function handleVoices() {
  const gec = genSecMsGecV2();
  const resp = await fetch(
    `${VOICES_URL}?trustedclienttoken=${TRUSTED_CLIENT_TOKEN}` +
    `&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=2-${CHROMIUM_FULL_VERSION}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
      },
    }
  );
  return new Response(resp.body, {
    status: resp.status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function jsonError(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

const TEST_PAGE = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>edge-tts-proxy 测试页</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 16px; }
  textarea { width: 100%; height: 90px; font-size: 15px; padding: 8px; box-sizing: border-box; }
  select, button { font-size: 15px; padding: 6px 14px; margin: 8px 8px 8px 0; }
  #stat { color: #666; font-size: 13px; }
</style>
</head>
<body>
<h2>🔊 edge-tts-proxy</h2>
<textarea id="text">我们今天来聊聊 Transformer 模型,它在 NLP 领域取得了 state-of-the-art 的效果。</textarea>
<div>
  <select id="voice">
    <option value="zh-CN-XiaoxiaoNeural">晓晓 (女)</option>
    <option value="zh-CN-YunxiNeural">云希 (男)</option>
    <option value="zh-CN-XiaoyiNeural">晓伊 (女·温柔)</option>
    <option value="zh-CN-YunjianNeural">云健 (男·浑厚)</option>
    <option value="zh-HK-HiuMaanNeural">曉曼 (粤语)</option>
    <option value="en-US-AriaNeural">Aria (EN)</option>
    <option value="en-US-GuyNeural">Guy (EN)</option>
  </select>
  <button id="play">▶ 合成并播放</button>
</div>
<p id="stat"></p>
<script>
const stat = document.getElementById('stat');
document.getElementById('play').onclick = () => {
  const text = document.getElementById('text').value;
  const voice = document.getElementById('voice').value;
  const url = '/tts?text=' + encodeURIComponent(text) + '&voice=' + encodeURIComponent(voice);
  const t0 = performance.now();
  stat.textContent = '请求中…';
  const audio = new Audio(url);
  audio.addEventListener('playing', () => {
    stat.textContent = '开始出声: ' + Math.round(performance.now() - t0) + ' ms';
  }, { once: true });
  audio.addEventListener('error', () => { stat.textContent = '加载失败,看控制台'; });
  audio.play();
};
</script>
</body>
</html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    try {
      switch (url.pathname) {
        case "/":
          return new Response(TEST_PAGE, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        case "/tts":
          return await handleTts(url.searchParams);
        case "/voices":
          return await handleVoices();
        default:
          return jsonError(404, "not found");
      }
    } catch (e) {
      return jsonError(502, String(e && e.message ? e.message : e));
    }
  },
};
