import { useState, useEffect, useCallback } from 'react';

export const useScrollSpy = (sectionIds: string[], offset: number = 100) => {
  const [activeId, setActiveId] = useState<string>('');

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + offset;
    
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const element = document.getElementById(sectionIds[i]);
      if (element && element.offsetTop <= scrollY) {
        setActiveId(sectionIds[i]);
        return;
      }
    }
    
    setActiveId(sectionIds[0] || '');
  }, [sectionIds, offset]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return activeId;
};
