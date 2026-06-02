import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { AvatarState } from './DigitalHuman';

// ===== 3D 头部组件 =====
const HeadMesh: React.FC<{ state: AvatarState }> = ({ state }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyelidRef = useRef<THREE.Mesh>(null);
  const rightEyelidRef = useRef<THREE.Mesh>(null);
  const upperLipRef = useRef<THREE.Mesh>(null);
  const lowerLipRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const leftEyeWhiteRef = useRef<THREE.Mesh>(null);
  const rightEyeWhiteRef = useRef<THREE.Mesh>(null);

  const blinkTimer = useRef(Math.random() * 3 + 2);
  const blinkState = useRef(false);
  const talkTimer = useRef(0);
  const breathPhase = useRef(Math.random() * Math.PI * 2);

  // Materials - 科技感偏紫灰肤色
  const skinMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2d1a3a', roughness: 0.45, metalness: 0.1 }),
    []
  );
  const hairMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1025', roughness: 0.3, metalness: 0.15 }),
    []
  );
  const eyeWhiteMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e9d5ff', roughness: 0.05, metalness: 0, emissive: '#c084fc', emissiveIntensity: 0.3 }),
    []
  );
  const pupilMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.02, metalness: 0 }),
    []
  );
  const irisMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#6b21a8', roughness: 0.05, metalness: 0.1, emissive: '#a855f7', emissiveIntensity: 0.4 }),
    []
  );
  const lipMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.25, metalness: 0, emissive: '#ec4899', emissiveIntensity: 0.3 }),
    []
  );
  const eyelidMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2a1835', roughness: 0.5, metalness: 0.05 }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // === 呼吸动画 ===
    breathPhase.current += delta * 1.0;
    const breathScale = 1 + Math.sin(breathPhase.current) * 0.006;
    groupRef.current.scale.setScalar(breathScale);

    // === 眨眼（非 listening 状态） ===
    if (state !== 'listening') {
      blinkTimer.current -= delta;
      if (blinkTimer.current <= 0) {
        blinkState.current = !blinkState.current;
        if (!blinkState.current) {
          blinkTimer.current = state === 'thinking' ? Math.random() * 5 + 3 : Math.random() * 4 + 2;
        } else {
          blinkTimer.current = 0.1;
        }
      }
    }

    const blinkProgress = blinkState.current
      ? Math.min(1, (0.1 - blinkTimer.current) / 0.05)
      : 1 - Math.min(1, blinkTimer.current / 0.05);

    // === 眼睛状态 ===
    let eyeScale = 1;
    if (state === 'thinking') eyeScale = 0.25;
    else if (state === 'speaking') eyeScale = 0.85;
    else if (state === 'listening') eyeScale = 1.15;

    const combinedEyeScale = eyeScale * (1 - blinkProgress * 0.9);

    if (leftEyeWhiteRef.current) leftEyeWhiteRef.current.scale.set(1, combinedEyeScale, 1);
    if (rightEyeWhiteRef.current) rightEyeWhiteRef.current.scale.set(1, combinedEyeScale, 1);

    // 眼皮
    if (leftEyelidRef.current) {
      leftEyelidRef.current.position.y = -0.24 + Math.min(blinkProgress, 0.95) * 0.22;
    }
    if (rightEyelidRef.current) {
      rightEyelidRef.current.position.y = -0.24 + Math.min(blinkProgress, 0.95) * 0.22;
    }

    // === 头部旋转 ===
    if (state === 'idle') {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0004) * 0.1;
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0006) * 0.03;
      groupRef.current.rotation.z = 0;
    } else if (state === 'listening') {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
      groupRef.current.rotation.x = 0.12; // 微抬头，专注
      groupRef.current.rotation.z = -0.04; // 微歪头
    } else if (state === 'speaking') {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.06;
      groupRef.current.rotation.x = 0.02;
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.0008) * 0.04;
    } else if (state === 'thinking') {
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0002) * 0.04;
      groupRef.current.rotation.x = -0.08; // 微低头
      groupRef.current.rotation.z = 0.05;
    }

    // === 嘴巴动画 ===
    talkTimer.current += delta;
    let mouthAmount = 0;

    if (state === 'speaking') {
      mouthAmount =
        Math.sin(talkTimer.current * 8.0) * 0.06 +
        Math.sin(talkTimer.current * 5.3) * 0.04 +
        Math.sin(talkTimer.current * 12.0) * 0.025 +
        Math.sin(talkTimer.current * 1.7) * 0.02;
    } else if (state === 'idle') {
      mouthAmount = Math.sin(talkTimer.current * 0.5) * 0.005;
    } else if (state === 'listening') {
      mouthAmount = Math.sin(talkTimer.current * 1.5) * 0.003; // 微微张
    } else if (state === 'thinking') {
      mouthAmount = -0.008; // 嘴微抿
    }

    if (upperLipRef.current) {
      upperLipRef.current.position.y = 0.885 + mouthAmount;
    }
    if (lowerLipRef.current) {
      lowerLipRef.current.position.y = 0.835 - mouthAmount;
    }

    // === 瞳孔缩放 ===
    let pupilScale = 1;
    if (state === 'listening') pupilScale = 1.35;
    else if (state === 'thinking') pupilScale = 0.6;

    if (leftPupilRef.current) leftPupilRef.current.scale.setScalar(pupilScale);
    if (rightPupilRef.current) rightPupilRef.current.scale.setScalar(pupilScale);

    // === 眉毛 ===
    let browY = 0.46;
    if (state === 'thinking') browY = 0.448; // 皱眉
    else if (state === 'listening') browY = 0.47; // 抬眉

    let browZ = 0.5;
    if (state === 'thinking') browZ = 0.49; // 眉毛压眼

    if (leftEyebrowRef.current) {
      leftEyebrowRef.current.position.y = browY + Math.sin(talkTimer.current * 2.5) * 0.003;
      leftEyebrowRef.current.position.z = browZ;
    }
    if (rightEyebrowRef.current) {
      rightEyebrowRef.current.position.y = browY + Math.cos(talkTimer.current * 2.6) * 0.003;
      rightEyebrowRef.current.position.z = browZ;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Head */}
      <mesh material={skinMaterial} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.55, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.85]} />
      </mesh>

      {/* Jaw extension */}
      <mesh material={skinMaterial} position={[0, 0.15, 0.05]}>
        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, Math.PI * 0.7, 0.3]} />
      </mesh>

      {/* Neck */}
      <mesh material={skinMaterial} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.35, 24]} />
      </mesh>

      {/* Hair - back */}
      <mesh material={hairMaterial} position={[0, 0.65, -0.1]} scale={[1.05, 1.08, 1.02]}>
        <sphereGeometry args={[0.52, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
      </mesh>

      {/* Hair - side strands */}
      <mesh material={hairMaterial} position={[-0.25, 0.35, -0.05]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.12, 0.7, 0.08]} />
      </mesh>
      <mesh material={hairMaterial} position={[0.25, 0.35, -0.05]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.12, 0.7, 0.08]} />
      </mesh>

      {/* Hair - front bangs */}
      <mesh material={hairMaterial} position={[0, 0.78, 0.35]}>
        <boxGeometry args={[0.55, 0.08, 0.15]} />
      </mesh>
      <mesh material={hairMaterial} position={[0, 0.72, 0.38]}>
        <boxGeometry args={[0.45, 0.06, 0.12]} />
      </mesh>

      {/* Eye sockets */}
      <mesh material={skinMaterial} position={[-0.12, 0.38, 0.48]}>
        <sphereGeometry args={[0.1, 16, 16]} />
      </mesh>
      <mesh material={skinMaterial} position={[0.12, 0.38, 0.48]}>
        <sphereGeometry args={[0.1, 16, 16]} />
      </mesh>

      {/* Eye whites */}
      <mesh ref={leftEyeWhiteRef} material={eyeWhiteMaterial} position={[-0.12, 0.35, 0.51]}>
        <sphereGeometry args={[0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
      </mesh>
      <mesh ref={rightEyeWhiteRef} material={eyeWhiteMaterial} position={[0.12, 0.35, 0.51]}>
        <sphereGeometry args={[0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
      </mesh>

      {/* Irises */}
      <mesh material={irisMaterial} position={[-0.12, 0.345, 0.53]} scale={[1, 0.7, 1]}>
        <circleGeometry args={[0.038, 16]} />
      </mesh>
      <mesh material={irisMaterial} position={[0.12, 0.345, 0.53]} scale={[1, 0.7, 1]}>
        <circleGeometry args={[0.038, 16]} />
      </mesh>

      {/* Pupils */}
      <mesh ref={leftPupilRef} material={pupilMaterial} position={[-0.12, 0.32, 0.535]}>
        <circleGeometry args={[0.02, 12]} />
      </mesh>
      <mesh ref={rightPupilRef} material={pupilMaterial} position={[0.12, 0.32, 0.535]}>
        <circleGeometry args={[0.02, 12]} />
      </mesh>

      {/* Eyelids */}
      <mesh ref={leftEyelidRef} material={eyelidMaterial} position={[-0.12, -0.24, 0.51]}>
        <sphereGeometry args={[0.068, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
      </mesh>
      <mesh ref={rightEyelidRef} material={eyelidMaterial} position={[0.12, -0.24, 0.51]}>
        <sphereGeometry args={[0.068, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
      </mesh>

      {/* Eyebrows */}
      <mesh ref={leftEyebrowRef} material={hairMaterial} position={[-0.13, 0.46, 0.5]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.14, 0.015, 0.03]} />
      </mesh>
      <mesh ref={rightEyebrowRef} material={hairMaterial} position={[0.13, 0.46, 0.5]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.14, 0.015, 0.03]} />
      </mesh>

      {/* Nose */}
      <mesh material={skinMaterial} position={[0, 0.2, 0.55]}>
        <coneGeometry args={[0.04, 0.09, 8]} />
      </mesh>
      <mesh material={skinMaterial} position={[0, 0.22, 0.54]}>
        <sphereGeometry args={[0.028, 8, 8]} />
      </mesh>

      {/* Upper lip */}
      <mesh ref={upperLipRef} material={lipMaterial} position={[0, 0.885, 0.5]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.15, 0.025, 0.02]} />
      </mesh>

      {/* Lower lip */}
      <mesh ref={lowerLipRef} material={lipMaterial} position={[0, 0.835, 0.5]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.12, 0.025, 0.02]} />
      </mesh>

      {/* Ears */}
      <mesh material={skinMaterial} position={[-0.48, 0.35, 0.02]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.08, 12, 12] as any} scale={[0.4, 0.85, 0.3]} />
      </mesh>
      <mesh material={skinMaterial} position={[0.48, 0.35, 0.02]} rotation={[0, 0, 0.2]}>
        <sphereGeometry args={[0.08, 12, 12] as any} scale={[0.4, 0.85, 0.3]} />
      </mesh>
    </group>
  );
};

// ===== 状态光环 =====
const StateGlow: React.FC<{ state: AvatarState }> = ({ state }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ringRef.current) return;

    if (state === 'listening') {
      ringRef.current.rotation.z += delta * 0.8;
      const s = 1 + Math.sin(Date.now() * 0.003) * 0.06;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25;
      ringRef.current.visible = true;
    } else if (state === 'thinking') {
      ringRef.current.rotation.z += delta * 0.3;
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.12;
      ringRef.current.visible = true;
    } else if (state === 'speaking') {
      ringRef.current.rotation.z += delta * 1.5;
      const s = 1 + Math.sin(Date.now() * 0.006) * 0.04;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2;
      ringRef.current.visible = true;
    } else {
      ringRef.current.visible = false;
    }
  });

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: state === 'thinking' ? '#a855f7' : '#ec4899',
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      }),
    [state]
  );

  return (
    <mesh ref={ringRef} material={ringMaterial} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.62, 0.015, 16, 64]} />
    </mesh>
  );
};

// ===== Canvas 包装 =====
interface DigitalHuman3DProps {
  state: AvatarState;
  size?: number;
}

export const DigitalHuman3D: React.FC<DigitalHuman3DProps> = ({ state, size = 130 }) => {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 1.5], fov: 40 }}
      style={{ width: size, height: size }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 3, 3]} intensity={1.0} />
      <directionalLight position={[-2, 1, -1]} intensity={0.3} color="#c084fc" />
      <pointLight position={[0, 2, 1]} intensity={0.4} color="#ec4899" />

      <HeadMesh state={state} />
      <StateGlow state={state} />
    </Canvas>
  );
};

export default DigitalHuman3D;
