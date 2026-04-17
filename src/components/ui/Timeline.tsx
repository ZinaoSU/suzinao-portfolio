import React from 'react';
import { motion } from 'framer-motion';

interface TimelineItem {
  id: string;
  period: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  isZh: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ items, isZh }) => {
  return (
    <div className="relative">
      <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary-purple via-primary-violet to-primary-orange" />
      
      <div className="space-y-12">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${
              index % 2 === 0 ? 'md:flex-row-reverse' : ''
            }`}
          >
            <div className="flex-1 md:text-right">
              {index % 2 === 0 ? (
                <div className="glass-card p-6 text-left md:text-right">
                  <span className="text-primary-purple font-medium">{item.period}</span>
                  <h3 className="text-xl font-bold text-white mt-2">{item.title}</h3>
                  {item.subtitle && (
                    <p className="text-gray-400 mt-1">{item.subtitle}</p>
                  )}
                  {item.description && (
                    <p className="text-gray-300 mt-3">{item.description}</p>
                  )}
                </div>
              ) : null}
            </div>
            
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-primary-purple to-primary-violet shadow-lg shadow-primary-purple/50 z-10">
              <div className="w-3 h-3 rounded-full bg-white" />
            </div>
            
            <div className="flex-1">
              {index % 2 !== 0 ? (
                <div className="glass-card p-6 ml-12 md:ml-0">
                  <span className="text-primary-purple font-medium">{item.period}</span>
                  <h3 className="text-xl font-bold text-white mt-2">{item.title}</h3>
                  {item.subtitle && (
                    <p className="text-gray-400 mt-1">{item.subtitle}</p>
                  )}
                  {item.description && (
                    <p className="text-gray-300 mt-3">{item.description}</p>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
