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
    nameZh: 'WakeUpTime多模态相册检索APP',
    company: 'Academic Project',
    role: 'Project Lead',
    roleZh: '项目负责人',
    period: '2023.09 - 2024.07',
    description: 'Developed a multimodal image retrieval app using CLIP and Spark, enabling natural language image search.',
    descriptionZh: '研发基于CLIP+Spark的多模态图像检索APP，实现自然语言图像搜索功能。',
    tech: ['CLIP', 'Apache Spark', 'React Native', 'NLP'],
    techZh: ['CLIP', 'Apache Spark', 'React Native', 'NLP'],
    highlights: [
      'Search accuracy improved by 25%',
      'Processed 100K+ images in real-time',
      'Won school innovation award',
    ],
    highlightsZh: [
      '检索准确率提升25%',
      '实时处理10万+图片',
      '获校级创新奖',
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
    name: 'Tencent AI Assistant API Development',
    nameZh: '腾讯AI助手API开发',
    company: 'Tencent',
    role: 'Project Lead',
    roleZh: '项目负责人',
    period: '2023.07 - 2023.09',
    description: 'Developed enterprise AI assistant APIs using QLoRA fine-tuning on LLaMA2, achieving A-level evaluation from Tencent.',
    descriptionZh: '基于QLoRA微调LLaMA2开发企业AI助手API，获腾讯A级评价。',
    tech: ['QLoRA', 'LLaMA2', 'FastAPI', 'Docker'],
    techZh: ['QLoRA', 'LLaMA2', 'FastAPI', 'Docker'],
    highlights: [
      'Received Tencent A-level evaluation',
      'Reduced model size by 70% with quantization',
      'API response time under 500ms',
    ],
    highlightsZh: [
      '获腾讯A级评价',
      '量化压缩模型70%',
      'API响应时间<500ms',
    ],
    metrics: 'A-Level',
    metricsZh: 'A级评价',
    images: [
      assetUrl('/images/image32.webp'),
      assetUrl('/images/image33.webp'),
      assetUrl('/images/image34.webp'),
      assetUrl('/images/image35.webp'),
    ],
  },
];
