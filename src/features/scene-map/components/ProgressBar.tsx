interface ProgressBarProps {
  pct: number;
  width?: number;
}

export function ProgressBar({ pct, width = 64 }: ProgressBarProps) {
  return (
    <div className="h-[3.5px] overflow-hidden rounded-full bg-black/10" style={{ width }}>
      <div
        className="h-full rounded-full bg-sage transition-[width] duration-500"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}
