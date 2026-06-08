import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TalkingHeadAvatar, TalkingHeadHandle } from './TalkingHeadAvatar';

export type AvatarState = 'idle' | 'listening' | 'speaking' | 'thinking';

export interface DigitalHumanHandle {
  speak: (text: string) => void;
  stop: () => void;
  setMuted: (muted: boolean) => void;
}

interface DigitalHumanProps {
  state: AvatarState;
  size?: number;
  onSpeakEnd?: () => void;
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

export const DigitalHuman = forwardRef<DigitalHumanHandle, DigitalHumanProps>(
  ({ state, size = 160, onSpeakEnd }, ref) => {
    const avatarRef = useRef<TalkingHeadHandle>(null);
    const [avatarSpeaking, setAvatarSpeaking] = React.useState(false);

    // 组合状态：外部传入的 speaking 或 内部 TTS speaking
    const effectiveSpeaking = state === 'speaking' || avatarSpeaking;

    useImperativeHandle(ref, () => ({
      speak: (text: string) => {
        avatarRef.current?.speak(text);
      },
      stop: () => {
        avatarRef.current?.stop();
        setAvatarSpeaking(false);
      },
      setMuted: (_muted: boolean) => {
        avatarRef.current?.setMuted(_muted);
        // 静音时姿势保持 speaking，取消静音时也不改状态
        // 真正的状态切换由 onSpeakEnd 驱动
      },
    }));

    return (
      <div className="relative flex flex-col items-center">
        {state === 'listening' && <ListeningRipple />}

        <motion.div
          className="relative"
          animate={{
            y: state === 'idle' && !avatarSpeaking ? [0, -5, 0] : 0,
            scale: state === 'listening' ? 1.05 : state === 'thinking' ? 0.98 : 1,
          }}
          transition={
            state === 'idle' && !avatarSpeaking
              ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3 }
          }
        >
          <div
            style={{ width: size, height: size }}
            className="rounded-full overflow-hidden drop-shadow-[0_0_30px_rgba(236,72,153,0.25)]"
          >
            <TalkingHeadAvatar
              ref={avatarRef}
              speaking={effectiveSpeaking}
              listening={state === 'listening'}
              thinking={state === 'thinking'}
              size={size}
              onSpeakStart={() => setAvatarSpeaking(true)}
              onSpeakEnd={() => { setAvatarSpeaking(false); onSpeakEnd?.(); }}
            />
          </div>

          {/* 顶部状态指示 */}
          <AnimatePresence mode="wait">
            {state === 'listening' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2"
              >
                <div className="px-3 py-1 rounded-full bg-[#ec4899]/20 border border-[#ec4899]/30 text-[11px] text-pink-300 font-medium">
                  🎤
                </div>
              </motion.div>
            )}
            {state === 'thinking' && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2"
              >
                <div className="px-3 py-1 rounded-full bg-purple-800/30 border border-purple-500/30 text-[11px] text-purple-300 font-medium">
                  💭
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <VoiceWave active={effectiveSpeaking} />
      </div>
    );
  }
);

DigitalHuman.displayName = 'DigitalHuman';
