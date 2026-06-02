import { assetUrl } from '../utils/assets';

export interface Project {
  id: string;
  name: string;
  nameZh: string;
  company: string;
  role: string;
  roleZh: string;
  period: string;
  description: string;
  descriptionZh: string;
  tech: string[];
  techZh: string[];
  highlights: string[];
  highlightsZh: string[];
  metrics?: string;
  metricsZh?: string;
  images?: string[];
}

export const projectsData: Project[] = [
  {
    id: 'wakeuptime',
    name: 'WakeUpTime Multimodal Album Search',
    nameZh: '创新创业项目 多模态相册检索APP「WakeUpTime」',
    company: 'Academic Project',
    role: 'Project Lead',
    roleZh: '项目负责人',
    period: '2023.09 - 2024.07',
    description: 'Built a multimodal image retrieval app using CLIP and Spark, with text/image/voice search, achieving 25% accuracy improvement.',
    descriptionZh: '基于CLIP+Spark构建多模态相册检索APP，支持文本/图像/语音搜索，准确率提升25%。',
    tech: ['CLIP', 'Apache Spark', 'React Native', 'NLP', 'Git'],
    techZh: ['CLIP', 'Apache Spark', 'React Native', 'NLP', 'Git'],
    highlights: [
      'Conducted qualitative interviews and surveys to identify core value of text/image/voice search',
      'Designed CLIP-based retrieval algorithm with Spark, improving search accuracy by 25%',
      'Used Git for agile collaboration, driving features from prototype to production',
      'Precisely positioned product differentiation through user validation',
    ],
    highlightsZh: [
      '通过定性访谈与问卷调查，结合用户行为分析，明确文本/图像/语音搜索核心价值',
      '基于CLIP+Spark设计核心相册检索算法，搜索准确率提升25%',
      '运用Git进行敏捷协作与全流程管理，推动功能从原型开发至落地应用',
      '完成竞品对标与用户需求验证，精准定位产品差异化优势',
    ],
    metrics: '+25% Accuracy',
    metricsZh: '+25%准确率',
    images: [
      assetUrl('/images/image21.webp'),
      assetUrl('/images/image21.webp'),
      assetUrl('/images/image21.webp'),
      assetUrl('/images/image21.webp'),
    ],
  },
  {
    id: 'tencent-ai',
    name: 'Performance AI Assistant API (Tencent MINI)',
    nameZh: '性能领域AI助手API开发（腾讯MINI项目）',
    company: 'Tencent',
    role: 'Project Lead',
    roleZh: '项目负责人',
    period: '2023.07 - 2023.09',
    description: 'Built efficient QLoRA+LLaMA2 training framework with LangChain+GPT integration, designed Streamlit visualization platform, achieved A-level evaluation.',
    descriptionZh: '开发QLoRA+LLaMA2高效训练框架，结合LangChain与GPT交互，搭建Streamlit可视化测试平台，技术方案获腾讯A级评价。',
    tech: ['QLoRA', 'LLaMA2', 'LangChain', 'Streamlit', 'FastAPI'],
    techZh: ['QLoRA', 'LLaMA2', 'LangChain', 'Streamlit', 'FastAPI'],
    highlights: [
      'Developed QLoRA+LLaMA2 training framework with LangChain+GPT for automated data processing',
      'Designed Streamlit visualization platform integrating AI Assistant API for full-pipeline visualization',
      'Technical solution rated A-level by Tencent Performance Engineering, deployed in core business',
      'Enhanced model training efficiency and performance analysis capabilities',
    ],
    highlightsZh: [
      '开发QLoRA+LLaMA2+LangChain高效模型训练框架，结合GPT优化数据自动化处理流程',
      '设计Streamlit可视化测试平台，集成AI助手API实现训练、推理、测试全流程可视化',
      '技术方案在腾讯专项性能工程中心获A级评价，应用于核心业务场景',
      '显著提升数据处理效率与系统性能分析能力',
    ],
    metrics: 'A-Level',
    metricsZh: 'A级评价',
    images: [
      assetUrl('/images/image32.webp'),
      assetUrl('/images/image33.webp'),
      assetUrl('/images/image34.jpg'),
      assetUrl('/images/image35.webp'),
    ],
  },
];
