'use client';

import React, { useEffect, useState } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function HomeShaderBackground() {
  const [mounted, setMounted] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Reveal 3D WebGL canvas once shader compiled to prevent black canvas flash
    const raf = requestAnimationFrame(() => {
      setTimeout(() => setCanvasVisible(true), 250);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#070709]">
      {/* ─── 0ms Instant First-Paint Ambient Gradient (No Black Flash) ───── */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_70%_at_10%_15%,rgba(255,129,10,0.65),transparent_65%),radial-gradient(ellipse_65%_65%_at_85%_25%,rgba(115,191,196,0.45),transparent_60%),radial-gradient(ellipse_65%_55%_at_45%_85%,rgba(141,160,206,0.4),transparent_60%)]" />

      {/* Ambient Lighting Orbs */}
      <div className="absolute -top-12 -left-12 w-[600px] h-[600px] bg-[#ff810a]/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[#73bfc4]/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-[#8da0ce]/25 rounded-full blur-[140px] pointer-events-none" />

      {/* ─── Live 3D Shader Canvas (Seamless Cross-Fade Over Gradient) ───── */}
      {mounted && (
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
            canvasVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ShaderGradientCanvas
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            lazyLoad={false}
            fov={45}
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
      )}
    </div>
  );
}
