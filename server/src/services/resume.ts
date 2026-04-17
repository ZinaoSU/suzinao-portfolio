import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Resume context data - 基于苏梓铙的真实简历
const RESUME_CONTEXT = `
关于苏梓铙的基本信息：
- 姓名：苏梓铙 (Su Zinao)
- 职位：产品经理 / AI产品 (Product Manager / AI Product)
- 位置：香港 (Hong Kong)
- MBTI：ENTJ（指挥官型）
- 爱好：Hiking, Swimming, Cooking
- 联系方式：suzinao.apply@gmail.com
- 电话：18948666031
- WhatsApp：+852 84956448

个人简介：
热爱AI与产品交叉领域，致力于将AI技术转化为用户喜爱的产品解决方案。

项目经验：

1. 字节跳动-Prompt优化平台 (ByteDance Prompt Optimization Platform)
   - 公司：字节跳动 (ByteDance)
   - 职位：产品经理 (Product Manager)
   - 时间：2024.08 - 2025.02
   - 描述：设计并上线企业级LLM内部Prompt优化平台，提升模板创作效率
   - 技术栈：LLM, Prompt Engineering, Template System
   - 成就：
     • 模板创作量提升284%
     • Prompt调试时间减少60%
     • 服务500+内部用户

2. WakeUpTime多模态相册检索APP (WakeUpTime Multimodal Album Search)
   - 公司：学术项目 (Academic Project)
   - 职位：项目负责人 (Project Lead)
   - 时间：2023.09 - 2024.07
   - 描述：研发基于CLIP+Spark的多模态图像检索APP，实现自然语言图像搜索功能
   - 技术栈：CLIP, Apache Spark, React Native, NLP
   - 成就：
     • 检索准确率提升25%
     • 实时处理10万+图片
     • 获校级创新奖

3. 腾讯AI助手API开发 (Tencent AI Assistant API Development)
   - 公司：腾讯 (Tencent)
   - 职位：项目负责人 (Project Lead)
   - 时间：2023.07 - 2023.09
   - 描述：基于QLoRA微调LLaMA2开发企业AI助手API，获腾讯A级评价
   - 技术栈：QLoRA, LLaMA2, FastAPI, Docker
   - 成就：
     • 获腾讯A级评价
     • 量化压缩模型70%
     • API响应时间<500ms

技术栈：
- LLM / AI: LLM, Prompt Engineering, QLoRA, LLaMA2, CLIP, NLP
- 框架: FastAPI, Docker, React Native, Template System
- 大数据: Apache Spark
- 产品能力: 产品设计、AI产品、数据分析、用户研究、项目管理、跨团队协作

个人特点：
- 热爱AI与产品交叉领域
- 致力于将AI技术转化为用户喜爱的产品解决方案
- 具备完整的产品设计能力
- 能够通过数据驱动产品决策
- 擅长用户调研和需求分析
`;

export async function chatWithResume(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
    return getDemoResponse(message);
  }

  const systemPrompt = `你是一个智能助手，可以回答关于苏梓铙的问题。以下是关于他的基本信息：

${RESUME_CONTEXT}

请根据以上信息回答用户的问题。如果用户问的问题超出这些信息范围，请诚实地说你不了解，但可以给出一般性的建议。

回答要求：
1. 简洁、专业
2. 如果是关于技术技能的问题，给出具体评价
3. 如果是联系方式相关，直接提供
4. 如果是建议性问题，给出有价值的建议`;

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content
      })),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.8
    });

    return response.choices[0].message.content || '抱歉，我无法回答这个问题。';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getDemoResponse(message);
  }
}

function getDemoResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('技术') || lowerMessage.includes('技能') || lowerMessage.includes('会什么')) {
    return '根据简历信息，苏梓铙的主要技能包括：\n\n• **产品设计** - 具备完整的产品设计能力\n• **AI产品** - 专注于AI与产品的结合\n• **数据分析** - 能够通过数据驱动产品决策\n• **用户研究** - 擅长用户调研和需求分析\n• **项目管理** - 有丰富的项目管理经验\n• **跨团队协作** - 善于与不同团队配合\n\n如果你想了解更多具体技能，可以问他更详细的问题！';
  }

  if (lowerMessage.includes('项目') || lowerMessage.includes('作品')) {
    return '根据简历信息，苏梓铙有丰富的项目经验，涵盖产品设计和AI应用领域。\n\n如果你想了解具体项目，可以问他：\n• "能介绍一个最成功的项目吗？"\n• "有没有AI相关的项目经验？"\n• "项目遇到过哪些挑战？"\n\n（目前为演示模式，详细信息待补充）';
  }

  if (lowerMessage.includes('联系') || lowerMessage.includes('邮箱') || lowerMessage.includes('email')) {
    return '苏梓铙的联系方式：\n\n• 📧 邮箱：suzinao.apply@gmail.com\n• 📱 电话：18948666031\n• 💼 WhatsApp：+852 84956448\n\n建议在工作时间联系，回复会更快哦！';
  }

  if (lowerMessage.includes('经验') || lowerMessage.includes('工作')) {
    return '根据简历信息，苏梓铙有产品经理相关的工作经验。\n\n工作风格特点：\n• MBTI: ENTJ（指挥官型）\n• 善于制定策略和执行\n• 跨团队协作能力强\n\n如果你想了解具体的工作经历，可以问他：\n• "能介绍一下最近的工作吗？"\n• "工作中最大的成就是什么？"\n• "遇到过最大的挑战是什么？"\n\n（目前为演示模式，详细信息待补充）';
  }

  if (lowerMessage.includes('教育') || lowerMessage.includes('学历') || lowerMessage.includes('学校')) {
    return '根据简历信息，苏梓铙有良好的教育背景。\n\n（教育信息待补充，请访问他的简历获取完整信息）';
  }

  return '你好！我是苏梓铙的智能助手，可以回答关于他的问题。\n\n你可以问我：\n• "他会什么技术？"\n• "有什么项目经验？"\n• "怎么联系他？"\n• "有什么工作经历？"\n\n我会尽力为你解答！（目前为演示模式）';
}
