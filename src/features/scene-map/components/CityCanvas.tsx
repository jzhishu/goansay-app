import { useState } from "react";
import { CITIES, LANDMARKS } from "../../../content/sceneMapContent";
import { getLandmarkStatus } from "../../progress/progressSelectors";
import type { CityId, LandmarkId, MapRoute } from "../../../types/content";
import { BackgroundImage } from "./AssetImage";
import { LandmarkCard } from "./LandmarkCard";
import { LandmarkMarker } from "./LandmarkMarker";
import { PanZoom } from "./PanZoom";
import { RouteLayer } from "./RouteLayer";

interface CityCanvasProps {
  cityId: CityId;
  onBack: () => void;
}

export function CityCanvas({ cityId, onBack }: CityCanvasProps) {
  const city = CITIES[cityId];
  const initialLandmark = city.landmarks.find((landmarkId) => getLandmarkStatus(landmarkId) === "inProgress") ?? city.landmarks[0];
  const [selected, setSelected] = useState<LandmarkId>(initialLandmark);

  if (!city.canvas) return null;

  const resolvePos = (id: MapRoute["from"] | MapRoute["to"]) => LANDMARKS[id as LandmarkId]?.canvasPosition;

  return (
    <div className="absolute inset-0 animate-lvlIn">
      <PanZoom aspect="2400 / 1350" backgroundAssetKey={city.canvas.background}>
        <BackgroundImage assetKey={city.canvas.background} />
        <RouteLayer routes={city.canvas.routes} resolvePos={resolvePos} selectedId={selected} vw={2400} vh={1350} />
        {city.landmarks.map((landmarkId) => (
          <LandmarkMarker
            key={landmarkId}
            landmark={LANDMARKS[landmarkId]}
            selected={selected === landmarkId}
            onSelect={setSelected}
          />
        ))}
      </PanZoom>

      <button
        type="button"
        onClick={onBack}
        className="absolute left-8 top-[108px] z-40 flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/75 px-[18px] py-2.5 font-sans text-[13.5px] text-secondary shadow-[0_4px_14px_rgba(0,0,0,0.05)] backdrop-blur-2xl"
      >
        ← China Map
      </button>

      <div className="absolute left-8 top-[158px] z-[39] rounded-xl border border-black/[0.06] bg-white/60 px-4 py-2 backdrop-blur-xl">
        <span className="font-serif text-[19px] text-ink">{city.name}</span>
        <span className="ml-2.5 text-xs text-tertiary">{city.landmarks.length} scenes</span>
      </div>

      <div className="absolute right-8 top-[110px] z-40">
        <LandmarkCard landmark={LANDMARKS[selected]} />
      </div>
    </div>
  );
}
