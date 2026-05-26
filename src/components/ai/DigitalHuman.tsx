import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AvatarState = 'idle' | 'listening' | 'speaking' | 'thinking';

interface DigitalHumanProps {
  state: AvatarState;
  size?: number;
}

// 音波条动画 - 说话时显示
const VoiceWave: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-center justify-center gap-[3px] mt-2">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="w-[3px] rounded-full bg-gradient-to-t from-primary-purple to-primary-violet"
        animate={
          active
            ? {
                height: [8, 24, 12, 28, 16][i],
                opacity: [0.6, 1, 0.6, 1, 0.6][i],
              }
            : { height: 4, opacity: 0.3 }
        }
        transition={
          active
            ? {
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.1,
              }
            : { duration: 0.3 }
        }
      />
    ))}
  </div>
);

// 音波涟漪 - 听的时候显示
const ListeningRipple: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border border-primary-purple/30"
        initial={{ width: 80, height: 80, opacity: 0.6 }}
        animate={{
          width: [80, 140, 200],
          height: [80, 140, 200],
          opacity: [0.6, 0.2, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          delay: i * 0.6,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

export const DigitalHuman: React.FC<DigitalHumanProps> = ({ state, size = 160 }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);

  // 随机眨眼
  useEffect(() => {
    if (state === 'idle') {
      const blinkInterval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }, 2500 + Math.random() * 3000);
      return () => clearInterval(blinkInterval);
    } else if (state === 'listening') {
      setIsBlinking(false);
    }
  }, [state]);

  // 说话时嘴巴动画
  useEffect(() => {
    if (state === 'speaking') {
      const interval = setInterval(() => {
        setMouthPhase((prev) => (prev + 1) % 4);
      }, 120);
      return () => clearInterval(interval);
    } else {
      setMouthPhase(0);
    }
  }, [state]);

  const eyeOpen = state === 'thinking' ? 0.3 : isBlinking ? 0.1 : 1;
  const mouthOpen = state === 'speaking' ? [0.3, 0.6, 0.8, 0.4][mouthPhase] : 0;

  // 眼睛瞳孔大小
  const pupilScale = state === 'listening' ? 1.3 : state === 'thinking' ? 0.7 : 1;

  return (
    <div className="relative flex flex-col items-center">
      {/* Listening Ripple */}
      {state === 'listening' && <ListeningRipple />}

      <motion.div
        className="relative"
        animate={{
          y: state === 'idle' ? [0, -6, 0] : 0,
          scale: state === 'listening' ? 1.05 : state === 'thinking' ? 0.98 : 1,
        }}
        transition={
          state === 'idle'
            ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
        }
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]"
        >
          <defs>
            {/* 渐变背景 */}
            <radialGradient id="faceGrad" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f0d1a" />
            </radialGradient>
            {/* 边框渐变 */}
            <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            {/* 思考光晕 */}
            <radialGradient id="thinkingGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
            {/* 剪裁路径 */}
            <clipPath id="faceClip">
              <circle cx="100" cy="100" r="88" />
            </clipPath>
          </defs>

          {/* Thinking glow circle */}
          <AnimatePresence>
            {state === 'thinking' && (
              <motion.circle
                cx="100"
                cy="100"
                r="90"
                fill="url(#thinkingGlow)"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 1.5, repeat: Infinity },
                  scale: { duration: 1.5, repeat: Infinity },
                }}
              />
            )}
          </AnimatePresence>

          {/* 头部圆 */}
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            fill="url(#faceGrad)"
            stroke="url(#borderGrad)"
            strokeWidth="2.5"
            animate={{
              strokeOpacity: state === 'listening' ? 1 : 0.7,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* 装饰圆点 - 类似科技感的节点 */}
          <circle cx="50" cy="50" r="3" fill="#8b5cf6" opacity="0.6" />
          <circle cx="155" cy="42" r="2.5" fill="#a78bfa" opacity="0.5" />
          <circle cx="35" cy="140" r="2" fill="#7c3aed" opacity="0.4" />

          <g clipPath="url(#faceClip)">
            {/* 眉毛 */}
            <motion.path
              d="M 62 72 Q 72 68 82 73"
              stroke="#c4b5fd"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              animate={{
                d:
                  state === 'thinking'
                    ? 'M 62 70 Q 72 72 82 70'
                    : state === 'listening'
                    ? 'M 60 68 Q 72 65 84 68'
                    : 'M 62 72 Q 72 68 82 73',
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M 118 73 Q 128 68 138 72"
              stroke="#c4b5fd"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              animate={{
                d:
                  state === 'thinking'
                    ? 'M 118 70 Q 128 72 138 70'
                    : state === 'listening'
                    ? 'M 116 68 Q 128 65 140 68'
                    : 'M 118 73 Q 128 68 138 72',
              }}
              transition={{ duration: 0.3 }}
            />

            {/* 左眼 */}
            <motion.ellipse
              cx="72"
              cy="88"
              rx="14"
              ry={14 * eyeOpen}
              fill="#0f0d1a"
              stroke="#a78bfa"
              strokeWidth="2"
              animate={{ scaleY: eyeOpen }}
              transition={{ duration: 0.1 }}
            />
            {/* 左瞳孔 */}
            <motion.ellipse
              cx="72"
              cy="88"
              rx="5"
              ry="5"
              fill="#c4b5fd"
              animate={{
                scale: pupilScale,
              }}
              transition={{ duration: 0.3 }}
            />
            {/* 左眼高光 */}
            <ellipse cx="68" cy="84" rx="2.5" ry="2.5" fill="white" opacity="0.9" />

            {/* 右眼 */}
            <motion.ellipse
              cx="128"
              cy="88"
              rx="14"
              ry={14 * eyeOpen}
              fill="#0f0d1a"
              stroke="#a78bfa"
              strokeWidth="2"
              animate={{ scaleY: eyeOpen }}
              transition={{ duration: 0.1 }}
            />
            {/* 右瞳孔 */}
            <motion.ellipse
              cx="128"
              cy="88"
              rx="5"
              ry="5"
              fill="#c4b5fd"
              animate={{
                scale: pupilScale,
              }}
              transition={{ duration: 0.3 }}
            />
            {/* 右眼高光 */}
            <ellipse cx="124" cy="84" rx="2.5" ry="2.5" fill="white" opacity="0.9" />

            {/* 鼻子 */}
            <path
              d="M 98 105 L 95 120 L 105 120 L 102 105"
              fill="#7c3aed"
              opacity="0.4"
            />

            {/* 嘴巴 - 变化形状 */}
            {state === 'speaking' ? (
              // 说话时 - 椭圆形嘴巴
              <motion.ellipse
                cx="100"
                cy="140"
                rx={12}
                ry={6 + mouthPhase * 3}
                fill="#4c1d95"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                animate={{
                  ry: [5, 10, 14, 7][mouthPhase % 4],
                }}
                transition={{ duration: 0.1 }}
              />
            ) : state === 'listening' ? (
              // 听时 - 微微张嘴的圆形
              <ellipse
                cx="100"
                cy="140"
                rx="5"
                ry="5"
                fill="#4c1d95"
                stroke="#8b5cf6"
                strokeWidth="1"
              />
            ) : (
              // 默认 - 微笑曲线
              <path
                d="M 88 138 Q 100 148 112 138"
                stroke="#8b5cf6"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* 脸颊微红 */}
            <ellipse cx="56" cy="112" rx="10" ry="6" fill="#7c3aed" opacity="0.1" />
            <ellipse cx="144" cy="112" rx="10" ry="6" fill="#7c3aed" opacity="0.1" />
          </g>

          {/* 外环装饰 - 科技感 */}
          <motion.circle
            cx="100"
            cy="100"
            r="93"
            stroke="#8b5cf6"
            strokeWidth="0.5"
            fill="none"
            opacity="0.15"
            animate={
              state === 'listening'
                ? {
                    rotate: [0, 360],
                    opacity: [0.15, 0.3, 0.15],
                  }
                : { rotate: 0, opacity: 0.15 }
            }
            transition={
              state === 'listening'
                ? { rotate: { duration: 8, repeat: Infinity, ease: 'linear' } }
                : { duration: 0.3 }
            }
          />

          {/* 顶部状态指示器 */}
          <AnimatePresence mode="wait">
            {state === 'listening' && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <rect x="87" y="8" width="26" height="14" rx="7" fill="#8b5cf6" opacity="0.2" />
                <text x="100" y="18" textAnchor="middle" fontSize="9" fill="#a78bfa" fontWeight="bold">
                  🎤
                </text>
              </motion.g>
            )}
            {state === 'thinking' && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <rect x="87" y="8" width="26" height="14" rx="7" fill="#4c1d95" opacity="0.3" />
                <text x="100" y="18" textAnchor="middle" fontSize="8" fill="#a78bfa" fontWeight="bold">
                  💭
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </motion.div>

      {/* 底部音波 */}
      <VoiceWave active={state === 'speaking'} />
    </div>
  );
};
