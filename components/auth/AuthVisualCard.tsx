import { SnapFormIcon } from '@/components/Logo';
import ThermodynamicGrid from '@/components/ui/interactive-thermodynamic-grid';

export default function AuthVisualCard() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-[#070709] shadow-2xl">
      <ThermodynamicGrid resolution={18} coolingFactor={0.965} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / 4%) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 4%) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-black/90 shadow-2xl">
          <div className="absolute -inset-8 rounded-full bg-orange-600/30 blur-3xl" />
          <SnapFormIcon className="relative h-12 w-8 text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.5)]" fill="#ffffff" />
        </div>
      </div>
    </div>
  );
}
