import { useState } from "react";
import { CITIES, MAP_SCENE } from "../../../content/sceneMapContent";
import type { CityId, MapRoute } from "../../../types/content";
import { BackgroundImage } from "./AssetImage";
import { CityMarker } from "./CityMarker";
import { PanZoom } from "./PanZoom";
import { RouteLayer } from "./RouteLayer";
import { TrailerCard } from "./TrailerCard";
import { TripPrepMarker } from "./TripPrepMarker";

interface Level1SceneMapProps {
  onEnterCity: (cityId: CityId) => void;
}

export function Level1SceneMap({ onEnterCity }: Level1SceneMapProps) {
  const [selected, setSelected] = useState<CityId>("city_chengdu");
  const resolvePos = (id: MapRoute["from"] | MapRoute["to"]) =>
    id === "tripPrep" ? MAP_SCENE.tripPrep.position : CITIES[id as CityId]?.mapPosition;
  const focusPoints = [MAP_SCENE.tripPrep.position, ...MAP_SCENE.cities.map((cityId) => CITIES[cityId].mapPosition)];

  return (
    <div className="absolute inset-0">
      <PanZoom
        aspect="2400 / 1500"
        backgroundAssetKey={MAP_SCENE.background.image}
        contentSize={{ width: MAP_SCENE.background.width, height: MAP_SCENE.background.height }}
        focusPoints={focusPoints}
        focusBounds={MAP_SCENE.initialViewBounds}
        storageKey="china-map"
        reservedRight={430}
        reservedTop={94}
      >
        <BackgroundImage assetKey={MAP_SCENE.background.image} />
        <RouteLayer routes={MAP_SCENE.routes} resolvePos={resolvePos} selectedId={selected} vw={2400} vh={1500} />
        <TripPrepMarker pos={MAP_SCENE.tripPrep.position} />
        {MAP_SCENE.cities.map((cityId) => (
          <CityMarker key={cityId} city={CITIES[cityId]} selected={selected === cityId} onSelect={setSelected} />
        ))}
      </PanZoom>

      <div className="absolute right-8 top-[110px] z-40">
        <TrailerCard city={CITIES[selected]} onEnter={() => onEnterCity(selected)} />
      </div>
    </div>
  );
}
