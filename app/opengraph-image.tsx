import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SnapForm — React Form Compiler & Builder';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #000000 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 80%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            color: '#93c5fd',
            fontSize: 20,
            fontWeight: 600,
            marginBottom: '24px',
            letterSpacing: '0.04em',
          }}
        >
          ⚡ React Form Compiler & Headless Backend
        </div>

        {/* Brand Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            marginBottom: '18px',
            textAlign: 'center',
          }}
        >
          SnapForm
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '920px',
            lineHeight: 1.4,
            marginBottom: '36px',
          }}
        >
          Visual form compiler that outputs production-grade React components, type-safe Zod schemas, and serverless handlers.
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
          }}
        >
          {['Visual Builder', 'Zod Schema Export', 'Next.js & Tailwind', 'Spam Protection'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '8px 18px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#e4e4e7',
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
