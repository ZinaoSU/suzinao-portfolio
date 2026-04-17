import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Compass, Dumbbell } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { profile } from '../../data/profile';

export const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const hobbies = [
    { name: 'Hiking', icon: Compass, zh: '徒步', color: 'cyan' },
    { name: 'Swimming', icon: Dumbbell, zh: '游泳', color: 'purple' },
    { name: 'Cooking', icon: Heart, zh: '烹饪', color: 'orange' },
  ];

  return (
    <section id="about" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t('about.title')}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t('about.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Card - Profile with Photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 h-full" hover={false}>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary-purple/50 flex-shrink-0">
                  <img
                    src="/images/image5.jpeg"
                    alt={isZh ? profile.nameZh : profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isZh ? profile.nameZh : profile.name}
                  </h3>
                  <p className="text-primary-purple">
                    {isZh ? profile.titleZh : profile.title}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">{profile.location}</p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">
                {isZh ? profile.summaryZh : profile.summary}
              </p>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  {t('about.mbtiTitle')}
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold gradient-text">{profile.mbti}</span>
                  <div className="text-sm text-gray-400">
                    <p>Commander</p>
                    <p>Strategic Leader</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Card - Hobbies & Tags */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 h-full" hover={false}>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                {t('about.hobbiesTitle')}
              </h4>

              <div className="grid grid-cols-3 gap-4">
                {hobbies.map((hobby, index) => (
                  <motion.div
                    key={hobby.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary-purple/50 transition-all duration-300 cursor-pointer"
                  >
                    <hobby.icon size={32} className="text-primary-purple mb-3" />
                    <span className="text-white font-medium">
                      {isZh ? hobby.zh : hobby.name}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  {isZh ? '个人标签' : 'Personal Tags'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge color="purple">AI Enthusiast</Badge>
                  <Badge color="cyan">Problem Solver</Badge>
                  <Badge color="orange">Fast Learner</Badge>
                  <Badge color="green">Team Player</Badge>
                  <Badge color="pink">Creative</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
