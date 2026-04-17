import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GraduationCap, Award } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { educationData } from '../../data/education';

export const Education: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  return (
    <section id="education" className="py-20 md:py-32 bg-dark-card/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t('education.title')}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t('education.subtitle')}</p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-purple via-primary-violet to-primary-orange transform md:-translate-x-1/2" />
          
          <div className="space-y-12">
            {educationData.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  {index % 2 === 0 ? (
                    <Card className="p-8 ml-16 md:ml-0" hover>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet flex items-center justify-center">
                            <GraduationCap size={24} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {isZh ? edu.schoolZh : edu.school}
                            </h3>
                            <p className="text-primary-purple">
                              {isZh ? edu.degreeZh : edu.degree}
                            </p>
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-full bg-white/10 text-sm text-gray-300">
                          {edu.period}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-4">
                        {isZh ? edu.majorZh : edu.major}
                      </p>
                      
                      {edu.gpa && (
                        <div className="mb-4">
                          <Badge color="cyan">
                            {t('education.gpa')}: {edu.gpa}
                          </Badge>
                        </div>
                      )}
                      
                      {edu.honors && edu.honors.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award size={16} className="text-primary-orange" />
                            <span className="text-sm text-gray-400">{t('education.honors')}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(isZh ? edu.honorsZh : edu.honors)?.map((honor, i) => (
                              <Badge key={i} color="orange">{honor}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : null}
                </div>

                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-primary-purple to-primary-violet shadow-lg shadow-primary-purple/50 z-10">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>

                <div className="flex-1">
                  {index % 2 !== 0 ? (
                    <Card className="p-8 ml-16 md:ml-0" hover>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet flex items-center justify-center">
                            <GraduationCap size={24} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {isZh ? edu.schoolZh : edu.school}
                            </h3>
                            <p className="text-primary-purple">
                              {isZh ? edu.degreeZh : edu.degree}
                            </p>
                          </div>
                        </div>
                        <span className="px-4 py-2 rounded-full bg-white/10 text-sm text-gray-300">
                          {edu.period}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-4">
                        {isZh ? edu.majorZh : edu.major}
                      </p>
                      
                      {edu.gpa && (
                        <div className="mb-4">
                          <Badge color="cyan">
                            {t('education.gpa')}: {edu.gpa}
                          </Badge>
                        </div>
                      )}
                      
                      {edu.honors && edu.honors.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award size={16} className="text-primary-orange" />
                            <span className="text-sm text-gray-400">{t('education.honors')}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(isZh ? edu.honorsZh : edu.honors)?.map((honor, i) => (
                              <Badge key={i} color="orange">{honor}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
