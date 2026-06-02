import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const DigitalHuman: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftEyelidRef = useRef<THREE.Mesh>(null);
  const rightEyelidRef = useRef<THREE.Mesh>(null);
  const upperLipRef = useRef<THREE.Mesh>(null);
  const lowerLipRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);

  const { size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const blinkTimer = useRef(Math.random() * 3 + 2);
  const blinkState = useRef(false);
  const talkTimer = useRef(0);
  const breathPhase = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / size.width) * 2 - 1;
      mouse.current.y = -(e.clientY / size.height) * 2 + 1;
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [size]);

  const skinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f5d5c8',
        roughness: 0.55,
        metalness: 0.05,
      }),
    []
  );

  const hairMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a2e',
        roughness: 0.4,
        metalness: 0.1,
      }),
    []
  );

  const eyeWhiteMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.1,
        metalness: 0,
      }),
    []
  );

  const pupilMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        roughness: 0.05,
        metalness: 0,
      }),
    []
  );

  const irisMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3d2b1f',
        roughness: 0.1,
        metalness: 0.1,
      }),
    []
  );

  const lipMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4857a',
        roughness: 0.3,
        metalness: 0,
      }),
    []
  );

  const eyelidMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f0c8b8',
        roughness: 0.5,
        metalness: 0,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Breathing animation
    breathPhase.current += delta * 1.2;
    const breathScale = 1 + Math.sin(breathPhase.current) * 0.008;
    groupRef.current.scale.setScalar(breathScale);

    // Idle sway
    groupRef.current.rotation.y =
      Math.sin(Date.now() * 0.0003) * 0.08 +
      mouse.current.x * 0.15;
    groupRef.current.rotation.x =
      Math.sin(Date.now() * 0.0005) * 0.03 +
      mouse.current.y * 0.08;

    // Blink
    blinkTimer.current -= delta;
    if (blinkTimer.current <= 0) {
      blinkState.current = !blinkState.current;
      if (!blinkState.current) {
        blinkTimer.current = Math.random() * 4 + 2;
      } else {
        blinkTimer.current = 0.12;
      }
    }

    const blinkProgress = blinkState.current
      ? Math.min(1, (0.12 - blinkTimer.current) / 0.06)
      : 1 - Math.min(1, blinkTimer.current / 0.06);

    // Eye lids
    if (leftEyelidRef.current) {
      leftEyelidRef.current.position.y =
        -0.24 + blinkProgress * 0.22;
    }
    if (rightEyelidRef.current) {
      rightEyelidRef.current.position.y =
        -0.24 + blinkProgress * 0.22;
    }

    // Talking animation (subtle, continuous)
    talkTimer.current += delta;
    const talkAmount =
      Math.sin(talkTimer.current * 2.5) * 0.025 +
      Math.sin(talkTimer.current * 5.3) * 0.01 +
      Math.sin(talkTimer.current * 0.7) * 0.015;

    if (upperLipRef.current) {
      upperLipRef.current.position.y = 0.885 + talkAmount;
    }
    if (lowerLipRef.current) {
      lowerLipRef.current.position.y = 0.835 - talkAmount;
    }

    // Pupils follow mouse (clamped)
    const pupilDX = Math.max(-0.025, Math.min(0.025, mouse.current.x * 0.03));
    const pupilDY = Math.max(-0.02, Math.min(0.02, mouse.current.y * 0.025));

    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.1 + pupilDX;
      leftPupilRef.current.position.y = 0.32 + pupilDY;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.1 + pupilDX;
      rightPupilRef.current.position.y = 0.32 + pupilDY;
    }

    // Eyebrow subtle movement
    if (leftEyebrowRef.current) {
      leftEyebrowRef.current.position.y = 0.46 + Math.sin(talkTimer.current * 3) * 0.005;
    }
    if (rightEyebrowRef.current) {
      rightEyebrowRef.current.position.y = 0.46 + Math.cos(talkTimer.current * 3.1) * 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Head */}
      <mesh ref={headRef} material={skinMaterial} position={[0, 0.5, 0]}>
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
      <mesh
        material={hairMaterial}
        position={[0, 0.65, -0.1]}
        scale={[1.05, 1.08, 1.02]}
      >
        <sphereGeometry args={[0.52, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
      </mesh>

      {/* Hair - left strands */}
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

      {/* Left Eye socket */}
      <mesh material={skinMaterial} position={[-0.12, 0.38, 0.48]}>
        <sphereGeometry args={[0.1, 16, 16]} />
      </mesh>

      {/* Right Eye socket */}
      <mesh material={skinMaterial} position={[0.12, 0.38, 0.48]}>
        <sphereGeometry args={[0.1, 16, 16]} />
      </mesh>

      {/* Left Eye white */}
      <mesh ref={leftEyeRef} material={eyeWhiteMaterial} position={[-0.12, 0.35, 0.51]}>
        <sphereGeometry args={[0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
      </mesh>

      {/* Right Eye white */}
      <mesh ref={rightEyeRef} material={eyeWhiteMaterial} position={[0.12, 0.35, 0.51]}>
        <sphereGeometry args={[0.065, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
      </mesh>

      {/* Left Iris */}
      <mesh material={irisMaterial} position={[-0.12, 0.345, 0.53]} scale={[1, 0.7, 1]}>
        <circleGeometry args={[0.038, 16]} />
      </mesh>

      {/* Right Iris */}
      <mesh material={irisMaterial} position={[0.12, 0.345, 0.53]} scale={[1, 0.7, 1]}>
        <circleGeometry args={[0.038, 16]} />
      </mesh>

      {/* Left Pupil */}
      <mesh ref={leftPupilRef} material={pupilMaterial} position={[-0.12, 0.32, 0.535]}>
        <circleGeometry args={[0.02, 12]} />
      </mesh>

      {/* Right Pupil */}
      <mesh ref={rightPupilRef} material={pupilMaterial} position={[0.12, 0.32, 0.535]}>
        <circleGeometry args={[0.02, 12]} />
      </mesh>

      {/* Left Eyelid */}
      <mesh
        ref={leftEyelidRef}
        material={eyelidMaterial}
        position={[-0.12, -0.24, 0.51]}
      >
        <sphereGeometry args={[0.068, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
      </mesh>

      {/* Right Eyelid */}
      <mesh
        ref={rightEyelidRef}
        material={eyelidMaterial}
        position={[0.12, -0.24, 0.51]}
      >
        <sphereGeometry args={[0.068, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
      </mesh>

      {/* Left Eyebrow */}
      <mesh
        ref={leftEyebrowRef}
        material={hairMaterial}
        position={[-0.13, 0.46, 0.5]}
        rotation={[0.15, 0, 0]}
      >
        <boxGeometry args={[0.14, 0.015, 0.03]} />
      </mesh>

      {/* Right Eyebrow */}
      <mesh
        ref={rightEyebrowRef}
        material={hairMaterial}
        position={[0.13, 0.46, 0.5]}
        rotation={[0.15, 0, 0]}
      >
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
      <mesh
        ref={upperLipRef}
        material={lipMaterial}
        position={[0, 0.885, 0.5]}
        rotation={[0.05, 0, 0]}
      >
        <boxGeometry args={[0.15, 0.025, 0.02]} />
      </mesh>

      {/* Lower lip */}
      <mesh
        ref={lowerLipRef}
        material={lipMaterial}
        position={[0, 0.835, 0.5]}
        rotation={[0.05, 0, 0]}
      >
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

export default DigitalHuman;
