export interface Education {
  id: string;
  school: string;
  schoolZh: string;
  degree: string;
  degreeZh: string;
  major: string;
  majorZh: string;
  period: string;
  gpa?: string;
  honors?: string[];
  honorsZh?: string[];
  description?: string;
  descriptionZh?: string;
}

export const educationData: Education[] = [
  {
    id: 'hkbust',
    school: 'Hong Kong Baptist University',
    schoolZh: '香港浸会大学',
    degree: 'Master of Science',
    degreeZh: '理学硕士',
    major: 'Data Analytics and Artificial Intelligence',
    majorZh: '数据分析与人工智能',
    period: '2025.09 - 2026.06',
    description: 'Focusing on advanced data analytics and AI technologies.',
    descriptionZh: '专注于前沿数据分析与人工智能技术。',
  },
  {
    id: 'szu',
    school: 'Shenzhen Technology University',
    schoolZh: '深圳技术大学',
    degree: 'Bachelor of Engineering',
    degreeZh: '工学学士',
    major: 'Computer Science and Technology',
    majorZh: '计算机科学与技术',
    period: '2021.09 - 2025.06',
    gpa: '3.65/4.5 (Top 15%)',
    honors: ["President's Scholarship", 'SCI Paper Publication'],
    honorsZh: ['校长奖学金', 'SCI论文发表'],
    description: 'Strong academic performance with research achievements.',
    descriptionZh: '学业成绩优异，科研成果突出。',
  },
];
