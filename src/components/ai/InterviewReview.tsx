import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Upload, Mic, FileText, AlertCircle, CheckCircle, Lightbulb, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AnalysisResult {
  questions: QuestionAnalysis[];
}

interface QuestionAnalysis {
  question: string;
  type: 'technical' | 'behavioral' | 'project';
  currentAnswer: string;
  issues: string[];
  improvedAnswer: string;
}

export const InterviewReview: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 示例面试稿
  const sampleTranscript = isZh
    ? `面试官：请介绍一下你自己，以及你最近做的项目。
应聘者：我是XXX，有3年产品经理经验。最近在做一个AI助手产品...
面试官：这个项目遇到了什么技术挑战？
应聘者：主要是...呃...数据处理比较复杂。
面试官：你如何衡量产品成功的指标？
应聘者：我们主要看用户量和留存率。`
    : `Interviewer: Please introduce yourself and your recent project.
Candidate: I'm XXX, with 3 years of PM experience. Recently working on an AI assistant product...
Interviewer: What technical challenges did you face?
Candidate: Mainly... um... data processing was complex.
Interviewer: How do you measure product success metrics?
Candidate: We mainly look at user volume and retention.`;

  // 模拟 AI 分析结果
  const analyzeTranscript = (text: string): AnalysisResult => {
    // 实际项目中这里会调用后端 API
    return {
      questions: [
        {
          question: isZh ? '请介绍一下你自己，以及你最近做的项目。' : 'Please introduce yourself and your recent project.',
          type: 'behavioral',
          currentAnswer: isZh ? '我是XXX，有3年产品经理经验...' : "I'm XXX, with 3 years of PM experience...",
          issues: isZh
            ? [
                '回答过于简短，缺乏具体细节',
                '没有突出与目标岗位相关的经验',
                '缺少量化成果',
              ]
            : [
                'Answer is too brief, lacks specific details',
                'Did not highlight experience relevant to target position',
                'Missing quantified results',
              ],
          improvedAnswer: isZh
            ? '我是XXX，拥有3年AI产品经验。在最近的项目中，我带领团队从0到1打造了一款日活10万+的AI助手产品，负责产品规划、需求管理和跨部门协作。'
            : "I'm XXX with 3 years of AI product experience. In my recent project, I led the team to build an AI assistant product with 100K+ daily active users, responsible for product planning, requirements management, and cross-team collaboration.",
        },
        {
          question: isZh ? '这个项目遇到了什么技术挑战？' : 'What technical challenges did you face?',
          type: 'technical',
          currentAnswer: isZh ? '主要是...呃...数据处理比较复杂。' : 'Mainly... um... data processing was complex.',
          issues: isZh
            ? [
                '回答支支吾吾，显得不自信',
                '没有具体说明是什么挑战',
                '缺少解决方案的描述',
              ]
            : [
                'Hesitant delivery shows lack of confidence',
                'Did not specify what the challenge was',
                'Missing description of solutions',
              ],
          improvedAnswer: isZh
            ? '项目最大的挑战是实时语音识别延迟过高，影响用户体验。我们通过优化模型推理流程、引入流式处理，将延迟从800ms降低到200ms。'
            : 'The biggest challenge was high latency in real-time speech recognition, affecting user experience. We optimized the model inference pipeline and introduced streaming processing, reducing latency from 800ms to 200ms.',
        },
        {
          question: isZh ? '你如何衡量产品成功的指标？' : 'How do you measure product success metrics?',
          type: 'project',
          currentAnswer: isZh ? '我们主要看用户量和留存率。' : 'We mainly look at user volume and retention.',
          issues: isZh
            ? [
                '指标过于笼统，没有具体数值',
                '没有说明为什么选择这些指标',
                '缺少北极星指标和辅助指标的概念',
              ]
            : [
                'Metrics are too generic, missing specific values',
                'Did not explain why these metrics were chosen',
                'Missing concepts of north star metric and supporting metrics',
              ],
          improvedAnswer: isZh
            ? '我们建立了三层指标体系：北极星指标是「周活跃用户数」，核心指标包括「次日留存率」和「7日留存率」，辅助指标关注「功能使用深度」和「用户满意度」。'
            : "We established a three-tier metric system: the north star metric is 'Weekly Active Users', core metrics include 'Day-2 Retention' and 'Day-7 Retention', and supporting metrics focus on 'Feature Usage Depth' and 'User Satisfaction'.",
        },
      ],
    };
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError(isZh ? '请先粘贴面试文字稿' : 'Please paste the interview transcript first');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    // 模拟 API 延迟
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysisResult = analyzeTranscript(transcript);
    setResult(analysisResult);
    setIsAnalyzing(false);
  };

  const handleLoadSample = () => {
    setTranscript(sampleTranscript);
    setError(null);
  };

  const typeColors = {
    technical: 'purple',
    behavioral: 'cyan',
    project: 'orange',
  } as const;

  const typeLabels = {
    technical: isZh ? '技术问题' : 'Technical',
    behavioral: isZh ? '行为问题' : 'Behavioral',
    project: isZh ? '项目问题' : 'Project',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-6" hover={false}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-cyan to-primary-purple flex items-center justify-center">
            <Mic size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isZh ? '面试复盘助手' : 'Interview Review Assistant'}
            </h3>
            <p className="text-sm text-gray-400">
              {isZh
                ? '上传面试录音转文字稿，AI 帮你分析问题与优化回答'
                : 'Upload interview transcript, AI analyzes questions and improves answers'}
            </p>
          </div>
        </div>

        {/* Transcript Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {isZh ? '粘贴面试文字稿' : 'Paste Interview Transcript'}
          </label>
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setError(null);
            }}
            placeholder={isZh ? '在此粘贴面试录音转文字稿...' : 'Paste your interview transcript here...'}
            className="w-full h-48 bg-dark-cardLight border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple/50 transition-colors resize-none"
          />
          {error && (
            <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <FileText size={16} />
            <span>{isZh ? '加载示例' : 'Load Sample'}</span>
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!transcript.trim() || isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-purple to-primary-violet text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-purple/30 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{isZh ? '分析中...' : 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <span>{isZh ? '开始分析' : 'Start Analysis'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb size={20} className="text-primary-orange" />
            {isZh ? '分析结果' : 'Analysis Results'}
          </h4>

          {result.questions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6" hover={false}>
                {/* Question */}
                <div className="flex items-start gap-3 mb-4">
                  <Badge color={typeColors[item.type]}>
                    {typeLabels[item.type]}
                  </Badge>
                  <p className="text-white font-medium">{item.question}</p>
                </div>

                {/* Current Answer & Issues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <AlertCircle size={16} />
                      <span className="font-medium">{isZh ? '你的回答' : 'Your Answer'}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{item.currentAnswer}</p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertCircle size={16} />
                      <span className="font-medium">{isZh ? '存在问题' : 'Issues'}</span>
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {item.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improved Answer */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <CheckCircle size={16} />
                    <span className="font-medium">{isZh ? '优化后的回答' : 'Improved Answer'}</span>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {item.improvedAnswer}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}

          <Card className="p-6 bg-gradient-to-r from-primary-purple/10 to-primary-cyan/10" hover={false}>
            <h5 className="font-bold text-white mb-3">
              💡 {isZh ? '复盘建议' : 'Review Tips'}
            </h5>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• {isZh ? '使用 STAR 法则组织你的回答（情境、任务、行动、结果）' : 'Use the STAR method to structure your answers (Situation, Task, Action, Result)'}</li>
              <li>• {isZh ? '每个回答尽量包含具体的数字和成果' : 'Include specific numbers and achievements in each answer whenever possible'}</li>
              <li>• {isZh ? '准备 2-3 个经典问题的故事库' : 'Prepare a story bank of 2-3 classic questions'}</li>
            </ul>
          </Card>
        </div>
      )}
    </motion.div>
  );
};
