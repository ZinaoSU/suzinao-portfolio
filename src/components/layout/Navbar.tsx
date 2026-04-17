import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { LanguageSwitch } from '../ui/LanguageSwitch';
import { useScrollSpy } from '../../hooks/useScrollSpy';

const sections = ['hero', 'about', 'education', 'experience', 'projects', 'ailab', 'skills', 'contact'];

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeId = useScrollSpy(sections);

  const isZh = i18n.language === 'zh';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'hero', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'education', label: t('nav.education') },
    { id: 'experience', label: t('nav.experience') },
    { id: 'projects', label: t('nav.projects') },
    { id: 'ailab', label: 'AI Lab' },
    { id: 'skills', label: t('nav.skills') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-dark-bg/90 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl md:text-2xl font-bold gradient-text cursor-pointer"
              onClick={() => scrollToSection('hero')}
            >
              {isZh ? '苏梓铙' : 'Su Zinao'}
            </motion.div>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors duration-300 relative ${
                    activeId === item.id
                      ? 'text-primary-purple'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeId === item.id && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-purple to-primary-orange rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitch />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-white hover:text-primary-purple transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-dark-card border-l border-white/10 p-6"
            >
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white hover:text-primary-purple transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-4 py-3 rounded-xl transition-colors duration-300 ${
                      activeId === item.id
                        ? 'bg-primary-purple/20 text-primary-purple'
                        : item.id === 'ailab'
                          ? 'bg-gradient-to-r from-primary-purple/10 to-primary-cyan/10 text-primary-purple hover:from-primary-purple/20 hover:to-primary-cyan/20'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
