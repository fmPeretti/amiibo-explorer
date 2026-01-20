import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'transparent',
          paddingLeft: '4px',
        }}
      >
        {/* Right confetti - matching Header.tsx EXACTLY */}
        {/* Top row: items-end, gap-3px, mb-2px */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '3px',
            marginBottom: '2px',
          }}
        >
          {/* Orange with -mb-2px */}
          <div
            style={{
              width: '12px',
              height: '12px',
              background: '#f97316', // orange-500
              transform: 'rotate(-15deg)',
              marginBottom: '-2px',
            }}
          />
          {/* Emerald */}
          <div
            style={{
              width: '12px',
              height: '12px',
              background: '#10b981', // emerald-500
              transform: 'rotate(20deg)',
            }}
          />
        </div>

        {/* Bottom row: items-start, gap-3px */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '3px',
          }}
        >
          {/* Pink */}
          <div
            style={{
              width: '12px',
              height: '12px',
              background: '#ec4899', // pink-500
              transform: 'rotate(15deg)',
              marginTop: '-2px',
            }}
          />
          {/* Cyan */}
          <div
            style={{
              width: '12px',
              height: '12px',
              background: '#06b6d4', // cyan-500
              transform: 'rotate(-20deg)',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
