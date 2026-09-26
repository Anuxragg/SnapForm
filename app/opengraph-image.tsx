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
          background: 'linear-gradient(135deg, #09090b 0%, #121215 50%, #000000 100%)',
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
        {/* Background glow backdrops */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '360px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(168, 85, 247, 0.14) 50%, transparent 80%)',
            filter: 'blur(60px)',
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
            marginBottom: '28px',
            letterSpacing: '0.04em',
          }}
        >
          ⚡ React Form Compiler & Headless Backend
        </div>

        {/* Brand Logo & Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '22px',
            marginBottom: '20px',
          }}
        >
          {/* Logo Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              background: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <svg
              fill="none"
              viewBox="0 0 32 48"
              width="48"
              height="60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="#ffffff">
                <path d="m.599609 19.2002h9.59998v9.59999h-9.59998z" />
                <path
                  d="m31.4004 28.7998h9.6v9.59999h-9.6z"
                  transform="matrix(-1 0 -0 -1 62.8008 57.5996)"
                />
                <path
                  d="m10.1992 19.2001 11.6-9.6v9.6l-11.6 9.6z"
                  opacity="0.25"
                />
                <path
                  d="m21.7988 28.7999-11.6 9.6v-9.6l11.6-9.6z"
                  opacity="0.5"
                />
                <path
                  d="m.599609 19.2 21.199991-19.2v9.59999l-11.6 9.60001z"
                  opacity="0.65"
                />
                <path
                  d="m31.4004 28.8-21.2 19.2v-9.6l11.6-9.6z"
                  opacity="0.75"
                />
              </g>
            </svg>
          </div>

          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            SnapForm
          </div>
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
