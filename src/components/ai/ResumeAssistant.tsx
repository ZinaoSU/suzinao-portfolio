import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card } from '../ui/Card';
import { profile } from '../../data/profile';
import { DigitalHuman, AvatarState } from './DigitalHuman';
import { useSpeechRecognition, useSpeechSynthesis } from '../../hooks/useSpeech';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_BASE = 'http://localhost:3001/api';

export const ResumeAssistant: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isZh
        ? `你好！我是简历对话助手。你可以问我关于 ${profile.nameZh} 的任何问题，比如：

• 他有什么项目经验？
• 他用过哪些 AI 技术？
• 他的职业背景是什么？
• 怎么联系他？

你可以打字或者点击麦克风语音提问哦！`
        : `Hi! I'm the Resume Assistant. Ask me anything about ${profile.name}, such as:

• What project experience does he have?
• What AI technologies has he used?
• What's his professional background?
• How can I contact him?

You can type or click the mic to ask by voice!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // 语音合成
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    isSupported: isTtsSupported,
  } = useSpeechSynthesis({
    lang: isZh ? 'zh-CN' : 'en-US',
    rate: 1.1,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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

  // 调用后端 RAG API
  const callResumeAPI = async (userMessage: string, history: { role: string; content: string }[]) => {
    try {
      const response = await fetch(`${API_BASE}/resume/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: history,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Resume API error:', error);
      // Fallback to local response
      return getLocalResponse(userMessage);
    }
  };

  // 本地备用回答（当后端不可用时）
  const getLocalResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('project') || msg.includes('项目')) {
      return isZh
        ? `苏梓铙有3个主要项目：

1. **字节跳动-Prompt优化平台** (2024.08 - 2025.02)
   - 企业级LLM内部Prompt优化平台
   - 模板创作量提升284%，服务500+用户

2. **WakeUpTime多模态相册检索APP** (2023.09 - 2024.07)
   - 基于CLIP+Spark的多模态图像检索
   - 获校级创新奖

3. **腾讯AI助手API开发** (2023.07 - 2023.09)
   - 基于QLoRA微调LLaMA2
   - 获腾讯A级评价`
        : `Su Zinao has 3 main projects:

1. **ByteDance Prompt Optimization Platform** (2024.08 - 2025.02)
   - Enterprise LLM prompt optimization platform
   - +284% template creation, 500+ users

2. **WakeUpTime Multimodal Album Search** (2023.09 - 2024.07)
   - CLIP + Spark based image retrieval
   - Won school innovation award

3. **Tencent AI Assistant API** (2023.07 - 2023.09)
   - QLoRA fine-tuned LLaMA2
   - Received Tencent A-level evaluation`;
    }

    if (msg.includes('ai') || msg.includes('llm') || msg.includes('人工智能') || msg.includes('gpt')) {
      return isZh
        ? `苏梓铙在 AI 方面有丰富的经验：

• **字节跳动**：设计企业级 Prompt 优化平台
• **腾讯**：QLoRA 微调 LLaMA2，获A级评价
• **学术项目**：CLIP 多模态图像检索

他熟悉的技术包括：LLM, QLoRA, LLaMA2, CLIP, NLP, Prompt Engineering`
        : `Su Zinao has extensive AI experience:

• **ByteDance**: Designed enterprise Prompt optimization platform
• **Tencent**: QLoRA fine-tuned LLaMA2, A-level evaluation
• **Academic**: CLIP multimodal image retrieval

Technologies: LLM, QLoRA, LLaMA2, CLIP, NLP, Prompt Engineering`;
    }

    if (msg.includes('contact') || msg.includes('联系') || msg.includes('email') || msg.includes('邮箱')) {
      return isZh
        ? `你可以联系苏梓铙：

📧 邮箱：suzinao.apply@gmail.com
📱 电话：18948666031
💬 WhatsApp：+852 84956448`
        : `Contact Su Zinao:

📧 Email：suzinao.apply@gmail.com
📱 Phone：18948666031
💬 WhatsApp：+852 84956448`;
    }

    if (msg.includes('skill') || msg.includes('技术') || msg.includes('栈')) {
      return isZh
        ? `苏梓铙的技术栈包括：

**AI/ML**: LLM, Prompt Engineering, QLoRA, CLIP, NLP
**后端**: FastAPI, Docker
**移动**: React Native
**大数据**: Apache Spark

**产品能力**: 产品设计、数据分析、用户研究、项目管理`
        : `Su Zinao's technical skills:

**AI/ML**: LLM, Prompt Engineering, QLoRA, CLIP, NLP
**Backend**: FastAPI, Docker
**Mobile**: React Native
**Big Data**: Apache Spark

**Product**: Product Design, Data Analysis, User Research, Project Management`;
    }

    if (msg.includes('experience') || msg.includes('work') || msg.includes('工作')) {
      return isZh
        ? `苏梓铙的工作经历：

• **字节跳动** 产品经理 (2024.08 - 2025.02)
  Prompt优化平台项目负责人

• **腾讯** 项目负责人 (2023.07 - 2023.09)
  AI助手API开发，获A级评价

• **学术项目** 项目负责人 (2023.09 - 2024.07)
  WakeUpTime多模态检索APP`
        : `Su Zinao's work experience:

• **ByteDance** Product Manager (2024.08 - 2025.02)
  Led Prompt Optimization Platform

• **Tencent** Project Lead (2023.07 - 2023.09)
  AI Assistant API, A-level evaluation

• **Academic** Project Lead (2023.09 - 2024.07)
  WakeUpTime Multimodal Search APP`;
    }

    return isZh
      ? `根据我的了解，${profile.nameZh} 的背景：

• 职位：${profile.titleZh}
• 地点：${profile.location}
• MBTI：${profile.mbti}

他专注于 AI + 产品领域，有字节跳动、腾讯等公司经验。问我具体问题了解更多！`
      : `Based on my knowledge, ${profile.name}'s background:

• Title: ${profile.titleZh}
• Location: ${profile.location}
• MBTI: ${profile.mbti}

He focuses on AI + Product with experience at ByteDance, Tencent, etc. Ask me for more details!`;
  };

  // 通用发送处理
  const handleSendWithText = useCallback(
    async (text: string) => {
      if (!text || isLoading) return;

      stopSpeaking();

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      // 构建历史消息用于 API
      const history = messages.map((m) => ({
        role: m.role as string,
        content: m.content,
      }));

      try {
        // 尝试调用后端 RAG API
        const response = await callResumeAPI(text, history);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // TTS 播报
        if (ttsEnabled && isTtsSupported) {
          speak(response, isZh ? 'zh-CN' : 'en-US');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, stopSpeaking, ttsEnabled, isTtsSupported, speak, isZh]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
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
            {/* TTS 开关 */}
            {isTtsSupported && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setTtsEnabled(!ttsEnabled);
                  if (ttsEnabled) stopSpeaking();
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
            <DigitalHuman state={getAvatarState()} size={130} />

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
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
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
              <div ref={messagesEndRef} />
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
                      : isZh
                      ? '打字或点击麦克风提问...'
                      : 'Type or click mic to ask...'
                  }
                  disabled={isLoading}
                  className="flex-1 bg-dark-cardLight border border-white/10 rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple/50 transition-colors disabled:opacity-50 text-sm"
                />

                {/* 麦克风按钮 */}
                {isMicSupported && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMicClick}
                    disabled={isLoading}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-dark-cardLight border border-white/10 text-gray-400 hover:text-white hover:border-primary-purple/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isListening ? (isZh ? '停止录音' : 'Stop recording') : (isZh ? '语音输入' : 'Voice input')}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </motion.button>
                )}

                {/* 发送按钮 */}
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading}
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
