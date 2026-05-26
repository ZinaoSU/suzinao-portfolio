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
        setError(`语音识别错误: ${event.error}`);
        if (options.onError) {
          options.onError(event.error);
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

// ========== Speech Synthesis (TTS) ==========

interface UseSpeechSynthesisOptions {
  lang?: string; // 'zh-CN' | 'en-US'
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
  const { rate = 1.1, pitch = 1.0 } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' && 'speechSynthesis' in window
    );
  }, []);

  // 获取最佳语音
  const getBestVoice = useCallback(
    (lang: string): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return null;

      // 精确匹配
      let voice = voices.find((v) => v.lang === lang);
      // 前缀匹配
      if (!voice) {
        voice = voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
      }
      // 默认中文语音
      if (!voice && lang.startsWith('zh')) {
        voice = voices.find(
          (v) => v.lang.startsWith('zh') || v.name.includes('Ting-Ting') || v.name.includes('Yaoyao')
        );
      }
      // 默认英文语音
      if (!voice && lang.startsWith('en')) {
        voice = voices.find(
          (v) => v.lang.startsWith('en') && v.name.includes('Google')
        ) || voices.find((v) => v.lang.startsWith('en'));
      }

      return voice || voices[0];
    },
    []
  );

  const speak = useCallback(
    (text: string, overrideLang?: string) => {
      if (!isSupported) return;

      // Stop any current speech
      window.speechSynthesis.cancel();

      // 清理文本（移除 markdown 格式符号）
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/•\s/g, '，')
        .replace(/[-*]\s/g, '，')
        // 将英文句号后加空格以便TTS更好读
        .replace(/\.(?=[A-Z])/g, '. ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = pitch;

      const targetLang = overrideLang || options.lang || 'zh-CN';
      utterance.lang = targetLang;

      const voice = getBestVoice(targetLang);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, rate, pitch, options.lang, getBestVoice]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const resumeSpeaking = useCallback(() => {
    window.speechSynthesis.resume();
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
