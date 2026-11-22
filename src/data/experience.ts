import { assetUrl } from '../utils/assets';

export interface Experience {
  id: string;
  company: string;
  companyZh: string;
  role: string;
  roleZh: string;
  period: string;
  location: string;
  achievements: string[];
  achievementsZh: string[];
  highlight?: string;
  highlightZh?: string;
  images?: string[];
}

export const experienceData: Experience[] = [
  {
    id: 'hikvision',
    company: 'Hikvision (Hong Kong)',
    companyZh: '海康威视（香港）',
    role: 'Solutions Engineer',
    roleZh: '解决方案工程师',
    period: '2026.06 - 2026.10',
    location: 'Hong Kong',
    achievements: [
      'Led requirement analysis, solution design and rollout of the WhatsApp AI customer service product for HK/Macau B2B clients, enabling 7×24 AI self-service',
      'Built localized RAG knowledge base from manuals, FAQs and wiring diagrams, achieving 40% self-service deflection and 85%+ AI answer accuracy',
      'Established metrics monitoring (deflection, first response, KB hit rate) and iterated via prompt tuning and retrieval optimization, cutting handling time by 20%',
      'Delivered 30+ ProAV solutions across LED displays, interactive panels and professional audio; led CIC tender bid with full configuration of 18 product categories',
    ],
    achievementsZh: [
      '参与海康威视香港AI产品部智能客服项目建设，负责WhatsApp智能客服产品的需求梳理、方案设计与落地推进，实现港澳B端客户7×24小时AI自助服务',
      '负责港澳本地化RAG知识库建设，对操作手册、FAQ、接线图等技术资料结构化清洗、切片、分类打标，常规技术咨询独立闭环拦截率达40%，AI回答准确率提升至85%+',
      '建立问题拦截率、首次响应时间、知识命中率、转人工率核心指标监控，通过Prompt优化、检索权重调整、召回阈值优化持续迭代AI效果，平均问题处理时长缩短20%',
      '参与ProAV业务售前支持，覆盖LED商用显示屏、交互平板、专业音频三条产品线，独立输出30+份行业解决方案',
      '主导CIC户外训练场地AV系统投标项目，独立研读英文招标文件，完成18类产品型号配单与技术参数核对',
    ],
    highlight: '40% Deflection · 85%+ Accuracy',
    highlightZh: '40%问题拦截 · 85%+准确率',
    images: [
      assetUrl('/images/hikvision-1.jpg'),
      assetUrl('/images/hikvision-2.jpg'),
    ],
  },
  {
    id: 'cims',
    company: 'Centre for Intelligent Manufacturing Systems',
    companyZh: '香港智能制造中心',
    role: 'Product Manager Intern',
    roleZh: '产品经理实习生',
    period: '2025.12 - 2026.03',
    location: 'Hong Kong',
    achievements: [
      'Defined AI+climbing product from 0 to 1, leading AI capability design for motion training scenarios',
      'Designed "AI hardware + mobile APP" architecture with motion capture, pose comparison, and AI analysis modules',
      'Built user beta community and feedback mechanism, driving algorithm iteration and improving recognition accuracy',
      'Completed AI+climbing product system definition, established first seed users and scenario validation',
    ],
    achievementsZh: [
      '主导AI+攀岩场景产品从0到1定义，统筹AI功能设计与真实训练场景适配验证',
      '设计"AI智能硬件+移动端APP"一体架构，定义动作捕捉识别、姿态标准对比、AI分析纠错核心模块',
      '搭建用户内测社群与训练反馈机制，推动算法模型迭代优化，提升识别准确率与反馈实时性',
      '完成AI+攀岩产品体系定义与核心功能原型设计，建立首批种子用户与场景验证基础',
    ],
    highlight: 'AI + Climbing',
    highlightZh: 'AI + 攀岩',
    images: [
      assetUrl('/images/image3.webp'),
      assetUrl('/images/image2.webp'),
      assetUrl('/images/image1.webp'),
    ],
  },
  {
    id: 'fada',
    company: 'FADA',
    companyZh: '法大大',
    role: 'Product Manager Intern',
    roleZh: '产品经理实习生',
    period: '2025.06 - 2025.09',
    location: 'Shenzhen',
    achievements: [
      'Built RAG-based compliance knowledge base covering 40+ countries and 30+ regions',
      'Upgraded customer service system with AI chatbot, achieving 80% automation rate',
      'Reduced average response time from 24h to 2h, improving user experience',
      'Analyzed 3 leading competitors (Adobe Sign, DocuSign) across 12 core modules',
    ],
    achievementsZh: [
      '协同法务梳理40+国家电子签名法律规则及30+地区数据安全合规标准，基于RAG架构搭建企业级问答知识库',
      '推动接入Udesk客服系统，设计智能客服机器人与工单分发机制，自动化响应比例提升至80%',
      '客服平均响应时效由24小时缩短至2小时，提升用户体验与处理效率',
      '拆解Adobe Sign、DocuSign等3个主流产品12个核心功能模块，建立多维功能对比矩阵',
    ],
    highlight: '80% Auto Response',
    highlightZh: '80%自动化响应',
    images: [
      assetUrl('/images/image13.webp'),
      assetUrl('/images/image16.webp'),
      assetUrl('/images/image17.webp'),
    ],
  },
  {
    id: 'nolibox',
    company: 'Nolibox',
    companyZh: '北京计算美学科技',
    role: 'Product Manager Intern',
    roleZh: '产品经理实习生',
    period: '2024.05 - 2024.11',
    location: 'Beijing',
    achievements: [
      'Led Nolibox AI text-to-image enterprise product for KA clients and SMBs',
      'Researched 10+ AIGC competitors, built user segmentation and 200+ scenario tag system',
      'Drove 120% MAU growth and 90% core feature penetration in 5 months',
      '85% KA retention, 20% SMB conversion rate increase, 5 new strategic accounts',
    ],
    achievementsZh: [
      '负责Nolibox画宇宙企业版AI文生图产品全流程，聚焦KA大客户与中小商户',
      '调研10+AIGC竞品，搭建用户分层体系与200+商用场景标签体系',
      '5个月推动月活提升120%，核心功能渗透率达90%',
      'KA客户深度留存率85%，中小商户付费转化率提升20%，新增5家战略合作客户',
    ],
    highlight: '120% MAU Growth',
    highlightZh: '月活提升120%',
    images: [
      assetUrl('/images/image27.webp'),
      assetUrl('/images/image28.webp'),
      assetUrl('/images/image29.webp'),
    ],
  },
  {
    id: 'dji',
    company: 'DJI Innovations',
    companyZh: '大疆创新',
    role: 'Product Operations Intern',
    roleZh: '产品运营实习生',
    period: '2022.07 - 2022.08',
    location: 'Shenzhen',
    achievements: [
      'Analyzed summer camp industry data, benchmarked 3 competitors and boosted enrollment rate by 20%',
      'Designed Python + YOLO curriculum with theory-training-deployment teaching loop, 98% satisfaction rate',
      'Established quality monitoring with 8 standardized workflows, coordinated 12 departments, zero complaints',
      'Built Feishu feedback system collecting 150+ evaluations weekly, delivered 2 iterations with 30% efficiency gain',
    ],
    achievementsZh: [
      '运用数据分析完成3家竞品课程拆解，识别12-15岁用户痛点，推动夏令营报名率提升20%',
      '设计基于Python和YOLO的实践课程，构建「理论讲解-模型训练-部署应用」教学闭环，实现98%课程满意度',
      '建立课程质量监控体系，制定8项标准化流程，协调12个部门资源，达成零投诉运营目标',
      '搭建飞书多维表格反馈系统，每周收集150+学员评价，完成2次课程迭代，学习效率提升30%',
    ],
    highlight: '98% Satisfaction',
    highlightZh: '98%满意度',
    images: [
      assetUrl('/images/image20.webp'),
      assetUrl('/images/image24.webp'),
      assetUrl('/images/image23.webp'),
      assetUrl('/images/image25.webp'),
    ],
  },
];
