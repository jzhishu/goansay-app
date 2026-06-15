export function LockIcon({ size = 11, color = "#AEAEB2" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="2.2" y="5" width="7.6" height="5.4" rx="1.4" stroke={color} strokeWidth="1.2" />
      <path d="M3.8 5 V3.6 a2.2 2.2 0 0 1 4.4 0 V5" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function CheckBadge({ size = 20 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-success shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M2.5 6.2 L5 8.6 L9.6 3.4"
          stroke="#fff"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function BrandGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <g fill="none" stroke="#6E7460" strokeWidth="1.8">
        <circle cx="9.5" cy="9.5" r="5.5" />
        <circle cx="16.5" cy="9.5" r="5.5" />
        <circle cx="9.5" cy="16.5" r="5.5" />
        <circle cx="16.5" cy="16.5" r="5.5" />
      </g>
    </svg>
  );
}
