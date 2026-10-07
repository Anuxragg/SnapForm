import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ThermodynamicGridProps extends React.HTMLAttributes<HTMLDivElement> {
  resolution?: number;
  coolingFactor?: number;
}

const ThermodynamicGrid = ({
  className,
  resolution = 25,
  coolingFactor = 0.98,
  style,
  ...props
}: ThermodynamicGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !container || !ctx) return;

    const cellSize = Math.max(4, resolution);
    const cooling = Math.min(0.999, Math.max(0, coolingFactor));
    let grid = new Float32Array(0);
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let frameId = 0;
    let pointerInitialized = false;
    let needsHeatInjection = false;
    let pointerX = 0;
    let pointerY = 0;
    let previousX = 0;
    let previousY = 0;

    const scheduleFrame = () => {
      if (!frameId) frameId = window.requestAnimationFrame(renderFrame);
    };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);
      grid = new Float32Array(cols * rows);
      scheduleFrame();
    };

    const getThermalColor = (temperature: number) => {
      const red = Math.min(255, Math.max(0, temperature * 2.5 * 255 + 10));
      const green = Math.min(255, Math.max(0, (temperature * 2.5 - 1) * 255 + 10));
      const blue = Math.min(255, Math.max(0, (temperature * 2.5 - 2) * 255 + temperature * 50 + 15));
      return `rgb(${red}, ${green}, ${blue})`;
    };

    function renderFrame() {
      frameId = 0;
      if (!width || !height) return;

      if (needsHeatInjection) {
        const dx = pointerX - previousX;
        const dy = pointerY - previousY;
        const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (cellSize / 2)));

        for (let step = 0; step <= steps; step++) {
          const progress = step / steps;
          const col = Math.floor((previousX + dx * progress) / cellSize);
          const row = Math.floor((previousY + dy * progress) / cellSize);
          const radius = 2;

          for (let rowOffset = -radius; rowOffset <= radius; rowOffset++) {
            for (let colOffset = -radius; colOffset <= radius; colOffset++) {
              const distance = Math.hypot(colOffset, rowOffset);
              const targetCol = col + colOffset;
              const targetRow = row + rowOffset;
              if (distance > radius || targetCol < 0 || targetCol >= cols || targetRow < 0 || targetRow >= rows) continue;

              const index = targetCol + targetRow * cols;
              grid[index] = Math.min(1, grid[index] + 0.3 * (1 - distance / radius));
            }
          }
        }

        previousX = pointerX;
        previousY = pointerY;
        needsHeatInjection = false;
      }

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);
      let hasHeat = false;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = col + row * cols;
          const temperature = grid[index];
          grid[index] *= cooling;

          if (temperature > 0.05) {
            hasHeat = true;
            const size = cellSize * (0.8 + temperature * 0.5);
            const offset = (cellSize - size) / 2;
            ctx.fillStyle = getThermalColor(temperature);
            ctx.fillRect(col * cellSize + offset, row * cellSize + offset, size, size);
          } else if (col % 2 === 0 && row % 2 === 0) {
            ctx.fillStyle = '#18181b';
            ctx.fillRect(col * cellSize + cellSize / 2 - 1, row * cellSize + cellSize / 2 - 1, 2, 2);
          }
        }
      }

      if (needsHeatInjection || hasHeat) scheduleFrame();
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      needsHeatInjection = true;

      if (!pointerInitialized) {
        previousX = pointerX;
        previousY = pointerY;
        pointerInitialized = true;
      }

      scheduleFrame();
    };

    const handlePointerLeave = () => {
      pointerInitialized = false;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave);
    resize();

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [resolution, coolingFactor]);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 z-0 overflow-hidden bg-[#050505]', className)}
      style={style}
      aria-hidden="true"
      {...props}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};

export default ThermodynamicGrid;
