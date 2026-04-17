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
    id: 'bytedance-prompt',
    name: 'ByteDance Prompt Optimization Platform',
    nameZh: '字节跳动-Prompt优化平台',
    company: 'ByteDance',
    role: 'Product Manager',
    roleZh: '产品经理',
    period: '2024.08 - 2025.02',
    description: 'Designed and launched an internal prompt optimization platform for enterprise LLMs, improving template creation efficiency.',
    descriptionZh: '设计并上线企业级LLM内部Prompt优化平台，提升模板创作效率。',
    tech: ['LLM', 'Prompt Engineering', 'Template System'],
    techZh: ['LLM', 'Prompt工程', '模板系统'],
    highlights: [
      'Template creation increased by 284%',
      'Reduced prompt debugging time by 60%',
      'Served 500+ internal users',
    ],
    highlightsZh: [
      '模板创作量提升284%',
      'Prompt调试时间减少60%',
      '服务500+内部用户',
    ],
    metrics: '+284%',
    metricsZh: '+284%',
    images: [
      '/images/image1.png',
      '/images/image3.png',
      '/images/image6.png',
      '/images/image8.png',
    ],
  },
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
      '/images/image26.png',
      '/images/image32.png',
      '/images/image35.png',
      '/images/image36.png',
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
      '/images/image29.png',
      '/images/image30.png',
      '/images/image31.png',
      '/images/image37.png',
    ],
  },
];
