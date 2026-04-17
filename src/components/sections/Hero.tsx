import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronDown, Download, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { profile } from '../../data/profile';

export const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [typedText, setTypedText] = useState('');
  const fullText = i18n.language === 'zh' ? 'AI产品经理' : 'AI Product Manager';

  const isZh = i18n.language === 'zh';

  useEffect(() => {
    setTypedText('');
    const text = isZh ? 'AI产品经理' : 'AI Product Manager';
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [isZh]);

  const scrollToNext = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-purple-950/20 to-dark-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-purple/20 rounded-full blur-[128px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-orange/20 rounded-full blur-[128px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-violet/10 rounded-full blur-[128px]" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(10,10,15,0.8)_100%)]" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-4 bg-gradient-to-r from-primary-purple via-primary-violet to-primary-orange rounded-full opacity-30 blur-sm"
            />
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 glow-purple">
              <img
                src="/images/image5.jpeg"
                alt="Su Zinao"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-lg md:text-xl mb-4"
        >
          {t('hero.greeting')}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
        >
          <span className="text-white">{isZh ? profile.nameZh : profile.name}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="h-12 md:h-16 mb-6"
        >
          <div className="flex items-center justify-center gap-2 text-2xl md:text-4xl lg:text-5xl font-bold">
            <Sparkles className="text-primary-purple animate-pulse" size={28} />
            <span className="gradient-text">{typedText}</span>
            <span className="w-1 h-8 md:h-12 bg-primary-purple animate-blink rounded-full" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          {t('hero.description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="primary"
            gradient
            size="lg"
            onClick={scrollToNext}
          >
            {t('hero.cta')}
          </Button>
          <Button
            variant="outline"
            size="lg"
          >
            <Download size={20} className="mr-2" />
            {t('hero.downloadCV')}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.button
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={scrollToNext}
            className="p-3 rounded-full border border-white/20 text-gray-400 hover:text-primary-purple hover:border-primary-purple/50 transition-all duration-300"
          >
            <ChevronDown size={24} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
