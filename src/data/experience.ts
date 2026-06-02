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
      assetUrl('/images/image3.webp'),
      assetUrl('/images/image2.webp'),
      assetUrl('/images/image1.webp'),
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
      assetUrl('/images/image13.webp'),
      assetUrl('/images/image16.webp'),
      assetUrl('/images/image17.webp'),
    ],
  },
  {
    id: 'nolibox',
    company: 'Nolibox',
    companyZh: '北京计算美学科技',
    role: 'Product Manager',
    roleZh: '产品经理',
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
      assetUrl('/images/image30.webp'),
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
      assetUrl('/images/image20.webp'),
      assetUrl('/images/image24.webp'),
      assetUrl('/images/image23.webp'),
      assetUrl('/images/image25.webp'),
    ],
  },
];
