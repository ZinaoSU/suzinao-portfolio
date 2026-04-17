import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Mail } from 'lucide-react';
import { profile } from '../../data/profile';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-dark-card border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">
              {isZh ? '苏梓铙' : 'Su Zinao'}
            </h3>
            <p className="text-gray-400 text-sm">
              {t('profile.title')}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('contact.connect')}</h4>
            <div className="flex gap-4">
              <a
                href={`mailto:${profile.email}`}
                className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-primary-purple hover:border-primary-purple/50 transition-all duration-300"
              >
                <Mail size={20} />
              </a>
              <a
                href={`https://wa.me/${profile.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-emerald-400 hover:border-emerald-400/50 transition-all duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {['hero', 'about', 'experience', 'projects', 'skills', 'contact'].map((id) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className="block text-gray-400 hover:text-primary-purple transition-colors text-sm"
                >
                  {t(`nav.${id}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            {t('footer.madeWith')} <Heart size={14} className="text-primary-orange animate-pulse" />
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};
