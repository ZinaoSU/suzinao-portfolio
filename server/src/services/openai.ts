import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface InterviewAnalysis {
  questions: Question[];
  weaknesses: Weakness[];
  improvements: Improvement[];
  overallScore: number;
  summary: string;
}

export interface Question {
  id: number;
  category: '技术' | '项目' | '行为' | '其他';
  question: string;
  answer: string;
  quality: '优秀' | '良好' | '一般' | '待提升';
  feedback: string;
}

export interface Weakness {
  area: string;
  description: string;
  severity: '高' | '中' | '低';
  suggestions: string[];
}

export interface Improvement {
  question: string;
  improvedAnswer: string;
  keyPoints: string[];
}

export async function analyzeInterview(content: string): Promise<InterviewAnalysis> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
    // Return demo data if no API key
    return getDemoAnalysis();
  }

  const prompt = `你是一个专业的面试教练。请分析以下面试内容：

面试内容：
${content}

请按照以下JSON格式返回分析结果（必须严格遵循JSON格式，不要包含其他内容）：
{
  "questions": [
    {
      "id": 1,
      "category": "技术/项目/行为/其他",
      "question": "面试官的问题",
      "answer": "候选人的回答",
      "quality": "优秀/良好/一般/待提升",
      "feedback": "对这个回答的评价"
    }
  ],
  "weaknesses": [
    {
      "area": "不足领域",
      "description": "具体描述",
      "severity": "高/中/低",
      "suggestions": ["改进建议1", "改进建议2"]
    }
  ],
  "improvements": [
    {
      "question": "面试问题",
      "improvedAnswer": "优化后的回答",
      "keyPoints": ["关键点1", "关键点2"]
    }
  ],
  "overallScore": 7,
  "summary": "总体评价"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的面试教练，擅长分析面试表现并提供改进建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as InterviewAnalysis;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Return demo data on error
    return getDemoAnalysis();
  }
}

function getDemoAnalysis(): InterviewAnalysis {
  return {
    questions: [
      {
        id: 1,
        category: '项目',
        question: '请介绍一下你最成功的项目',
        answer: '我在上一家公司负责了一个用户增长项目，通过优化分享机制使日活提升了30%',
        quality: '良好',
        feedback: '有数据支撑，但可以更具体地描述个人贡献和技术挑战'
      },
      {
        id: 2,
        category: '技术',
        question: '如何处理产品需求与技术实现的平衡',
        answer: '我会和开发团队充分沟通，了解技术限制，然后调整需求优先级',
        quality: '一般',
        feedback: '回答偏通用，缺乏具体案例和解决策略'
      }
    ],
    weaknesses: [
      {
        area: 'STAR法则运用',
        description: '回答缺乏清晰的情境(Situation)、任务(Task)、行动(Action)、结果(Result)结构',
        severity: '中',
        suggestions: [
          '使用STAR法则组织回答',
          '每个回答控制在2-3分钟',
          '多使用数据和具体成果支撑'
        ]
      },
      {
        area: '技术深度',
        description: '对技术实现细节描述不够具体',
        severity: '低',
        suggestions: [
          '准备1-2个深入讲解的技术案例',
          '了解相关技术的最新趋势'
        ]
      }
    ],
    improvements: [
      {
        question: '请介绍一下你最成功的项目',
        improvedAnswer: '我在XX公司负责的用户增长项目（Situation）：当时日活150万，增长遇到瓶颈。\n\n我的任务(Task)：需要在3个月内将日活提升至200万，同时控制获客成本。\n\n采取的行动(Action)：\n1. 通过A/B测试发现分享得积分的转化率最高\n2. 协调前端、后端、营销三个团队优化分享流程\n3. 引入实时数据看板，监控关键指标\n\n最终结果(Result)：\n• 日活从150万提升至205万（+37%）\n• 获客成本下降22%\n• 该方案被公司评为年度最佳项目',
        keyPoints: [
          '使用STAR结构',
          '量化成果数据',
          '突出协调能力',
          '展示数据驱动思维'
        ]
      }
    ],
    overallScore: 6,
    summary: '整体表现中规中矩，有一定的项目经验但回答技巧需要提升。建议多练习STAR法则的回答方式，并准备更多量化数据来支撑回答。'
  };
}
