import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Download, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { profile } from '../../data/profile';

export const Contact: React.FC = () => {
  const { t } = useTranslation();

  const contactMethods = [
    {
      icon: Mail,
      label: t('contact.email'),
      value: profile.email,
      href: `mailto:${profile.email}`,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Phone,
      label: t('contact.phone'),
      value: profile.phone,
      href: `tel:${profile.phone}`,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: MessageCircle,
      label: t('contact.whatsapp'),
      value: profile.whatsapp,
      href: `https://wa.me/${profile.whatsapp.replace('+', '')}`,
      color: 'from-emerald-500 to-green-500',
    },
  ];

  return (
    <section id="contact" className="py-20 md:py-32 bg-dark-card/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t('contact.title')}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <motion.a
                key={method.label}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="p-6 text-center h-full">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4`}>
                    <method.icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {method.label}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {method.value}
                  </p>
                </Card>
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 text-center" hover={false}>
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-primary-purple to-primary-orange flex items-center justify-center mb-6">
                <Send size={36} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('contact.connect')}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  gradient
                  size="lg"
                  onClick={() => window.open(`mailto:${profile.email}`, '_blank')}
                >
                  <Mail size={20} className="mr-2" />
                  {t('contact.email')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                >
                  <Download size={20} className="mr-2" />
                  {t('contact.downloadCV')}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
