import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card } from '../ui/Card';
import { profile } from '../../data/profile';
import { DigitalHuman, AvatarState, DigitalHumanHandle } from './DigitalHuman';
import { useSpeechRecognition, useSpeechSynthesis } from '../../hooks/useSpeech';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_BASE = 'https://suzinao-portfolio-production.up.railway.app/api';

export const ResumeAssistant: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isZh
        ? `你好！我是简历对话助手。你可以问我关于 ${profile.nameZh} 的任何问题，比如：

• 她有什么项目经验？
• 她用过哪些 AI 技术？
• 她的职业背景是什么？
• 怎么联系她？

你可以打字或者点击麦克风语音提问哦！`
        : `Hi! I'm the Resume Assistant. Ask me anything about ${profile.name}, such as:

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const duixDigitalHumanRef = useRef<DigitalHumanHandle>(null);

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
    stopSpeaking,
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
        ? `苏梓铙有2个主要项目：

1. **性能领域AI助手API开发（腾讯MINI项目）** (2023.07 - 2023.09)
   - QLoRA+LLaMA2+LangChain训练框架，Streamlit可视化平台
   - 技术方案获腾讯A级评价，应用于核心业务

2. **多模态相册检索APP「WakeUpTime」** (2023.09 - 2024.07)
   - CLIP+Spark相册检索算法，支持文本/图像/语音搜索
   - 搜索准确率提升25%，精准定位产品差异化`
        : `Su Zinao has 2 main projects:

1. **Performance AI Assistant API (Tencent MINI)** (2023.07 - 2023.09)
   - QLoRA+LLaMA2+LangChain framework, Streamlit visualization
   - A-level evaluation, deployed in core business

2. **WakeUpTime Multimodal Album Search** (2023.09 - 2024.07)
   - CLIP+Spark retrieval, text/image/voice search
   - +25% accuracy, precise product differentiation`;
    }

    if (msg.includes('ai') || msg.includes('llm') || msg.includes('人工智能') || msg.includes('gpt')) {
      return isZh
        ? `苏梓铙在 AI 方面有丰富的经验：

• **北京计算美学科技**：负责AI文生图企业产品，推动月活提升120%
• **腾讯MINI项目**：QLoRA+LLaMA2+LangChain训练框架+Streamlit平台，获A级评价
• **学术项目**：CLIP+Spark多模态相册检索，准确率提升25%

她熟悉的技术包括：LLM, QLoRA, LLaMA2, LangChain, CLIP, Spark, NLP, AIGC, Prompt Engineering`
        : `Su Zinao has extensive AI experience:

• **Nolibox**: Led AI text-to-image enterprise product, 120% MAU growth
• **Tencent MINI**: QLoRA+LLaMA2+LangChain framework + Streamlit, A-level
• **Academic**: CLIP+Spark multimodal retrieval, +25% accuracy

Technologies: LLM, QLoRA, LLaMA2, LangChain, CLIP, Spark, NLP, AIGC, Prompt Engineering`;
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

• **香港智能制造中心** 产品经理实习生 (2025.12 - 2026.03)
  AI+攀岩运动硬件产品开发

• **法大大** 产品经理实习生 (2025.06 - 2025.09)
  RAG合规知识库+AI客服机器人，80%自动化响应

• **北京计算美学科技** 产品经理实习生 (2024.05 - 2024.11)
  Nolibox AI文生图产品，月活提升120%

• **大疆创新** 产品运营实习生 (2022.07 - 2022.08)
  Python+YOLO课程，98%满意度，报名率+20%`
        : `Su Zinao's work experience:

• **CIMS HK** Product Manager Intern (2025.12 - 2026.03)
  AI + Climbing sports hardware product

• **FADA** Product Manager Intern (2025.06 - 2025.09)
  RAG knowledge base + AI chatbot, 80% auto response

• **Nolibox** Product Manager Intern (2024.05 - 2024.11)
  AI text-to-image product, 120% MAU growth

• **DJI** Product Operations Intern (2022.07 - 2022.08)
  Python+YOLO course, 98% satisfaction, +20% enrollment`;
    }

    return isZh
      ? `根据我的了解，${profile.nameZh} 的背景：

• 职位：${profile.titleZh}
• 地点：${profile.location}
• MBTI：${profile.mbti}

她专注于 AI + 产品领域，有北京计算美学科技、腾讯等公司经验。问我具体问题了解更多！`
      : `Based on my knowledge, ${profile.name}'s background:

• Title: ${profile.titleZh}
• Location: ${profile.location}
• MBTI: ${profile.mbti}

She focuses on AI + Product with experience at Nolibox, Tencent, etc. Ask me for more details!`;
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

        // 用数字人说话（内部使用浏览器 TTS）
        setIsSpeaking(true);
        duixDigitalHumanRef.current?.speak(response);

        // 估算说话时长，结束后恢复状态
        const estimatedDuration = Math.max(3000, response.length * 50);
        setTimeout(() => setIsSpeaking(false), estimatedDuration);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, stopSpeaking, isZh]
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
            <DigitalHuman ref={duixDigitalHumanRef} state={getAvatarState()} size={130} />

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
