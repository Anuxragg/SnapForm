export default function HomeShaderBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 z-0 h-[1250px] pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 92% 82% at 50% 64%, rgba(255, 79, 25, 0.72) 0%, rgba(191, 48, 16, 0.42) 46%, rgba(80, 27, 16, 0.14) 78%, transparent 100%),
          radial-gradient(ellipse 54% 48% at 50% 64%, rgba(255, 145, 72, 0.2) 0%, transparent 100%)
        `,
        maskImage: 'linear-gradient(to bottom, black 0%, black 62%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 62%, transparent 100%)',
      }}
    />
  );
}
