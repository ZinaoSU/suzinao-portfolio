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
    id: 'cims',
    company: 'Centre for Intelligent Manufacturing Systems',
    companyZh: '香港智能制造中心',
    role: 'Product Manager',
    roleZh: '产品经理',
    period: '2025.12 - 2026.03',
    location: 'Hong Kong',
    achievements: [
      'Led AI + climbing sports hardware product development',
      'Conducted user research with 50+ climbers',
      'Defined product roadmap for smart fitness devices',
    ],
    achievementsZh: [
      '主导AI+攀岩运动硬件产品开发',
      '调研50+攀岩用户需求',
      '制定智能健身设备产品路线图',
    ],
    highlight: 'AI + Sports',
    highlightZh: 'AI + 运动',
    images: [
      '/images/image13.png',
      '/images/image16.png',
      '/images/image17.png',
      '/images/image27.png',
    ],
  },
  {
    id: 'fada',
    company: 'FADA',
    companyZh: '法大大',
    role: 'Product Manager',
    roleZh: '产品经理',
    period: '2025.06 - 2025.09',
    location: 'Shenzhen',
    achievements: [
      'Developed RAG compliance assistant product',
      'Achieved 1.3M order volume',
      'Optimized document processing workflow',
    ],
    achievementsZh: [
      '研发RAG合规助手产品',
      '达成130万订单量',
      '优化文档处理流程',
    ],
    highlight: '1.3M Orders',
    highlightZh: '130万订单',
    images: [
      '/images/image3.png',
      '/images/image6.png',
      '/images/image8.png',
      '/images/image9.png',
    ],
  },
  {
    id: 'dji',
    company: 'DJI Innovations',
    companyZh: '大疆创新',
    role: 'Product Operations',
    roleZh: '产品运营',
    period: '2022.07 - 2022.08',
    location: 'Shenzhen',
    achievements: [
      'Developed Python + YOLO computer vision course',
      'Trained 200+ internal employees',
      'Created educational content for AI applications',
    ],
    achievementsZh: [
      '研发Python+YOLO计算机视觉课程',
      '培训内部员工200+人次',
      '创建AI应用教学内容',
    ],
    highlight: '200+ Trained',
    highlightZh: '200+培训',
    images: [
      '/images/image10.png',
      '/images/image11.png',
      '/images/image29.png',
      '/images/image30.png',
    ],
  },
];
