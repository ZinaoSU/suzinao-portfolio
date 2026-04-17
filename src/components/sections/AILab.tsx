import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bot, Mic, Sparkles, ChevronRight, Lock, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { ResumeAssistant } from '../ai/ResumeAssistant';
import { InterviewReview } from '../ai/InterviewReview';
import { LoginModal } from '../ai/LoginModal';
import { useAuth } from '../../hooks/useAuth';

interface AITool {
  id: 'resume' | 'interview';
  icon: React.ReactNode;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  color: string;
  component: React.ReactNode;
}

export const AILab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const { user, login } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingTool, setPendingTool] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    // 检查是否已登录（访客也算已登录）
    if (!user) {
      setPendingTool(toolId);
      setShowLoginModal(true);
      return;
    }
    setActiveTool(toolId);
  };

  const handleLoginSuccess = (loggedInUser: { id: string; email: string; name: string }) => {
    login(loggedInUser);
    if (pendingTool) {
      setActiveTool(pendingTool);
      setPendingTool(null);
    }
  };

  const aiTools: AITool[] = [
    {
      id: 'resume',
      icon: <Bot size={32} />,
      title: 'Resume Assistant',
      titleZh: '简历对话助手',
      description: 'Ask anything about my resume, skills, and experience.',
      descriptionZh: '向我提问关于简历、技能和经验的问题。',
      color: 'purple',
      component: <ResumeAssistant onBack={() => setActiveTool(null)} />,
    },
    {
      id: 'interview',
      icon: <Mic size={32} />,
      title: 'Interview Review',
      titleZh: '面试复盘助手',
      description: 'Upload your interview transcript and get AI-powered analysis.',
      descriptionZh: '上传面试录音转文字稿，AI 帮你分析问题与优化回答。',
      color: 'cyan',
      component: <InterviewReview onBack={() => setActiveTool(null)} />,
    },
  ];

  const colorClasses = {
    purple: 'from-primary-purple to-primary-violet',
    cyan: 'from-primary-cyan to-primary-purple',
    orange: 'from-primary-orange to-primary-purple',
  };

  const borderClasses = {
    purple: 'hover:border-primary-purple/50',
    cyan: 'hover:border-primary-cyan/50',
    orange: 'hover:border-primary-orange/50',
  };

  // 如果有活跃的工具，显示工具界面
  if (activeTool) {
    const tool = aiTools.find((t) => t.id === activeTool);
    if (tool) {
      return (
        <>
          <section id="ailab" className="py-20 md:py-32">
            <div className="max-w-5xl mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <button
                  onClick={() => setActiveTool(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                  <ChevronRight size={20} className="rotate-180" />
                  <span>{isZh ? '返回 AI Lab' : 'Back to AI Lab'}</span>
                </button>
              </motion.div>
              {tool.component}
            </div>
          </section>
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => {
              setShowLoginModal(false);
              setPendingTool(null);
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        </>
      );
    }
  }

  // 默认显示 AI Lab 入口
  return (
    <>
      <section id="ailab" className="py-20 md:py-32 bg-gradient-to-b from-dark-bg to-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-purple/10 border border-primary-purple/30 mb-6">
              <Sparkles size={16} className="text-primary-purple" />
              <span className="text-primary-purple text-sm font-medium">
                {isZh ? 'AI 实验区' : 'AI Lab'}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">
                {isZh ? 'AI 小工具' : 'AI Tools'}
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {isZh
                ? '这里是我的 AI 实践场，用 AI 解决真实问题。快来体验吧！'
                : 'My AI playground where I solve real problems with AI. Try them out!'}
            </p>
          </motion.div>

          {/* User Status Bar */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                <User size={14} className="text-green-400" />
                <span className="text-green-400 text-sm">
                  {isZh ? '已登录' : 'Logged in as'} {user.name}
                </span>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {aiTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                onClick={() => handleToolClick(tool.id)}
                className="cursor-pointer"
              >
                <Card
                  className={`p-8 h-full border border-white/10 ${borderClasses[tool.color as keyof typeof borderClasses]} transition-all duration-300`}
                  hover={false}
                >
                  <div className="flex items-start gap-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClasses[tool.color as keyof typeof colorClasses]} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {isZh ? tool.titleZh : tool.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {isZh ? tool.descriptionZh : tool.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary-purple text-sm font-medium">
                        <Lock size={14} />
                        <span>{isZh ? '开始使用' : 'Get Started'}</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 text-sm">
              {isZh
                ? '🔒 所有对话仅本地处理，不会上传到服务器'
                : '🔒 All conversations are processed locally, no data uploaded to servers'}
            </p>
          </motion.div>
        </div>
      </section>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingTool(null);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};
