import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Calendar, User, ChevronRight, X, Image } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Lightbox } from '../ui/Lightbox';
import { Carousel } from '../ui/Carousel';
import { projectsData, Project } from '../../data/projects';

export const Projects: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <section id="projects" className="py-20 md:py-32 bg-dark-card/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t('projects.title')}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t('projects.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <Card className="h-full overflow-hidden group">
                <div className="relative h-48 bg-gradient-to-br from-primary-purple/20 to-primary-orange/20 overflow-hidden">
                  {project.images && project.images.length > 0 ? (
                    <img
                      src={project.images[0]}
                      alt={isZh ? project.nameZh : project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FolderGit2 size={64} className="text-primary-purple/50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {project.metrics && (
                      <Badge color="purple">
                        {isZh ? project.metricsZh : project.metrics}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                    <span className="text-white font-medium flex items-center gap-2">
                      {t('projects.viewDetails')}
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Calendar size={14} />
                    <span>{project.period}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {isZh ? project.nameZh : project.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4">
                    <User size={14} className="text-primary-purple" />
                    <span className="text-primary-purple text-sm">
                      {isZh ? project.roleZh : project.role}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {isZh ? project.descriptionZh : project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {(isZh ? project.techZh : project.tech).slice(0, 3).map((tech, i) => (
                      <Badge key={i} color={['purple', 'cyan', 'orange'][i % 3] as any}>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Lightbox
          images={selectedProject?.images || []}
          initialIndex={lightboxIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={isZh ? selectedProject?.nameZh : selectedProject?.name}
        />

        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedProject(null)}
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
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-primary-purple to-primary-orange flex items-center justify-center">
                      <FolderGit2 size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {isZh ? selectedProject.nameZh : selectedProject.name}
                      </h3>
                      <p className="text-primary-purple">
                        {selectedProject.company} · {isZh ? selectedProject.roleZh : selectedProject.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{selectedProject.period}</span>
                    </div>
                    {selectedProject.metrics && (
                      <Badge color="purple" size="md">
                        {isZh ? selectedProject.metricsZh : selectedProject.metrics}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-lg mb-6">
                  {isZh ? selectedProject.descriptionZh : selectedProject.description}
                </p>

                {selectedProject.images && selectedProject.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Image size={18} />
                      {isZh ? '项目图片' : 'Project Images'}
                    </h4>
                    <Carousel
                      images={selectedProject.images}
                      autoPlay={false}
                      onImageClick={(index) => {
                        setLightboxIndex(index);
                        setIsLightboxOpen(true);
                      }}
                    />
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    {t('projects.tech')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(isZh ? selectedProject.techZh : selectedProject.tech).map((tech, i) => (
                      <Badge key={i} color={['purple', 'cyan', 'orange'][i % 3] as any} size="md">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {t('projects.highlights')}
                  </h4>
                  <div className="space-y-3">
                    {(isZh ? selectedProject.highlightsZh : selectedProject.highlights).map((highlight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-white/5"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-purple to-primary-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ChevronRight size={14} className="text-white" />
                        </div>
                        <p className="text-gray-300">{highlight}</p>
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
