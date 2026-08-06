import { ImageResponse } from 'next/og';
export const dynamic = 'force-static';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #58a6ff 0%, #1f52d0 100%)',
          borderRadius: 8,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 128 128" fill="none">
          <path
            d="m40 38 30 26-30 26"
            stroke="#fff"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M92 34v60" stroke="#fff" strokeWidth="11" strokeLinecap="round" opacity="0.65" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
