import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Vite 兼容 base 路径 — 使用已修正手臂姿势的模型
const MODEL_URL = import.meta.env.BASE_URL + 'models/vroid-fixed.glb';

// ===== 类型定义 =====
export interface TalkingHeadHandle {
  speak: (text: string) => void;
  stop: () => void;
  setMuted: (muted: boolean) => void;
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

// 🤔 思考表情的 morph target 索引（来自 TalkingHead animEmojis['🤔']）
const MORPH_THINK: readonly [number, number][] = [
  [96, 1.0],   // browDownLeft
  [100, 1.0],  // browOuterUpRight
  [122, 0.6],  // eyeSquintLeft
  [80, 0.7],   // mouthFrownLeft
  [81, 0.7],   // mouthFrownRight
  [92, 0.3],   // mouthLowerDownLeft
  [91, 0.4],   // mouthPressRight
  [75, 0.1],   // mouthPucker
  [77, 0.5],   // mouthRight
  [86, 0.5],   // mouthRollLower
  [87, 0.2],   // mouthRollUpper
];

// ===== 姿势定义（引用 TalkingHead 官方 poseTemplates） =====

// Straight 姿势（ idle 静置）- 来自 TalkingHead poseTemplates['straight']
const STRAIGHT_POSE: Record<string, readonly [number, number, number, number]> = {
  LeftShoulder:  [0.54269, 0.47932, -0.53584, 0.43431],
  LeftArm:       [0.56277, 0.24202, 0.12414, 0.78058],
  LeftForeArm:    [0.00000, 0.00000, 0.15043, 0.98862],
  RightShoulder: [0.53629, -0.48419, 0.49519, 0.48243],
  RightArm:      [0.58449, -0.20537, -0.07746, 0.78114],
  RightForeArm:   [0.00000, 0.00000, -0.15784, 0.98747],
  Spine:     [0, 0, 0, 1],
  Spine1:    [0, 0, 0, 1],
  Spine2:    [0, 0, 0, 1],
};

// Side 姿势（ talking 说话时）- 来自 TalkingHead poseTemplates['side']
const SIDE_POSE: Record<string, readonly [number, number, number, number]> = {
  Hips:         [-0.00192, -0.00841, 0.04999, 0.99871],
  Spine:        [-0.05142, -0.00262, -0.03140, 0.99818],
  Spine1:       [0.02133, -0.00927, -0.03469, 0.99913],
  Spine2:       [0.06561, -0.00386, -0.03282, 0.99730],
  Neck:         [0.01350, 0.00300, 0.00004, 0.99990],
  Head:         [0.03847, -0.03247, -0.00125, 0.99873],
  LeftShoulder: [0.43102, 0.57295, -0.51993, 0.46435],
  LeftArm:      [0.62954, 0.03404, -0.00069, 0.77622],
  LeftForeArm:  [0.00041, -0.00362, 0.16474, 0.98633],
  RightShoulder:[0.49105, -0.49422, 0.59605, 0.39918],
  RightArm:     [0.58959, -0.12113, -0.13053, 0.78783],
  RightForeArm: [-0.00266, -0.01623, -0.17745, 0.98399],
};

// Side 手势（ talking 时左手动作）- 来自 TalkingHead gestureTemplates['side']
const SIDE_GESTURE: Record<string, readonly [number, number, number, number]> = {
  LeftShoulder:  [0.53559, 0.55197, -0.47423, 0.42846],
  LeftArm:       [0.27536, -0.58024, 0.11469, 0.75785],
  LeftForeArm:   [0.00000, 0.00000, 0.38942, 0.92106],
  LeftHand:      [-0.08242, -0.62617, 0.04113, 0.77422],
  LeftHandThumb1:[0.05193, -0.05082, 0.41560, 0.90664],
  LeftHandThumb2:[-0.15216, 0.06123, -0.10614, 0.98073],
  LeftHandThumb3:[-0.14161, -0.07168, 0.10016, 0.98223],
  LeftHandIndex1: [-0.00842, 0.00472, 0.13951, 0.99017],
  LeftHandIndex2: [0.12320, 0.00005, -0.01259, 0.99230],
  LeftHandIndex3: [0.06496, -0.00008, -0.00652, 0.99787],
  LeftHandMiddle1:[0.16437, -0.02243, 0.08838, 0.98218],
  LeftHandMiddle2:[0.15588, 0.00002, -0.01619, 0.98764],
  LeftHandMiddle3:[0.14648, 0.00022, -0.01513, 0.98910],
  LeftHandRing1:  [0.22640, -0.00323, -0.04795, 0.97285],
  LeftHandRing2:  [0.26199, 0.00006, -0.02692, 0.96470],
  LeftHandRing3:  [0.23680, -0.00027, -0.02425, 0.97126],
  LeftHandPinky1: [0.31858, 0.00607, -0.09483, 0.94312],
  LeftHandPinky2: [0.14451, 0.00012, -0.01464, 0.98940],
  LeftHandPinky3: [0.24796, -0.00022, -0.02534, 0.96844],
};

// Speaking 姿势 = Side 姿势 + Side 手势（手势覆盖同名骨骼）
const SPEAKING_POSE: Record<string, readonly [number, number, number, number]> = {
  ...SIDE_POSE,
  ...SIDE_GESTURE,
};

// Thinking 姿势 = Side 身体 + 歪头 + 右手扶下巴（oneknee 手臂数据）+ 左臂自然下垂
const THINKING_POSE: Record<string, readonly [number, number, number, number]> = {
  // --- 身体：沿用 Side ---
  Hips:            SIDE_POSE.Hips,
  Spine:           SIDE_POSE.Spine,
  Spine1:          SIDE_POSE.Spine1,
  Spine2:          SIDE_POSE.Spine2,
  // --- 头部：微微侧倾（只动 Neck/Head，不动整身）---
  Neck:            [0.01024, 0.00449, 0.05003, 0.99869],
  Head:            [0.02000, -0.01500, -0.00030, 0.99969],
  // --- 左臂：自然下垂 ---
  LeftShoulder:    [0.43102, 0.57295, -0.51993, 0.46435],
  LeftArm:         [0.62954, 0.03404, -0.00069, 0.77622],
  LeftForeArm:     [0.00041, -0.00362, 0.16474, 0.98633],
  // --- 右臂：扶下巴（站姿专用 Euler → Quaternion）---
  // 目标：右肩完全抬起 → 大臂前抬 → 小臂对折到脸侧 → 手掌贴下巴
  RightShoulder:   [0.71188, -0.32662, 0.28793, 0.55103],
  RightArm:        [0.55601, 0.11525, -0.33454, 0.75210],
  RightForeArm:    [0.04528, 0.08897, -0.88676, 0.45133],
  RightHand:       [0.47206, 0.11134, 0.00416, 0.87450],
  RightHandThumb1: [0.07845, 0.06622, -0.14941, 0.98343],
  RightHandThumb2: [-0.02355, -0.00009, 0.05998, 0.99792],
  RightHandThumb3: [0.00000, 0.00000, 0.00000, 1.00000],
  RightHandIndex1: [0.09284, -0.00332, 0.06242, 0.99372],
  RightHandIndex2: [0.22507, 0.00075, 0.00787, 0.97431],
  RightHandIndex3: [0.00000, 0.00000, 0.00000, 1.00000],
  RightHandMiddle1:[0.22079, 0.00307, 0.06574, 0.97310],
  RightHandMiddle2:[0.20016, 0.00106, -0.02019, 0.97956],
  RightHandMiddle3:[0.00000, 0.00000, 0.00000, 1.00000],
  RightHandRing1:  [0.26966, 0.01937, 0.06811, 0.96035],
  RightHandRing2:  [0.23785, -0.00125, -0.03273, 0.97075],
  RightHandRing3:  [0.00000, 0.00000, 0.00000, 1.00000],
  RightHandPinky1: [0.23171, 0.02880, 0.06477, 0.97020],
  RightHandPinky2: [0.32835, -0.00736, -0.07020, 0.94192],
  RightHandPinky3: [0.00000, 0.00000, 0.00000, 1.00000],
};

// 所有姿势骨骼名称（并集）
const POSE_BONE_NAMES = new Set([
  ...Object.keys(STRAIGHT_POSE),
  ...Object.keys(SPEAKING_POSE),
  ...Object.keys(THINKING_POSE),
]);

// ===== VRoid 全身像组件 =====
const VroidPortrait: React.FC<{
  mouthOpen: number;
  eyeBlink: number;
  headTurn: number;
  speaking: boolean;
  thinking: boolean;
}> = ({ mouthOpen, eyeBlink, headTurn, speaking, thinking }) => {
  const groupRef = useRef<THREE.Group>(null);
  const faceMeshesRef = useRef<THREE.Mesh[]>([]);
  const poseBonesRef = useRef<THREE.Bone[]>([]);
  const skeletonsRef = useRef<THREE.Skeleton[]>([]);
  const currentPoseRef = useRef<typeof STRAIGHT_POSE>(SIDE_POSE);
  const { scene } = useGLTF(MODEL_URL);

  // 当 speaking / thinking 变化时切换姿势目标
  useEffect(() => {
    currentPoseRef.current = thinking ? THINKING_POSE : speaking ? SPEAKING_POSE : SIDE_POSE;
  }, [speaking, thinking]);

  // 找面部 mesh + 收集全身姿势骨骼引用（只跑一次）
  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    const poseBones: THREE.Bone[] = [];
    const skeletons: THREE.Skeleton[] = [];

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && (child.morphTargetInfluences?.length ?? 0) >= 100) {
        meshes.push(child);
      }
      if (child instanceof THREE.Bone && POSE_BONE_NAMES.has(child.name)) {
        poseBones.push(child);
      }
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        if (!skeletons.includes(child.skeleton)) skeletons.push(child.skeleton);
      }
    });

    faceMeshesRef.current = meshes;
    poseBonesRef.current = poseBones;
    skeletonsRef.current = skeletons;

    console.log('[VRoid] faces:', meshes.length, 'pose bones:', poseBones.length, 'skeletons:', skeletons.length);
  }, [scene]);

  // Head turn（不旋转整个 group，只控制 yaw）
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = headTurn;
    }
  }, [headTurn]);

  // Per-frame: 面部动画 + 每帧强制骨骼姿势（简单粗暴但可靠）
  useFrame(() => {
    const meshes = faceMeshesRef.current;
    const t = Date.now() * 0.001;

    // === 骨骼姿势：每帧重设 quaternion → 更新 matrixWorld → 更新 skeleton ===
    const poseBones = poseBonesRef.current;
    const currentPose = currentPoseRef.current;
    if (poseBones.length > 0) {
      for (const bone of poseBones) {
        const target = currentPose[bone.name];
        if (target) {
          bone.quaternion.set(target[0], target[1], target[2], target[3]);
          bone.updateMatrixWorld();
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
      // 说话时嘴巴全开 + 元音变形
      infl[MORPH.jawOpen] = i;
      (['mouthA', 'mouthI', 'mouthU', 'mouthE', 'mouthO'] as const).forEach((k, j) => {
        infl[MORPH[k]] = i * vw[j] * 0.85;
      });
      infl[MORPH.mouthSmileLeft] = i * 0.08;
      infl[MORPH.mouthSmileRight] = i * 0.08;
      infl[MORPH.eyeBlinkLeft] = eyeBlink;
      infl[MORPH.eyeBlinkRight] = eyeBlink;

      // 🤔 思考表情（覆盖唇部 + 眉眼的 morph）
      if (thinking) {
        for (const [idx, val] of MORPH_THINK) {
          infl[idx] = val;
        }
      }
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
    <mesh ref={ringRef} rotation={[0, 0, Math.PI * 0.1]} position={[0, 1.2, 0]}>
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
    <mesh ref={glowRef} position={[0, 1.2, 0]}>
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
    // 上半身像：聚焦头部 + 胸部（模型原点在脚底，头顶约 y=1.4）
    camera.position.set(0, 1.25, 2.4);
    camera.lookAt(0, 1.2, 0);
  }, [camera]);

  // 说话嘴部动画：模拟真人说话的节奏（快开慢合 + 随机力度变化）
  useEffect(() => {
    if (speaking) {
      let frame = 0;
      let phase = Math.random() * Math.PI * 2;
      const interval = setInterval(() => {
        frame++;
        // 多频叠加制造自然感，phase 让每句话起始位置不同
        const t = frame * 0.12 + phase;
        // 主波 + 高频抖动模拟音节
        const raw = Math.sin(t * 3.1) * 0.55 + Math.sin(t * 7.7) * 0.25 + Math.sin(t * 14.1) * 0.15;
        // abs 取正 → 基础张嘴 + 随机力度
        const intensity = 0.7 + Math.sin(frame * 0.3) * 0.3; // 力度在 0.4~1.0 间慢速变化
        const val = Math.abs(raw) * intensity + 0.15;
        setMouthOpen(Math.min(val, 1.0));
      }, 40); // 更快刷新 → 更平滑
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
  // 头部微微转动（idle 时缓慢左右看，thinking/speaking/listening 时停住）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!listening && !speaking && !thinking) {
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
          speaking={speaking}
          thinking={thinking}
        />
      </Suspense>
    </group>
  );
};

// ===== edge-tts-proxy TTS：微软 Edge 神经语音（来自 AI_GUIDE.md） =====
const EDGE_TTS_BASE = 'https://edge-tts-proxy.3312428491.workers.dev';
const TTS_MAX_CHARS = 2000; // AI_GUIDE: 单次上限 2000 字符

/** 分句（不超过 MAX_CHARS，优先在句末断） */
function splitForTts(text: string): string[] {
  if (text.length <= TTS_MAX_CHARS) return [text];
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[。！？.!?，,；;：:\n])/);
  let current = '';
  for (const s of sentences) {
    if (current.length + s.length > TTS_MAX_CHARS && current.length > 0) {
      chunks.push(current.trim());
      current = s;
    } else { current += s; }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

// ===== 主组件 =====
export const TalkingHeadAvatar = forwardRef<TalkingHeadHandle, TalkingHeadAvatarProps>(
  ({ speaking, listening, thinking, size = 300, onSpeakStart, onSpeakEnd }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mutedRef = useRef(false);
    const cancelRef = useRef(false);

    const isActiveSpeaking = speaking;

    // 停止：完全终止当前播放
    const stop = useCallback(() => {
      cancelRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load(); // 断开与 API 的网络连接
        audioRef.current = null;
      }
      onSpeakEnd?.();
    }, [onSpeakEnd]);

    // 静音/取消静音：pause / resume，姿势保持 speaking
    const setMuted = useCallback((muted: boolean) => {
      mutedRef.current = muted;
      const audio = audioRef.current;
      if (!audio) return;
      if (muted) {
        audio.pause();
      } else {
        audio.play().catch((e) => console.warn('[edge-tts] resume failed:', e));
      }
    }, []);

    // 说话：edge-tts-proxy 流式 TTS（来自 AI_GUIDE.md §3.1）
    const speak = useCallback((text: string) => {
      // 1. 先取消旧的
      stop();
      cancelRef.current = false;

      // 2. 清洗文本
      const cleanText = text
        .replace(/[*_~`#]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/\n{2,}/g, '。')
        .replace(/\n/g, '，');

      if (!cleanText.trim()) return;

      // 3. 选音色（中文 → 晓晓，英文 → Aria）
      const hasChinese = /[\u4e00-\u9fff]/.test(cleanText);
      const voice = hasChinese ? 'zh-CN-XiaoxiaoNeural' : 'en-US-AriaNeural';

      // 4. 分句播放
      const chunks = splitForTts(cleanText);
      const thisCancel = cancelRef;
      let currentIdx = 0;

      const playNext = () => {
        if (thisCancel.current || currentIdx >= chunks.length) {
          if (!thisCancel.current) {
            audioRef.current = null;
            onSpeakEnd?.();
          }
          return;
        }

        const params = new URLSearchParams({ text: chunks[currentIdx], voice });
        const url = `${EDGE_TTS_BASE}/tts?${params}`;
        console.log(`[edge-tts] chunk ${currentIdx + 1}/${chunks.length}: ${chunks[currentIdx].substring(0, 40)}...`);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplaying = () => {
          if (currentIdx === 0) onSpeakStart?.();
        };
        audio.onended = () => { currentIdx++; playNext(); };
        audio.onerror = (e) => {
          console.warn(`[edge-tts] chunk ${currentIdx} error:`, e);
          currentIdx++;
          playNext();
        };

        if (!mutedRef.current) {
          audio.play().catch((err) => {
            console.warn('[edge-tts] play failed:', err);
            currentIdx++;
            playNext();
          });
        }
      };

      playNext();
    }, [stop, onSpeakStart, onSpeakEnd]);

    useImperativeHandle(ref, () => ({ speak, stop, setMuted }), [speak, stop, setMuted]);

    // 页面卸载时清理
    useEffect(() => {
      return () => {
        cancelRef.current = true;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute('src');
        }
      };
    }, []);

    return (
      <div style={{ width: size, height: size, position: 'relative', cursor: 'default' }}>
        <Canvas
          camera={{ position: [0, 1.25, 2.4], fov: 35 }}
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
