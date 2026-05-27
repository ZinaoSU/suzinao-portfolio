import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AvatarState = 'idle' | 'listening' | 'speaking' | 'thinking';

interface DigitalHumanProps {
  state: AvatarState;
  size?: number;
}

// 音波条 - 说话时显示
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
            ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }
            : { duration: 0.3 }
        }
      />
    ))}
  </div>
);

// 音波涟漪 - 听时显示
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
  const pupilScale = state === 'listening' ? 1.3 : state === 'thinking' ? 0.7 : 1;

  return (
    <div className="relative flex flex-col items-center">
      {state === 'listening' && <ListeningRipple />}

      <motion.div
        className="relative"
        animate={{
          y: state === 'idle' ? [0, -5, 0] : 0,
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
          className="drop-shadow-[0_0_30px_rgba(236,72,153,0.25)]"
        >
          <defs>
            {/* 主渐变 - 暖紫粉调 */}
            <radialGradient id="faceGradF" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#2d1a3a" />
              <stop offset="100%" stopColor="#0f0d1a" />
            </radialGradient>
            {/* 边框渐变 - 粉紫 */}
            <linearGradient id="borderGradF" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            {/* 头发渐变 */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1025" />
              <stop offset="50%" stopColor="#261635" />
              <stop offset="100%" stopColor="#1a0f2e" />
            </linearGradient>
            {/* 思考光晕 */}
            <radialGradient id="thinkingGlowF" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </radialGradient>
            {/* 剪裁 */}
            <clipPath id="faceClipF">
              <circle cx="100" cy="100" r="88" />
            </clipPath>
          </defs>

          {/* Thinking glow */}
          <AnimatePresence>
            {state === 'thinking' && (
              <motion.circle
                cx="100" cy="100" r="90"
                fill="url(#thinkingGlowF)"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1.5, repeat: Infinity }, scale: { duration: 1.5, repeat: Infinity } }}
              />
            )}
          </AnimatePresence>

          {/* ===== 头发后层（披肩长发） ===== */}
          <motion.g
            animate={state === 'idle' ? { rotate: [0, 0.5, 0, -0.5, 0] } : {}}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* 左侧长发 */}
            <path
              d="M 18 90 Q 2 120 6 170 Q 10 195 30 180 Q 24 155 22 130 Q 20 105 22 90 Z"
              fill="url(#hairGrad)"
            />
            {/* 右侧长发 */}
            <path
              d="M 182 90 Q 198 120 194 170 Q 190 195 170 180 Q 176 155 178 130 Q 180 105 178 90 Z"
              fill="url(#hairGrad)"
            />
            {/* 头顶发量 */}
            <path
              d="M 40 40 Q 60 10 100 8 Q 140 10 160 40 L 165 55 L 35 55 Z"
              fill="url(#hairGrad)"
            />
            {/* 刘海 */}
            <path
              d="M 38 55 Q 55 38 82 42 Q 70 60 58 72 Q 45 65 38 55 Z"
              fill="url(#hairGrad)"
            />
            <path
              d="M 118 42 Q 145 38 162 55 L 142 72 Q 130 60 118 42 Z"
              fill="url(#hairGrad)"
            />
            {/* 头顶高光 */}
            <path
              d="M 65 20 Q 100 12 135 20"
              stroke="#4a2866"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
            />
          </motion.g>

          {/* ===== 头部主体 ===== */}
          <motion.circle
            cx="100" cy="100" r="88"
            fill="url(#faceGradF)"
            stroke="url(#borderGradF)"
            strokeWidth="2.5"
            animate={{ strokeOpacity: state === 'listening' ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          />

          {/* 耳朵 — 小巧圆润 */}
          <ellipse cx="16" cy="105" rx="8" ry="10" fill="#1a1025" />
          <ellipse cx="184" cy="105" rx="8" ry="10" fill="#1a1025" />
          {/* 耳饰/耳环 - 科技感光点 */}
          <circle cx="14" cy="118" r="2.5" fill="#ec4899" opacity="0.8" />
          <circle cx="186" cy="118" r="2.5" fill="#ec4899" opacity="0.8" />

          {/* 颈部 — 纤细 */}
          <path d="M 88 182 Q 92 200 88 205 L 112 205 Q 108 200 112 182" fill="#1a1025" opacity="0.6" />
          {/* 锁骨装饰 */}
          <line x1="80" y1="200" x2="120" y2="200" stroke="#ec4899" strokeWidth="0.8" opacity="0.3" />

          <g clipPath="url(#faceClipF)">
            {/* ===== 眉毛 — 纤细弯眉 ===== */}
            <motion.path
              d="M 60 78 Q 72 70 86 76"
              stroke="#d8b4fe"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              animate={{
                d:
                  state === 'thinking'
                    ? 'M 60 76 Q 72 78 86 75'
                    : state === 'listening'
                    ? 'M 58 74 Q 72 68 88 73'
                    : 'M 60 78 Q 72 70 86 76',
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M 114 76 Q 128 70 140 78"
              stroke="#d8b4fe"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              animate={{
                d:
                  state === 'thinking'
                    ? 'M 114 75 Q 128 78 140 76'
                    : state === 'listening'
                    ? 'M 112 73 Q 128 68 142 74'
                    : 'M 114 76 Q 128 70 140 78',
              }}
              transition={{ duration: 0.3 }}
            />

            {/* ===== 眼睛 ===== */}
            {/* 左眼 */}
            <motion.ellipse
              cx="72" cy="92"
              rx="15" ry={15 * eyeOpen}
              fill="#0f0d1a"
              stroke="#c084fc"
              strokeWidth="2"
              animate={{ scaleY: eyeOpen }}
              transition={{ duration: 0.1 }}
            />
            {/* 左瞳孔 */}
            <motion.ellipse
              cx="72" cy="92" rx="5.5" ry="5.5"
              fill="#e9d5ff"
              animate={{ scale: pupilScale }}
              transition={{ duration: 0.3 }}
            />
            {/* 左眼高光 */}
            <ellipse cx="67" cy="87" rx="3" ry="3" fill="white" opacity="0.95" />
            <ellipse cx="76" cy="93" rx="1.5" ry="1.5" fill="white" opacity="0.5" />

            {/* 右眼 */}
            <motion.ellipse
              cx="128" cy="92"
              rx="15" ry={15 * eyeOpen}
              fill="#0f0d1a"
              stroke="#c084fc"
              strokeWidth="2"
              animate={{ scaleY: eyeOpen }}
              transition={{ duration: 0.1 }}
            />
            {/* 右瞳孔 */}
            <motion.ellipse
              cx="128" cy="92" rx="5.5" ry="5.5"
              fill="#e9d5ff"
              animate={{ scale: pupilScale }}
              transition={{ duration: 0.3 }}
            />
            {/* 右眼高光 */}
            <ellipse cx="123" cy="87" rx="3" ry="3" fill="white" opacity="0.95" />
            <ellipse cx="132" cy="93" rx="1.5" ry="1.5" fill="white" opacity="0.5" />

            {/* ===== 睫毛 ===== */}
            {eyeOpen > 0.3 && (
              <>
                {/* 左上睫毛 */}
                <path d="M 60 89 L 57 85 M 63 85 L 61 81 M 68 83 L 66 79 M 73 83 L 73 78 M 78 85 L 80 81 M 83 89 L 86 85"
                  stroke="#d8b4fe" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
                {/* 右上睫毛 */}
                <path d="M 117 89 L 114 85 M 122 85 L 120 81 M 127 83 L 127 78 M 132 83 L 134 79 M 137 85 L 140 81 M 140 89 L 143 85"
                  stroke="#d8b4fe" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
                {/* 下睫毛（短促） */}
                <path d="M 63 97 L 61 100 M 70 100 L 69 103 M 77 100 L 78 103"
                  stroke="#d8b4fe" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.45" />
                <path d="M 123 100 L 122 103 M 130 100 L 131 103 M 137 97 L 139 100"
                  stroke="#d8b4fe" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.45" />
              </>
            )}

            {/* ===== 鼻子 — 小巧精致 ===== */}
            <path d="M 100 106 L 97 118 Q 100 120 103 118 L 100 106"
              fill="#a855f7" opacity="0.25" />
            {/* 鼻尖高光 */}
            <ellipse cx="99" cy="117" rx="1.5" ry="1" fill="#d8b4fe" opacity="0.2" />

            {/* ===== 嘴巴 — 饱满唇形 ===== */}
            {state === 'speaking' ? (
              // 说话时 — 椭圆张嘴
              <motion.ellipse
                cx="100" cy="138"
                rx={13} ry={5 + mouthPhase * 3}
                fill="#6b21a8"
                stroke="#ec4899"
                strokeWidth="1.5"
                animate={{ ry: [5, 10, 14, 7][mouthPhase % 4] }}
                transition={{ duration: 0.1 }}
              />
            ) : state === 'listening' ? (
              // 听时 — 微张的O型嘴
              <ellipse
                cx="100" cy="136" rx="6" ry="7"
                fill="#6b21a8"
                stroke="#ec4899"
                strokeWidth="1"
              />
            ) : (
              // 默认 — 微笑唇形（上唇+下唇）
              <>
                {/* 上唇 — 丘比特弓 */}
                <path
                  d="M 88 136 Q 94 130 100 133 Q 106 130 112 136"
                  stroke="#ec4899"
                  strokeWidth="1.8"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* 下唇 — 饱满弧度 */}
                <path
                  d="M 88 136 Q 94 142 100 144 Q 106 142 112 136"
                  stroke="#ec4899"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* 唇部填充 */}
                <path
                  d="M 88 136 Q 94 130 100 133 Q 106 130 112 136 Q 106 142 100 144 Q 94 142 88 136 Z"
                  fill="#ec4899"
                  opacity="0.15"
                />
              </>
            )}

            {/* ===== 腮红 ===== */}
            <ellipse cx="54" cy="114" rx="12" ry="7" fill="#ec4899" opacity="0.12" />
            <ellipse cx="146" cy="114" rx="12" ry="7" fill="#ec4899" opacity="0.12" />
          </g>

          {/* ===== 外环装饰 ===== */}
          <motion.circle
            cx="100" cy="100" r="93"
            stroke="#ec4899"
            strokeWidth="0.5"
            fill="none"
            opacity="0.12"
            animate={
              state === 'listening'
                ? { rotate: [0, 360], opacity: [0.12, 0.25, 0.12] }
                : { rotate: 0, opacity: 0.12 }
            }
            transition={
              state === 'listening'
                ? { rotate: { duration: 8, repeat: Infinity, ease: 'linear' } }
                : { duration: 0.3 }
            }
          />

          {/* ===== 顶部状态指示 ===== */}
          <AnimatePresence mode="wait">
            {state === 'listening' && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <rect x="87" y="6" width="26" height="14" rx="7" fill="#ec4899" opacity="0.2" />
                <text x="100" y="16" textAnchor="middle" fontSize="9" fill="#f9a8d4" fontWeight="bold">
                  🎤
                </text>
              </motion.g>
            )}
            {state === 'thinking' && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <rect x="87" y="6" width="26" height="14" rx="7" fill="#6b21a8" opacity="0.3" />
                <text x="100" y="16" textAnchor="middle" fontSize="8" fill="#d8b4fe" fontWeight="bold">
                  💭
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* 装饰节点 */}
          <circle cx="48" cy="48" r="3" fill="#ec4899" opacity="0.5" />
          <circle cx="158" cy="40" r="2.5" fill="#c084fc" opacity="0.4" />
          <circle cx="32" cy="142" r="2" fill="#a855f7" opacity="0.35" />
        </svg>
      </motion.div>

      <VoiceWave active={state === 'speaking'} />
    </div>
  );
};
