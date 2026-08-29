'use client';

import React, { useState, useEffect } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function HomeShaderBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#070709]">
      {/* Base ambiance to prevent any blank background while WebGL initializes */}
      <div
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 65% 55% at 15% 65%, rgba(255, 129, 10, 0.35) 0%, transparent 65%),
            radial-gradient(ellipse 45% 45% at 75% 25%, rgba(115, 191, 196, 0.12) 0%, transparent 60%)
          `,
        }}
      />

      {mounted && (
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
            animate="off"
            type="sphere"
            wireframe={false}
            shader="defaults"
            uTime={0}
            uSpeed={0}
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
            // View (camera) props
            cAzimuthAngle={270}
            cPolarAngle={180}
            cDistance={0.5}
            cameraZoom={15.1}
            // Effect props
            lightType="env"
            brightness={0.8}
            envPreset="city"
            grain="on"
            // Tool props
            toggleAxis={false}
            zoomOut={false}
            hoverState=""
            // Optional - if using transition features
            enableTransition={false}
          />
        </ShaderGradientCanvas>
      )}
    </div>
  );
}


