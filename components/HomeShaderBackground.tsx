'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ShaderGradientCanvas & ShaderGradient with SSR turned off
const ShaderGradientCanvas = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradientCanvas),
  { ssr: false }
);

const ShaderGradient = dynamic(
  () => import('@shadergradient/react').then((mod) => mod.ShaderGradient),
  { ssr: false }
);

export default function HomeShaderBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black opacity-100">
      <ShaderGradientCanvas
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        lazyLoad={undefined}
        fov={undefined}
        pixelDensity={1}
        pointerEvents="none"
      >
        <ShaderGradient
          animate="on"
          type="sphere"
          wireframe={false}
          shader="defaults"
          uTime={0}
          uSpeed={0.3}
          uStrength={0.3}
          uDensity={0.8}
          uFrequency={5.5}
          uAmplitude={3.2}
          positionX={-0.1}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={130}
          rotationZ={70}
          color1="#73bfc4"
          color2="#ff810a"
          color3="#8da0ce"
          reflection={0.4}
          cAzimuthAngle={270}
          cPolarAngle={180}
          cDistance={0.5}
          cameraZoom={15.1}
          lightType="env"
          brightness={0.8}
          envPreset="city"
          grain="on"
          toggleAxis={false}
          zoomOut={false}
          hoverState=""
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
