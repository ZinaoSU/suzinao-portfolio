import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Calendar, MapPin, ChevronRight, X, Image } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Lightbox } from '../ui/Lightbox';
import { Carousel } from '../ui/Carousel';
import { experienceData, Experience } from '../../data/experience';

export const ExperienceSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <section id="experience" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t('experience.title')}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t('experience.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experienceData.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="cursor-pointer"
              onClick={() => setSelectedExp(exp)}
            >
              <Card className="h-full overflow-hidden group">
                {/* Image Area */}
                <div className="relative h-40 bg-gradient-to-br from-primary-purple/20 to-primary-orange/20 overflow-hidden">
                  {exp.images && exp.images.length > 0 ? (
                    <img
                      src={exp.images[0]}
                      alt={isZh ? exp.companyZh : exp.company}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 size={48} className="text-primary-purple/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                    <span className="text-white font-medium flex items-center gap-2">
                      {t('experience.viewDetails')}
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {isZh ? exp.companyZh : exp.company}
                      </h3>
                      <p className="text-primary-purple text-sm truncate">
                        {isZh ? exp.roleZh : exp.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{exp.period}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{exp.location}</span>
                    </div>
                  </div>

                  {exp.highlight && (
                    <Badge color="orange" className="mb-4">
                      {isZh ? exp.highlightZh : exp.highlight}
                    </Badge>
                  )}

                  <div className="space-y-2">
                    {(isZh ? exp.achievementsZh : exp.achievements).slice(0, 2).map((achievement, i) => (
                      <p key={i} className="text-gray-400 text-sm flex items-start gap-2">
                        <ChevronRight size={14} className="text-primary-purple mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{achievement}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <Lightbox
          images={selectedExp?.images || []}
          initialIndex={lightboxIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={isZh ? selectedExp?.companyZh : selectedExp?.company}
        />

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedExp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedExp(null)}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-dark-card border border-white/10 rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedExp(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet flex items-center justify-center">
                      <Building2 size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {isZh ? selectedExp.companyZh : selectedExp.company}
                      </h3>
                      <p className="text-primary-purple text-lg">
                        {isZh ? selectedExp.roleZh : selectedExp.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{selectedExp.period}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{selectedExp.location}</span>
                    </div>
                    {selectedExp.highlight && (
                      <Badge color="orange" size="md">
                        {isZh ? selectedExp.highlightZh : selectedExp.highlight}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Image Carousel */}
                {selectedExp.images && selectedExp.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Image size={18} />
                      {isZh ? '工作图片' : 'Work Images'}
                    </h4>
                    <Carousel
                      images={selectedExp.images}
                      autoPlay={false}
                      onImageClick={(index) => {
                        setLightboxIndex(index);
                        setIsLightboxOpen(true);
                      }}
                    />
                  </div>
                )}

                {/* Achievements */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {t('experience.achievements')}
                  </h4>
                  <div className="space-y-3">
                    {(isZh ? selectedExp.achievementsZh : selectedExp.achievements).map((achievement, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-purple to-primary-violet flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-white font-bold">{i + 1}</span>
                        </div>
                        <p className="text-gray-300">{achievement}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
