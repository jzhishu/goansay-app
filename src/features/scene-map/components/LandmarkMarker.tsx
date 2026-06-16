import { useState } from "react";
import { getLandmarkProgress, getLandmarkStatus } from "../../progress/progressSelectors";
import type { Landmark, LandmarkId } from "../../../types/content";
import { CheckBadge, LockIcon } from "./Icons";
import { MarkerImage } from "./AssetImage";
import { ProgressBar } from "./ProgressBar";
import { STATUS_COPY } from "./StatusPill";

interface LandmarkMarkerProps {
  landmark: Landmark;
  selected: boolean;
  onSelect: (landmarkId: LandmarkId) => void;
}

export function LandmarkMarker({ landmark, selected, onSelect }: LandmarkMarkerProps) {
  const [hover, setHover] = useState(false);
  const status = getLandmarkStatus(landmark.id);
  const progress = getLandmarkProgress(landmark.id);
  const dim = status === "locked";

  return (
    <div
      data-panzoom-stop-drag="true"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(landmark.id);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`absolute flex cursor-pointer flex-col items-center transition-transform duration-200 ease-out ${
        selected ? "z-20" : "z-10"
      }`}
      style={{
        left: `${landmark.canvasPosition.xPct}%`,
        top: `${landmark.canvasPosition.yPct}%`,
        transform: `translate(-50%, -50%) translateY(${hover || selected ? -3 : 0}px)`,
      }}
    >
      <div className="relative">
        <MarkerImage assetKey={landmark.markerImage} size={selected ? 78 : 68} dim={dim} />
        {status === "completed" ? (
          <div className="absolute -right-1 -top-1">
            <CheckBadge />
          </div>
        ) : null}
        {selected ? (
          <div className="absolute -bottom-[7px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-[2.5px] border-white bg-sage" />
        ) : null}
      </div>
      <div
        className={`mt-[7px] max-w-[150px] rounded-[11px] border px-3 py-1.5 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl ${
          hover || selected ? "bg-white/90" : "bg-white/80"
        } ${selected ? "border-sage/30" : "border-black/[0.05]"}`}
      >
        <div className={`font-serif text-[13px] font-medium ${dim ? "text-tertiary" : "text-ink"}`}>{landmark.name}</div>
        <div
          className={`mt-0.5 flex items-center justify-center gap-1 text-[10px] ${
            status === "inProgress" ? "text-[#8a6f42]" : "text-tertiary"
          }`}
        >
          {status === "locked" ? <LockIcon size={10} /> : null}
          {STATUS_COPY[status]}
        </div>
        {status === "inProgress" ? (
          <div className="mt-1 flex justify-center">
            <ProgressBar pct={progress} width={56} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
