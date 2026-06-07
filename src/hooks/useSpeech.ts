import { useState, useRef, useCallback, useEffect } from 'react';

// ========== Speech Recognition ==========

interface UseSpeechRecognitionOptions {
  lang?: string; // 'zh-CN' | 'en-US'
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  error: string | null;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = 'zh-CN', continuous = true, interimResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('浏览器不支持语音识别');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscriptLocal = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptLocal += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        finalTranscriptRef.current = finalTranscriptLocal;
        const displayText = finalTranscriptLocal + interimTranscript;
        setTranscript(displayText);

        if (options.onResult) {
          options.onResult(displayText, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // 静默不算错误，继续监听
          return;
        }
        if (event.error === 'aborted') {
          // 用户主动停止
          return;
        }
        // 网络相关错误使用更友好的提示
        const friendlyError =
          event.error === 'network'
            ? '网络连接不稳定，语音识别暂时不可用，请使用键盘输入'
            : event.error === 'not-allowed'
            ? '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问'
            : `语音识别错误: ${event.error}`;
        setError(friendlyError);
        if (options.onError) {
          options.onError(friendlyError);
        }
      };

      recognition.onend = () => {
        // 如果不是主动停止，自动重启
        if (recognitionRef.current && isListening) {
          // 不要自动重启，让用户控制
        }
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null);
      setTranscript('');
      finalTranscriptRef.current = '';
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setError('语音识别启动失败');
    }
  }, [lang, continuous, interimResults, isListening, options]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    error,
  };
}

// ========== Speech Synthesis (TTS) via Edge TTS ==========

const EDGE_TTS_URL =
  'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const VOICE_MAP: Record<string, string> = {
  'zh-CN': 'zh-CN-XiaoxiaoNeural',
  'en-US': 'en-US-JennyNeural',
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const HEADER_SEPARATOR = new TextEncoder().encode('\r\n\r\n');

function parseBinaryMessage(buffer: ArrayBuffer): { headers: string; body: Uint8Array } | null {
  const view = new Uint8Array(buffer);
  let sepIdx = -1;
  for (let i = 0; i <= view.length - 4; i++) {
    if (
      view[i] === HEADER_SEPARATOR[0] &&
      view[i + 1] === HEADER_SEPARATOR[1] &&
      view[i + 2] === HEADER_SEPARATOR[2] &&
      view[i + 3] === HEADER_SEPARATOR[3]
    ) {
      sepIdx = i;
      break;
    }
  }
  if (sepIdx === -1) return null;
  return {
    headers: new TextDecoder().decode(view.slice(0, sepIdx)),
    body: view.slice(sepIdx + 4),
  };
}

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  voicePreference?: string;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, overrideLang?: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
}

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 1.0, pitch = 1.0 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 清理 markdown 文本
  const cleanText = (text: string): string =>
    text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/•\s/g, '，')
      .replace(/[-*]\s/g, '，')
      .replace(/\.(?=[A-Z])/g, '. ');

  const speak = useCallback(
    (text: string, overrideLang?: string) => {
      // 停止当前播放
      stopSpeakingInternal();

      const targetLang = overrideLang || options.lang || 'zh-CN';
      const voiceName = VOICE_MAP[targetLang] || VOICE_MAP['zh-CN'];
      const clean = cleanText(text);

      if (!clean.trim()) return;

      activeRef.current = true;
      setIsSpeaking(true);

      const ws = new WebSocket(EDGE_TTS_URL);
      wsRef.current = ws;
      const audioChunks: Uint8Array[] = [];

      const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) ws.close();
        setIsSpeaking(false);
      }, 30000);

      ws.onopen = () => {
        // 发送配置消息
        const configMsg =
          `X-Timestamp:${Date.now()}\r\n` +
          `Content-Type:application/json; charset=utf-8\r\n` +
          `Path:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
        ws.send(configMsg);
      };

      ws.onmessage = (event) => {
        if (!activeRef.current) {
          ws.close();
          return;
        }

        if (typeof event.data === 'string') {
          if (event.data.includes('turn.start')) {
            // 发送 SSML
            const ssml =
              `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" ` +
              `xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${targetLang}">` +
              `<voice name="${voiceName}">` +
              `<prosody rate="${rate.toFixed(1)}" pitch="${((pitch - 1) * 50).toFixed(0)}%">` +
              `${escapeXml(clean)}` +
              `</prosody></voice></speak>`;

            const ssmlMsg =
              `X-RequestId:${generateUUID()}\r\n` +
              `Content-Type:application/ssml+xml\r\n` +
              `Path:ssml\r\n\r\n${ssml}`;
            ws.send(ssmlMsg);
          }
        } else if (event.data instanceof Blob) {
          event.data.arrayBuffer().then((buf) => {
            const parsed = parseBinaryMessage(buf);
            if (parsed && parsed.headers.includes('Path:audio')) {
              audioChunks.push(parsed.body);
            }
          });
        } else if (event.data instanceof ArrayBuffer) {
          const parsed = parseBinaryMessage(event.data);
          if (parsed && parsed.headers.includes('Path:audio')) {
            audioChunks.push(parsed.body);
          }
        }
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        wsRef.current = null;
        if (!activeRef.current) return;

        if (audioChunks.length > 0) {
          const totalLen = audioChunks.reduce((sum, c) => sum + c.length, 0);
          const merged = new Uint8Array(totalLen);
          let offset = 0;
          for (const chunk of audioChunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          const blob = new Blob([merged], { type: 'audio/mp3' });
          const url = URL.createObjectURL(blob);

          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setIsSpeaking(false);
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            setIsSpeaking(false);
          };
          audio.play().catch(() => setIsSpeaking(false));
        } else {
          setIsSpeaking(false);
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        wsRef.current = null;
        setIsSpeaking(false);
      };
    },
    [rate, pitch, options.lang]
  );

  const stopSpeakingInternal = useCallback(() => {
    activeRef.current = false;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    stopSpeakingInternal();
    setIsSpeaking(false);
  }, [stopSpeakingInternal]);

  const pauseSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    isSupported,
    pauseSpeaking,
    resumeSpeaking,
  };
}
