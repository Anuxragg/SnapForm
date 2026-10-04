export default function HomeShaderBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 z-0 h-[1250px] pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 100% 86% at 50% 64%, rgba(255, 79, 25, 0.8) 0%, rgba(191, 48, 16, 0.48) 46%, rgba(80, 27, 16, 0.16) 78%, transparent 100%),
          radial-gradient(ellipse 58% 52% at 50% 64%, rgba(255, 145, 72, 0.25) 0%, transparent 100%)
        `,
        maskImage: 'linear-gradient(to bottom, black 0%, black 62%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 62%, transparent 100%)',
      }}
    />
  );
}
