export interface Profile {
  name: string;
  nameZh: string;
  title: string;
  titleZh: string;
  location: string;
  phone: string;
  email: string;
  whatsapp: string;
  mbti: string;
  hobbies: string[];
  summary: string;
  summaryZh: string;
}

export const profile: Profile = {
  name: 'Su Zinao',
  nameZh: '苏梓铙',
  title: 'Product Manager / AI Product',
  titleZh: '产品经理 / AI产品',
  location: 'Hong Kong',
  phone: '18948666031',
  email: 'suzinao.apply@gmail.com',
  whatsapp: '+852 84956448',
  mbti: 'ENTJ',
  hobbies: ['Hiking', 'Swimming', 'Cooking'],
  summary: 'Passionate about the intersection of AI and product, dedicated to transforming cutting-edge AI technology into user-loved product solutions.',
  summaryZh: '热爱AI与产品交叉领域，致力于将AI技术转化为用户喜爱的产品解决方案。',
};
