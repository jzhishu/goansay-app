import { getCityDerivedStatus, getCityProgress } from "../../progress/progressSelectors";
import type { City, CityId } from "../../../types/content";
import { CheckBadge, LockIcon } from "./Icons";
import { MarkerImage } from "./AssetImage";
import { ProgressBar } from "./ProgressBar";
import { STATUS_COPY } from "./StatusPill";
import { useState } from "react";

interface CityMarkerProps {
  city: City;
  selected: boolean;
  onSelect: (cityId: CityId) => void;
}

export function CityMarker({ city, selected, onSelect }: CityMarkerProps) {
  const [hover, setHover] = useState(false);
  const status = getCityDerivedStatus(city.id);
  const dim = status === "preview";
  const progress = getCityProgress(city.id);

  return (
    <div
      data-panzoom-stop-drag="true"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(city.id);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`absolute flex cursor-pointer flex-col items-center transition-transform duration-200 ease-out ${
        selected ? "z-20" : status === "inProgress" ? "z-[14]" : "z-10"
      }`}
      style={{
        left: `${city.mapPosition.xPct}%`,
        top: `${city.mapPosition.yPct}%`,
        transform: `translate(-50%, -50%) translateY(${hover || selected ? -3 : 0}px)`,
      }}
    >
      <div className="relative">
        <MarkerImage assetKey={city.markerImage} size={selected ? 86 : 76} dim={dim} />
        {selected ? (
          <div className="absolute -bottom-[7px] left-1/2 h-[11px] w-[11px] -translate-x-1/2 rounded-full border-[2.5px] border-white bg-sage shadow-[0_1px_4px_rgba(0,0,0,0.15)]" />
        ) : null}
        {status === "completed" ? (
          <div className="absolute -right-1 -top-1">
            <CheckBadge />
          </div>
        ) : null}
      </div>

      <div
        className={`mt-2 min-w-[86px] rounded-xl border px-[13px] py-[7px] text-center shadow-[0_4px_14px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-200 ${
          hover || selected ? "bg-white/90" : "bg-white/80"
        } ${selected ? "border-sage/30" : "border-black/[0.05]"}`}
      >
        <div className="font-serif text-[14.5px] font-medium tracking-[0.2px] text-ink">{city.name}</div>
        <div
          className={`mt-[3px] flex items-center justify-center gap-1 text-[10.5px] ${
            status === "inProgress" ? "text-[#8a6f42]" : "text-tertiary"
          }`}
        >
          {status === "preview" ? <LockIcon /> : null}
          {STATUS_COPY[status]}
        </div>
        {status === "inProgress" ? (
          <div className="mt-[5px] flex justify-center">
            <ProgressBar pct={progress} />
          </div>
        ) : null}
      </div>

      {selected && city.previewChips ? (
        <div className="absolute left-[calc(100%+14px)] top-[-6px] flex w-max flex-col gap-1.5">
          {city.previewChips.slice(0, 3).map((chip, index) => (
            <div
              key={chip.label}
              className="animate-chipIn rounded-[11px] border border-white/50 bg-white/80 px-3 py-1.5 text-[11.5px] text-secondary shadow-[0_3px_10px_rgba(0,0,0,0.05)] backdrop-blur-xl"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              {chip.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
