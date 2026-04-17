export interface Skill {
  name: string;
  nameZh: string;
  level: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  nameZh: string;
  color: string;
  skills: Skill[];
}

export const skillsData: SkillCategory[] = [
  {
    id: 'product',
    name: 'Product Tools',
    nameZh: '产品工具',
    color: 'from-purple-500 to-pink-500',
    skills: [
      { name: 'Axure', nameZh: 'Axure', level: 90 },
      { name: 'Mockplus', nameZh: '墨刀', level: 95 },
      { name: 'Xmind', nameZh: 'Xmind', level: 95 },
      { name: 'Figma', nameZh: 'Figma', level: 85 },
      { name: 'Power BI', nameZh: 'Power BI', level: 80 },
      { name: 'SQL', nameZh: 'SQL', level: 75 },
    ],
  },
  {
    id: 'programming',
    name: 'Programming Languages',
    nameZh: '编程语言',
    color: 'from-cyan-500 to-blue-500',
    skills: [
      { name: 'Python', nameZh: 'Python', level: 90 },
      { name: 'C/C++', nameZh: 'C/C++', level: 75 },
      { name: 'Java', nameZh: 'Java', level: 70 },
    ],
  },
  {
    id: 'ai',
    name: 'AI/ML Skills',
    nameZh: 'AI/ML技能',
    color: 'from-orange-500 to-red-500',
    skills: [
      { name: 'NLP (BERT/LLM)', nameZh: 'NLP (BERT/LLM)', level: 85 },
      { name: 'CV (YOLO/CLIP)', nameZh: 'CV (YOLO/CLIP)', level: 80 },
      { name: 'RAG', nameZh: 'RAG', level: 90 },
      { name: 'Agents', nameZh: '智能体', level: 85 },
      { name: 'Prompt Engineering', nameZh: 'Prompt工程', level: 95 },
      { name: 'LoRA Fine-tuning', nameZh: 'LoRA微调', level: 80 },
    ],
  },
  {
    id: 'languages',
    name: 'Languages',
    nameZh: '语言能力',
    color: 'from-green-500 to-emerald-500',
    skills: [
      { name: 'English IELTS 6.5', nameZh: '英语 IELTS 6.5', level: 80 },
      { name: 'Cantonese', nameZh: '粤语（母语）', level: 100 },
      { name: 'Mandarin', nameZh: '普通话（流利）', level: 95 },
    ],
  },
];
