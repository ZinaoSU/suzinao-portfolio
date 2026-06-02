import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import DigitalHuman from './DigitalHuman';

const DigitalHumanCanvas: React.FC = () => {
  return (
    <div className="w-40 h-40 md:w-48 md:h-48">
      <Canvas
        camera={{ position: [0, 0, 1.4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[3, 2, 3]}
            intensity={1.2}
            castShadow={false}
          />
          <directionalLight
            position={[-2, 1, -1]}
            intensity={0.4}
          />
          <pointLight
            position={[0, 1.5, 1]}
            intensity={0.5}
            color="#ffead4"
          />
          <DigitalHuman />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default DigitalHumanCanvas;
