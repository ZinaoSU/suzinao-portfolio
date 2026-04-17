import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  showThumbnails?: boolean;
  className?: string;
  onImageClick?: (index: number) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  images,
  autoPlay = true,
  interval = 4000,
  showThumbnails = true,
  className = '',
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [isPlaying, interval, goNext, images.length]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-xl bg-dark-card/50 aspect-video">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            onClick={() => onImageClick?.(currentIndex)}
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Play/Pause Button */}
        {images.length > 1 && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-2 right-2 p-2 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )}

        {/* Counter */}
        <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-black/40 text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary-purple scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
