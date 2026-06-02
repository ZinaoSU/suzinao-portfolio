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

// ===== Vercel TTS 代理 =====
// 通过项目自带的 /api/tts 代理 Google TTS，绕过 CORS + GFW

const TTS_MAX_CHUNK = 180; // 每段最大字符数（留余量）

function ttsUrl(text: string, lang: string): string {
  const params = new URLSearchParams({ text, lang });
  return `/api/tts?${params.toString()}`;
}

/** 按句子边界切分，确保每段不超过 maxLen */
function splitText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[。！？.!?，,；;：:\n])/);
  let current = '';
  for (const s of sentences) {
    if (current.length + s.length > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

/** fetch + Audio 播放单个片段（CORS 友好） */
function playAudioChunk(url: string, timeoutMs: number): Promise<void> {
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then(blob => {
      return new Promise<void>((resolve) => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        let resolved = false;
        const done = () => {
          if (!resolved) { resolved = true; URL.revokeObjectURL(audioUrl); resolve(); }
        };
        audio.onended = done;
        audio.onerror = () => { console.warn('[TTS] Playback error'); done(); };
        audio.play().catch(() => { done(); });
        setTimeout(done, timeoutMs);
      });
    })
    .catch(() => { /* 静默失败，继续下一段 */ });
}

// ===== 主组件 =====
export const TalkingHeadAvatar = forwardRef<TalkingHeadHandle, TalkingHeadAvatarProps>(
  ({ speaking, listening, thinking, size = 300, onSpeakStart, onSpeakEnd }, ref) => {
    const [localSpeaking, setLocalSpeaking] = useState(false);
    const cancelRef = useRef(false);

    const isActiveSpeaking = speaking || localSpeaking;

    const stop = () => {
      cancelRef.current = true;
      setLocalSpeaking(false);
    };

    const speak = (text: string) => {
      // 取消之前的播放
      cancelRef.current = true;
      // 重置取消标记
      cancelRef.current = false;
      const thisCancel = cancelRef;

      // 清洗文本
      const cleanText = text
        .replace(/[*_~`#]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/\n{2,}/g, '。')
        .replace(/\n/g, '，');

      if (!cleanText.trim()) return;

      const hasChinese = /[\u4e00-\u9fff]/.test(cleanText);
      const lang = hasChinese ? 'zh-CN' : 'en';

      // 分句
      const chunks = splitText(cleanText, TTS_MAX_CHUNK);

      // 串行播放
      const playAll = async () => {
        setLocalSpeaking(true);
        onSpeakStart?.();
        for (let i = 0; i < chunks.length; i++) {
          if (thisCancel.current) break;
          const url = ttsUrl(chunks[i], lang);
          // 估算每段播放时长（中文约 4 字/秒）
          const estMs = Math.max(2000, chunks[i].length * 250);
          await playAudioChunk(url, estMs);
        }
        if (!thisCancel.current) {
          setLocalSpeaking(false);
          onSpeakEnd?.();
        }
      };

      playAll().catch(() => {
        setLocalSpeaking(false);
        onSpeakEnd?.();
      });
    };

    useImperativeHandle(ref, () => ({ speak, stop }));

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
