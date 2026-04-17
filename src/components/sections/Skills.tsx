import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Zap, Code, Brain, Globe } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { skillsData } from '../../data/skills';

export const Skills: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const icons = {
    product: Zap,
    programming: Code,
    ai: Brain,
    languages: Globe,
  };

  return (
    <section id="skills" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t('skills.title')}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t('skills.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillsData.map((category, catIndex) => {
            const Icon = icons[category.id as keyof typeof icons];
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.15 }}
              >
                <Card className="p-8 h-full" hover={false}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {isZh ? category.nameZh : category.name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {category.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: catIndex * 0.15 + skillIndex * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">{isZh ? skill.nameZh : skill.name}</span>
                          <span className="text-sm text-gray-500">{skill.level}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: catIndex * 0.15 + skillIndex * 0.05 + 0.2, duration: 0.8, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${category.color} rounded-full relative`}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex flex-wrap gap-2">
                      {category.skills.slice(0, 4).map((skill, i) => (
                        <Badge
                          key={skill.name}
                          color={['purple', 'cyan', 'orange', 'green'][i % 4] as any}
                        >
                          {isZh ? skill.nameZh.split(' ')[0] : skill.name.split(' ')[0]}
                        </Badge>
                      ))}
                      {category.skills.length > 4 && (
                        <Badge color="pink">+{category.skills.length - 4}</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
