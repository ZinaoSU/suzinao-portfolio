import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card } from '../ui/Card';
import { DigitalHuman, AvatarState, DigitalHumanHandle } from './DigitalHuman';
import { useSpeechRecognition } from '../../hooks/useSpeech';
import { callCozeAgent, generateSessionId } from '../../config/coze';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** 轻量 Markdown → HTML：用 <br/> 控制换行，不依赖 CSS margin */
function renderSimpleMarkdown(text: string): string {
  // 1. 转义 HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. 粗体：**text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const lines = html.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 空行 = 段落分隔（<br/><br/> 产生间距）
    if (line === '') {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      // 避免连续多个空行产生过多间距
      if (out.length > 0 && !out[out.length - 1].includes('<br/><br/>')) {
        out.push('<br/><br/>');
      }
      continue;
    }

    // 无序列表
    const ulMatch = line.match(/^[-•]\s+(.+)/);
    if (ulMatch) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // 有序列表
    const olMatch = line.match(/^\d+[.)]\s+(.+)/);
    if (olMatch) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    // 普通文本：关闭列表
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
    out.push(line);

    // 如果下一行非空（同一段内的换行），加单个 <br/>
    if (i < lines.length - 1 && lines[i + 1].trim() !== '') {
      out.push('<br/>');
    }
  }

  if (inUl) { out.push('</ul>'); }
  if (inOl) { out.push('</ol>'); }

  return out.join('');
}

export const ResumeAssistant: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isZh
        ? `你好！我是苏梓铙的数字人简历助手 👋你可以把我当成一个会说话的简历——随便问，我能告诉你关于她的几乎所有公开信息：🎯 想聊实习经历？她有香港智能制造中心AI 3D攀岩相机、法大大的 AI 合规助手客服机器人、北京计算美学商用AIGC生图，还有多项项目经历。你也可以问我任何关于她的问题，比如：

简单介绍一下苏梓铙吧~
对她来讲成长最多的一段经历是什么？
她的职业发展计划是怎样的？

可以打字或者点击麦克风语音提问哦！`
        : `Hi! I'm Su Zinao's Digital Human Resume Assistant! Ask me anything about her, such as:

• What project experience does she have?
• What AI technologies has she used?
• What's her professional background?
• How can I contact her?

You can type or click the mic to ask by voice!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const duixDigitalHumanRef = useRef<DigitalHumanHandle>(null);
  const muteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Coze 会话 ID（整个对话期间保持不变，维持多轮上下文）
  const cozeSessionIdRef = useRef(generateSessionId());

  // 语音识别
  const {
    isListening,
    isSupported: isMicSupported,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    error: micError,
  } = useSpeechRecognition({
    lang: isZh ? 'zh-CN' : 'en-US',
    continuous: true,
  });

  // 语音合成 (Edge TTS 已集成在 TalkingHeadAvatar 中)
  const isTtsSupported = true;

  // 卸载时清理 mute 定时器
  useEffect(() => {
    return () => {
      if (muteTimerRef.current) {
        clearTimeout(muteTimerRef.current);
        muteTimerRef.current = null;
      }
    };
  }, []);

  // 只滚动聊天容器内部，不影响页面滚动位置
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // 语音识别结果实时更新到输入框
  useEffect(() => {
    if (isListening && transcript) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // 语音识别结束后自动发送
  const prevListeningRef = useRef(isListening);
  useEffect(() => {
    const wasListening = prevListeningRef.current;
    prevListeningRef.current = isListening;

    if (wasListening && !isListening && input.trim()) {
      // 延迟一点让输入框更新
      const timer = setTimeout(() => {
        handleSendWithText(input.trim());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // 调用 Coze 智能体 API（流式 SSE，支持 AbortController 中断）
  const callCozeWithRetry = async (userMessage: string, signal?: AbortSignal): Promise<string> => {
    try {
      console.log('[Coze] Sending:', userMessage.substring(0, 50));
      const response = await callCozeAgent(userMessage, cozeSessionIdRef.current, signal);
      console.log('[Coze] Response:', response.substring(0, 60));
      return response;
    } catch (error) {
      // AbortError 是用户主动中断，不需要兜底提示
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      console.error('[Coze] API error:', error);
      // 兜底提示
      return isZh
        ? `抱歉，AI 助手暂时无法连接，请稍后重试。\n\n（错误：${error instanceof Error ? error.message : '未知错误'}）`
        : `Sorry, the AI assistant is temporarily unavailable. Please try again later.\n\n(Error: ${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  };

  // 通用发送处理
  const handleSendWithText = useCallback(
    async (text: string) => {
      if (!text) return;

      // 清除静音定时器
      if (muteTimerRef.current) {
        clearTimeout(muteTimerRef.current);
        muteTimerRef.current = null;
      }

      // 中断当前的任何操作（语音播放 + Coze 请求）
      duixDigitalHumanRef.current?.stop();
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setIsSpeaking(false); // 中断后重置说话状态

      // 创建新的 AbortController
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // 调用 Coze 智能体（SSE 流式）
        const response = await callCozeWithRetry(text, controller.signal);

        // 如果已被中断，不再添加回复
        if (controller.signal.aborted) return;

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // 用数字人说话（edge-tts-proxy，音质接近 Azure Neural）
        setIsSpeaking(true);
        duixDigitalHumanRef.current?.speak(response);
      } catch (error) {
        // AbortError = 用户主动中断，静默处理
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('[Coze] Aborted by user');
          return;
        }
        console.error('Error:', error);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [isZh]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await handleSendWithText(input.trim());
  };

  // 麦克风点击
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 确定数字人状态
  const getAvatarState = (): AvatarState => {
    if (isListening) return 'listening';
    if (isLoading) return 'thinking';
    if (isSpeaking) return 'speaking';
    return 'idle';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="h-[680px] flex flex-col overflow-hidden" hover={false}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-primary-purple/10 to-transparent">
          <div className="flex items-center gap-4">
            {/* 数字人迷你头像 */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-purple to-primary-violet flex items-center justify-center overflow-hidden shadow-lg shadow-primary-purple/20">
              <Bot size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">
                {isZh ? '数字人简历助手' : 'Digital Human Resume Assistant'}
              </h3>
              <p className="text-sm text-gray-400">
                {isZh
                  ? 'AI 数字人 · 支持文字 & 语音对话'
                  : 'AI Digital Human · Text & Voice'}
              </p>
            </div>
            {/* TTS 开关 — 静音后 10 秒自动回到 idle，期间可随时恢复 */}
            {isTtsSupported && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const newTtsEnabled = !ttsEnabled;
                  setTtsEnabled(newTtsEnabled);
                  duixDigitalHumanRef.current?.setMuted(!newTtsEnabled);

                  // 清除旧定时器
                  if (muteTimerRef.current) {
                    clearTimeout(muteTimerRef.current);
                    muteTimerRef.current = null;
                  }

                  // 静音 → 启动 10s 倒计时，超时后自动 stop + 回到 idle
                  if (!newTtsEnabled) {
                    muteTimerRef.current = setTimeout(() => {
                      duixDigitalHumanRef.current?.stop();
                      setIsSpeaking(false);
                      setTtsEnabled(true); // 恢复按钮状态
                      muteTimerRef.current = null;
                    }, 10000);
                  }
                  // 取消静音 → 已清除定时器，音频自动恢复
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  ttsEnabled
                    ? 'bg-primary-purple/20 text-primary-purple'
                    : 'bg-white/5 text-gray-500'
                }`}
                title={ttsEnabled ? (isZh ? '关闭语音播报' : 'Disable TTS') : (isZh ? '开启语音播报' : 'Enable TTS')}
              >
                {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </motion.button>
            )}
          </div>
        </div>

        {/* 主内容区域：数字人 + 聊天 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 左侧：数字人动画 */}
          <div className="w-[200px] flex-shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-dark-card/50 to-dark-bg/50 border-r border-white/5 p-4">
            <DigitalHuman ref={duixDigitalHumanRef} state={getAvatarState()} size={130} onSpeakEnd={() => setIsSpeaking(false)} />

            {/* 状态文字 */}
            <motion.div
              className="mt-3 text-center"
              key={getAvatarState()}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getAvatarState() === 'idle' && (
                <span className="text-xs text-gray-500">
                  {isZh ? '等待你的提问...' : 'Waiting for you...'}
                </span>
              )}
              {getAvatarState() === 'listening' && (
                <span className="text-xs text-primary-purple font-medium animate-pulse">
                  {isZh ? '正在聆听...' : 'Listening...'}
                </span>
              )}
              {getAvatarState() === 'thinking' && (
                <span className="text-xs text-amber-400 font-medium">
                  {isZh ? '思考中...' : 'Thinking...'}
                </span>
              )}
              {getAvatarState() === 'speaking' && (
                <span className="text-xs text-green-400 font-medium">
                  {isZh ? '正在回答...' : 'Speaking...'}
                </span>
              )}
            </motion.div>

            {/* 语音能力标签 */}
            <div className="mt-3 flex flex-col gap-1.5">
              {isMicSupported && (
                <span className="text-[10px] text-gray-600 text-center px-2 py-0.5 rounded-full bg-white/5">
                  {isZh ? '🎤 支持语音输入' : '🎤 Voice input'}
                </span>
              )}
              {isTtsSupported && (
                <span className="text-[10px] text-gray-600 text-center px-2 py-0.5 rounded-full bg-white/5">
                  {isZh ? '🔊 支持语音播报' : '🔊 Voice output'}
                </span>
              )}
            </div>
          </div>

          {/* 右侧：对话区域 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary-purple'
                        : 'bg-dark-cardLight border border-white/10'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-primary-purple" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-purple text-white rounded-tr-sm'
                        : 'bg-dark-cardLight text-gray-300 rounded-tl-sm'
                    }`}
                  >
                    <div
                      className="message-body text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          message.role === 'assistant'
                            ? renderSimpleMarkdown(message.content)
                            : message.content,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-dark-cardLight border border-white/10 flex items-center justify-center">
                    <Bot size={16} className="text-primary-purple" />
                  </div>
                  <div className="bg-dark-cardLight rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.div
                        className="w-2 h-2 bg-primary-purple rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary-violet rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary-purple rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              {/* 语音识别状态提示 */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 px-4 py-2 bg-primary-purple/10 border border-primary-purple/30 rounded-lg flex items-center gap-3"
                  >
                    <motion.div
                      className="w-2 h-2 bg-red-500 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <span className="text-sm text-primary-purple font-medium">
                      {isZh ? '正在聆听... 说完后点击麦克风结束' : 'Listening... click mic to stop'}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {isZh ? '点击麦克风停止' : 'Click mic to stop'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 语音错误提示 */}
              <AnimatePresence>
                {micError && !isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <span className="text-xs text-red-400">{micError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening
                      ? isZh
                        ? '语音识别中...'
                        : 'Recognizing speech...'
                      : isLoading
                      ? isZh
                        ? '回复中，输入新消息可打断...'
                        : 'Replying... type to interrupt'
                      : isSpeaking
                      ? isZh
                        ? '正在播报，输入新消息可打断...'
                        : 'Speaking... type to interrupt'
                      : isZh
                      ? '打字或点击麦克风提问...'
                      : 'Type or click mic to ask...'
                  }
                  className="flex-1 bg-dark-cardLight border border-white/10 rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple/50 transition-colors text-sm"
                />

                {/* 麦克风按钮 */}
                {isMicSupported && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMicClick}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-dark-cardLight border border-white/10 text-gray-400 hover:text-white hover:border-primary-purple/30'
                    }`}
                    title={isListening ? (isZh ? '停止录音' : 'Stop recording') : (isZh ? '语音输入' : 'Voice input')}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </motion.button>
                )}

                {/* 发送按钮 */}
                <motion.button
                  type="submit"
                  disabled={!input.trim()}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-purple to-primary-violet flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-purple/30 transition-all"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
