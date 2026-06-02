import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Vite 兼容 base 路径 — 使用已修正手臂姿势的模型
const MODEL_URL = import.meta.env.BASE_URL + 'models/vroid-fixed.glb';

// ===== 类型定义 =====
export interface TalkingHeadHandle {
  speak: (text: string) => void;
  stop: () => void;
}

interface TalkingHeadAvatarProps {
  speaking: boolean;
  listening: boolean;
  thinking: boolean;
  size?: number;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

// ===== VRoid 模型的 morph target 索引 =====
const MORPH = {
  jawOpen: 72,
  eyeBlinkLeft: 65,
  eyeBlinkRight: 66,
  mouthSmileLeft: 78,
  mouthSmileRight: 79,
  mouthA: 39,
  mouthI: 40,
  mouthU: 41,
  mouthE: 42,
  mouthO: 43,
} as const;

// ===== 目标手臂姿势：A-pose（手臂从 T-pose 水平位旋转 45° 向下） =====
// LeftArm:       Euler(-0.7854, 0, 0)  → sin(-22.5°)= -0.38268, cos(-22.5°)=0.92388
// RightArm:      Euler(-0.7854, 0, 0)  → 同上
// Shoulder 不修改，保留原始旋转（Y≈72.7° 让手臂指向前方）
// ForeArm 不修改，保留原始微弯曲
const ARM_TARGET_QUATS: Record<string, readonly [number, number, number, number]> = {
  LeftArm:   [-0.38268, 0, 0, 0.92388],
  RightArm:  [-0.38268, 0, 0, 0.92388],
};

// ===== VRoid 半身像组件 =====
const VroidPortrait: React.FC<{
  mouthOpen: number;
  eyeBlink: number;
  headTurn: number;
}> = ({ mouthOpen, eyeBlink, headTurn }) => {
  const groupRef = useRef<THREE.Group>(null);
  const faceMeshesRef = useRef<THREE.Mesh[]>([]);
  const armBonesRef = useRef<THREE.Bone[]>([]);
  const skeletonsRef = useRef<THREE.Skeleton[]>([]);
  const { scene } = useGLTF(MODEL_URL);

  // 找面部 mesh + 收集手臂骨骼引用（只跑一次）
  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    const armBones: THREE.Bone[] = [];
    const skeletons: THREE.Skeleton[] = [];

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && (child.morphTargetInfluences?.length ?? 0) >= 100) {
        meshes.push(child);
      }
      if (child instanceof THREE.Bone && ARM_TARGET_QUATS[child.name]) {
        armBones.push(child);
      }
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        if (!skeletons.includes(child.skeleton)) skeletons.push(child.skeleton);
      }
    });

    faceMeshesRef.current = meshes;
    armBonesRef.current = armBones;
    skeletonsRef.current = skeletons;
    console.log('[VRoid] faces:', meshes.length, 'arm bones:', armBones.length, 'skeletons:', skeletons.length);
  }, [scene]);

  // Head turn
  useEffect(() => {
    if (groupRef.current) groupRef.current.rotation.y = headTurn;
  }, [headTurn]);

  // Per-frame: 面部动画 + 每帧强制骨骼姿势（简单粗暴但可靠）
  useFrame(() => {
    const meshes = faceMeshesRef.current;
    const t = Date.now() * 0.001;

    // === 骨骼姿势：每帧重设 quaternion → 更新 matrixWorld → 更新 skeleton ===
    const armBones = armBonesRef.current;
    if (armBones.length > 0) {
      for (const bone of armBones) {
        const target = ARM_TARGET_QUATS[bone.name];
        if (target) {
          bone.quaternion.set(target[0], target[1], target[2], target[3]);
          bone.updateMatrixWorld(); // 关键：把 quaternion 变化推送到 matrixWorld
        }
      }
      // skeleton.update() 读取 bone.matrixWorld 计算 boneMatrices → GPU shader
      for (const skel of skeletonsRef.current) {
        skel.update();
      }
    }

    // === 面部动画 ===
    for (const mesh of meshes) {
      const infl = mesh.morphTargetInfluences;
      if (!infl || infl.length < 124) continue;
      const vp = (t * 6) % 5;
      const vi = Math.floor(vp);
      const vf = vp - vi;
      const vw = [0, 0, 0, 0, 0];
      vw[vi] = 1 - vf;
      vw[(vi + 1) % 5] = vf;
      const i = mouthOpen;
      infl[MORPH.jawOpen] = i * 0.7;
      (['mouthA', 'mouthI', 'mouthU', 'mouthE', 'mouthO'] as const).forEach((k, j) => {
        infl[MORPH[k]] = i * vw[j] * 0.7;
      });
      infl[MORPH.mouthSmileLeft] = i * 0.08;
      infl[MORPH.mouthSmileRight] = i * 0.08;
      infl[MORPH.eyeBlinkLeft] = eyeBlink;
      infl[MORPH.eyeBlinkRight] = eyeBlink;
    }
  });

  return <primitive ref={groupRef} object={scene} />;
};

// 预加载模型
useGLTF.preload(MODEL_URL);

// ===== 光环效果 =====
const AuraRing: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
      if (active) {
        ringRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.08);
      }
    }
  });

  return (
    <mesh ref={ringRef} rotation={[0, 0, Math.PI * 0.1]}>
      <torusGeometry args={[0.65, 0.015, 16, 64]} />
      <meshBasicMaterial color={color} transparent opacity={active ? 0.5 : 0.15} />
    </mesh>
  );
};

// ===== 外部光环 =====
const OuterGlow: React.FC<{ active: boolean }> = ({ active }) => {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.15;
      glowRef.current.rotation.x += delta * 0.08;
      const s = active ? 1 + Math.sin(Date.now() * 0.002) * 0.08 : 0.95;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={glowRef}>
      <torusGeometry args={[0.68, 0.01, 16, 80]} />
      <meshBasicMaterial
        color={active ? '#ec4899' : '#8b5cf6'}
        transparent
        opacity={active ? 0.3 : 0.12}
      />
    </mesh>
  );
};

// ===== 加载中占位 =====
const LoadingFallback: React.FC = () => (
  <mesh>
    <sphereGeometry args={[0.3, 32, 32]} />
    <meshStandardMaterial color="#1e1b4b" wireframe />
  </mesh>
);

// ===== 3D 场景内容 =====
const SceneContent: React.FC<{
  speaking: boolean;
  listening: boolean;
  thinking: boolean;
}> = ({ speaking, listening, thinking }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [eyeBlink, setEyeBlink] = useState(0);
  const [headTurn, setHeadTurn] = useState(0);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.3, 1.9);
    camera.lookAt(0, 1.25, 0);
  }, [camera]);

  // 说话嘴部动画
  useEffect(() => {
    if (speaking) {
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        const t = frame * 0.15;
        const val =
          Math.sin(t * 3.7) * 0.5 +
          Math.sin(t * 7.1) * 0.3 +
          Math.sin(t * 13.3) * 0.2;
        setMouthOpen(Math.abs(val) * 0.8 + 0.2);
      }, 50);
      return () => clearInterval(interval);
    } else {
      setMouthOpen(0);
    }
  }, [speaking]);

  // 眨眼动画
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => {
        setEyeBlink(1);
        setTimeout(() => setEyeBlink(0), 130);
        scheduleBlink();
      }, delay);
    };
    const timer = scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  // 头部微动
  useEffect(() => {
    const interval = setInterval(() => {
      if (!listening && !speaking) {
        setHeadTurn(Math.sin(Date.now() * 0.0008) * 0.12);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [listening, speaking]);

  // 整体浮动
  useFrame((_, delta) => {
    if (groupRef.current) {
      const speed = thinking ? 2.5 : 1;
      const amplitude = thinking ? 0.05 : 0.02;
      groupRef.current.position.y = Math.sin(Date.now() * 0.001 * speed) * amplitude;
    }
  });

  const isActive = speaking || listening;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1.0} />
      <directionalLight position={[2, 3, 3]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-1, 1, -1]} intensity={0.5} color="#d4bfff" />
      <pointLight position={[0, 1.5, 2]} intensity={0.6} color="#ffe0f0" />

      <Sparkles
        count={25}
        scale={2}
        size={2}
        speed={0.3}
        opacity={isActive ? 0.45 : 0.12}
        color={isActive ? '#ec4899' : '#8b5cf6'}
      />

      <AuraRing active={speaking} color="#ec4899" />
      <AuraRing active={listening} color="#8b5cf6" />
      <OuterGlow active={isActive} />

      <Suspense fallback={<LoadingFallback />}>
        <VroidPortrait
          mouthOpen={mouthOpen}
          eyeBlink={eyeBlink}
          headTurn={headTurn}
        />
      </Suspense>
    </group>
  );
};

// ===== 浏览器 TTS：优先选择高质量中文女声 =====

// 中文女声优先级列表（从高到低）
const ZH_VOICE_PRIORITY = [
  'zh-CN-XiaoxiaoNeural',   // 微软晓晓（Edge/Windows 11）
  'zh-CN-XiaoyiNeural',     // 微软晓依
  'zh-CN-YunxiNeural',      // 微软云希
  'zh-CN-YunjianNeural',    // 微软云健
  'zh-CN-YunyangNeural',    // 微软云扬
  'zh-CN-YunxiaNeural',     // 微软云夏
  'zh-CN-XiaochenNeural',   // 微软晓辰
  'zh-CN-liaoning-XiaobeiNeural', // 微软晓北（东北话）
  'zh-TW-HsiaoChenNeural',  // 台湾女声
  'zh-HK-HiuGaaiNeural',    // 香港女声
  'zh-CN',                  // 任意中文
];

const EN_VOICE_PRIORITY = [
  'en-US-JennyNeural',      // 微软 Jenny
  'en-US-AriaNeural',       // 微软 Aria
  'en-US-AvaNeural',        // 微软 Ava
  'en-US-MichelleNeural',   // 微软 Michelle
  'en-US',                  // 任意英文
];

function findBestVoice(voices: SpeechSynthesisVoice[], priorities: string[]): SpeechSynthesisVoice | undefined {
  for (const name of priorities) {
    const found = voices.find(v => v.name === name);
    if (found) return found;
  }
  // fallback: 按 lang 匹配
  for (const name of priorities) {
    if (name.includes('-')) {
      const lang = name.split('-').slice(0, 2).join('-');
      const found = voices.find(v => v.lang.startsWith(lang));
      if (found) return found;
    }
  }
  return undefined;
}

// ===== 主组件 =====
export const TalkingHeadAvatar = forwardRef<TalkingHeadHandle, TalkingHeadAvatarProps>(
  ({ speaking, listening, thinking, size = 300, onSpeakStart, onSpeakEnd }, ref) => {
    const [localSpeaking, setLocalSpeaking] = useState(false);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const voicesLoadedRef = useRef(false);

    const isActiveSpeaking = speaking || localSpeaking;

    const stop = () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setLocalSpeaking(false);
    };

    const speak = (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      const synth = window.speechSynthesis;
      synthRef.current = synth;
      synth.cancel(); // 先取消当前播放

      // 清洗文本
      const cleanText = text
        .replace(/[*_~`#]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/\n{2,}/g, '。')
        .replace(/\n/g, '，');

      if (!cleanText.trim()) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      const hasChinese = /[\u4e00-\u9fff]/.test(cleanText);
      utterance.lang = hasChinese ? 'zh-CN' : 'en-US';
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // 智能选语音
      const voices = synth.getVoices();
      if (voices.length > 0) {
        const bestVoice = hasChinese
          ? findBestVoice(voices, ZH_VOICE_PRIORITY)
          : findBestVoice(voices, EN_VOICE_PRIORITY);
        if (bestVoice) {
          utterance.voice = bestVoice;
          console.log('[TTS] Using voice:', bestVoice.name, bestVoice.lang);
        }
      }

      utterance.onstart = () => {
        setLocalSpeaking(true);
        onSpeakStart?.();
      };
      utterance.onend = () => {
        setLocalSpeaking(false);
        onSpeakEnd?.();
      };
      utterance.onerror = (e) => {
        // 忽略用户主动取消导致的错误
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('[TTS] Utterance error:', e.error);
        }
        setLocalSpeaking(false);
        onSpeakEnd?.();
      };

      synth.speak(utterance);
    };

    useImperativeHandle(ref, () => ({ speak, stop }));

    // 预加载语音列表（浏览器异步加载）
    useEffect(() => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const synth = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          voicesLoadedRef.current = true;
          console.log('[TTS] Voices loaded:', voices.length);
        }
      };

      loadVoices();
      synth.onvoiceschanged = loadVoices;

      return () => {
        synth.cancel();
      };
    }, []);

    return (
      <div style={{ width: size, height: size, position: 'relative', cursor: 'default' }}>
        <Canvas
          camera={{ position: [0, 1.3, 1.9], fov: 35 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <SceneContent speaking={isActiveSpeaking} listening={listening} thinking={thinking} />
        </Canvas>
      </div>
    );
  }
);

TalkingHeadAvatar.displayName = 'TalkingHeadAvatar';

export default TalkingHeadAvatar;
