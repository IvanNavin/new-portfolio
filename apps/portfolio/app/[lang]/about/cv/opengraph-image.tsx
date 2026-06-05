import { ImageResponse } from 'next/og';

// Pre-rendered at build time so social link unfurls (Slack, Telegram,
// Twitter/X, LinkedIn) get an instant image without a runtime function
// invocation. 1200×630 is the OG standard.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Ivan Holovko · Senior Frontend Engineer';

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background:
          'radial-gradient(circle at 30% 20%, #1e1b4b 0%, #020617 60%, #000 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Star-like accents */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          right: 120,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(253, 224, 71, 0.8)',
          boxShadow: '0 0 24px 4px rgba(253, 224, 71, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 200,
          right: 280,
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.7)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 140,
          right: 180,
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
        }}
      />

      <div
        style={{
          fontSize: 28,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(253, 224, 71, 0.85)',
          marginBottom: 24,
          display: 'flex',
        }}
      >
        Curriculum Vitae
      </div>
      <div
        style={{
          fontSize: 110,
          fontWeight: 700,
          lineHeight: 1,
          background:
            'linear-gradient(135deg, #fef9c3 0%, #fde047 50%, #f59e0b 100%)',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: 24,
          display: 'flex',
        }}
      >
        Ivan Holovko
      </div>
      <div
        style={{
          fontSize: 36,
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: 16,
          display: 'flex',
        }}
      >
        Senior Frontend Engineer
      </div>
      <div
        style={{
          fontSize: 22,
          color: 'rgba(255, 255, 255, 0.55)',
          display: 'flex',
          gap: 20,
        }}
      >
        <span>Next.js</span>
        <span>·</span>
        <span>React</span>
        <span>·</span>
        <span>TypeScript</span>
        <span>·</span>
        <span>Design Systems</span>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 80,
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.4)',
          display: 'flex',
        }}
      >
        holovko-ivan.vercel.app
      </div>
    </div>,
    size,
  );
}
