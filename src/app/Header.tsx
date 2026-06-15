import { getTravelReadiness } from "../features/progress/progressSelectors";
import { BrandGlyph } from "../features/scene-map/components/Icons";
import { ProgressBar } from "../features/scene-map/components/ProgressBar";

interface HeaderProps {
  level: 1 | 2;
  cityName: string;
}

export function Header({ level, cityName }: HeaderProps) {
  const readiness = getTravelReadiness();

  return (
    <header className="absolute left-9 right-9 top-[22px] z-50 flex h-[58px] items-center gap-4 rounded-3xl border border-white/45 bg-white/70 px-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-[22px]">
      <BrandGlyph />
      <span className="font-serif text-[19px] font-medium tracking-[0.3px] text-olive">Go and Say</span>
      <div className="h-[22px] w-px bg-black/10" />
      <span className="text-sm text-secondary">{level === 1 ? "China Map" : cityName}</span>
      <div className="flex-1" />
      <span className="text-[13px] text-secondary">Travel readiness</span>
      <div className="w-[110px]">
        <ProgressBar pct={readiness / 100} width={110} />
      </div>
      <span className="text-[13.5px] font-medium text-ink">{readiness}%</span>
      <div className="h-[22px] w-px bg-black/10" />
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(140deg,#C9B89A,#9AA08F)] text-[13px] font-semibold text-white">
        A
      </div>
      <span className="text-[13.5px] text-ink">Alex Chen ▾</span>
    </header>
  );
}
