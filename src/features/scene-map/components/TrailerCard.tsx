import { getCityDerivedStatus, getCityProgress } from "../../progress/progressSelectors";
import type { City } from "../../../types/content";
import { HeroImage } from "./AssetImage";
import { LockIcon } from "./Icons";
import { ProgressBar } from "./ProgressBar";
import { StatusPill } from "./StatusPill";

interface TrailerCardProps {
  city: City;
  onEnter: () => void;
}

export function TrailerCard({ city, onEnter }: TrailerCardProps) {
  const status = getCityDerivedStatus(city.id);
  const progress = getCityProgress(city.id);
  const trailer = city.trailerCard;
  const cta = {
    available: `Step into ${city.name}`,
    inProgress: `Continue ${city.name}`,
    preview: "Coming later",
    completed: `Review ${city.name}`,
    locked: "Locked",
  }[status];

  return (
    <div className="animate-cardIn flex max-h-[calc(100vh-140px)] w-[360px] flex-col overflow-y-auto rounded-[30px] border border-black/[0.06] bg-white/90 shadow-[0_16px_48px_rgba(0,0,0,0.09)] backdrop-blur-[20px]">
      <HeroImage assetKey={city.heroImage} height={150} />
      <div className="px-[26px] pb-6 pt-[22px]">
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-serif text-[30px] font-medium text-ink">{city.name}</h2>
          <StatusPill status={status} />
        </div>
        <p className="m-0 mt-3 text-sm leading-[1.55] text-secondary">{trailer.promise}</p>
        <div className="mt-4 flex gap-[18px] text-[12.5px] text-secondary">
          <span>◉ {trailer.landmarkCount} landmarks</span>
          <span>◷ ~{trailer.estimatedMin} min</span>
        </div>

        {status === "inProgress" ? (
          <div className="mt-3.5 flex items-center gap-3 rounded-[14px] bg-sage/10 px-3.5 py-2.5">
            <ProgressBar pct={progress} width={120} />
            <span className="text-xs text-olive">{Math.round(progress * 100)}% of this city</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={status === "preview" ? undefined : onEnter}
          disabled={status === "preview"}
          className="mt-[18px] w-full rounded-2xl border-0 bg-olive py-[15px] font-sans text-[15.5px] font-medium tracking-[0.2px] text-[#F6F5EF] transition-colors hover:bg-[#5d6350] disabled:cursor-default disabled:bg-black/[0.06] disabled:text-tertiary"
        >
          {cta} {status !== "preview" ? "→" : ""}
        </button>

        {trailer.sceneTasks.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2">
            {trailer.sceneTasks.map((task) => (
              <div
                key={task.label}
                className="flex items-center gap-3 rounded-[14px] border border-black/[0.04] bg-black/[0.025] px-[13px] py-2.5"
              >
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#EDEBE0] text-lg">
                  {task.icon}
                </div>
                <span className="flex-1 text-[13.5px] text-ink">{task.label}</span>
                <span className="text-tertiary">›</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-tertiary">
          <span className="mt-px">
            <LockIcon size={12} />
          </span>
          More cities unlock as your travel readiness grows. Keep exploring!
        </div>
      </div>
    </div>
  );
}
