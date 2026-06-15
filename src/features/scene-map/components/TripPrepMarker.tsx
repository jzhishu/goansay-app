import type { PositionPct } from "../../../types/content";
import { MarkerImage } from "./AssetImage";
import { CheckBadge } from "./Icons";

export function TripPrepMarker({ pos }: { pos: PositionPct }) {
  return (
    <div
      className="absolute z-[9] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
    >
      <div className="relative">
        <MarkerImage assetKey="marker_tripprep" size={64} />
        <div className="absolute -right-1.5 -top-1.5">
          <CheckBadge size={22} />
        </div>
      </div>
      <div className="mt-2 rounded-xl border border-black/[0.05] bg-white/80 px-[13px] py-[7px] text-center shadow-[0_4px_14px_rgba(0,0,0,0.05)] backdrop-blur-xl">
        <div className="font-serif text-[13.5px] font-medium text-ink">Trip Prep</div>
        <div className="mt-0.5 text-[10.5px] text-[#8a7a55]">Completed</div>
      </div>
    </div>
  );
}
