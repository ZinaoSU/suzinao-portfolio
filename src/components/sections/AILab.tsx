import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { ResumeAssistant } from '../ai/ResumeAssistant';

interface AITool {
  id: 'resume';
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
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const aiTools: AITool[] = [
    {
      id: 'resume',
      icon: <Bot size={32} />,
      title: 'Digital Human Assistant',
      titleZh: '数字人简历助手',
      description: 'AI digital human assistant. Talk by text or voice to learn about my resume.',
      descriptionZh: 'AI 数字人助手，支持文字和语音对话，了解我的简历与经历。',
      color: 'purple',
      component: <ResumeAssistant onBack={() => setActiveTool(null)} />,
    },
  ];

  const colorClasses = {
    purple: 'from-primary-purple to-primary-violet',
  };

  const borderClasses = {
    purple: 'hover:border-primary-purple/50',
  };

  // 如果有活跃的工具，显示工具界面
  if (activeTool) {
    const tool = aiTools.find((t) => t.id === activeTool);
    if (tool) {
      return (
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
      );
    }
  }

  // 默认显示 AI Lab 入口（免登录，直接可用）
  return (
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

        <div className="max-w-md mx-auto">
          {aiTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              onClick={() => setActiveTool(tool.id)}
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
                      <span>{isZh ? '立即体验' : 'Try Now'}</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
