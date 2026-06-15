import { useState } from "react";
import { CITIES } from "../content/sceneMapContent";
import { CityCanvas } from "../features/scene-map/components/CityCanvas";
import { Level1SceneMap } from "../features/scene-map/components/Level1SceneMap";
import type { CityId } from "../types/content";
import { Header } from "./Header";

type AppView = { level: 1; cityId: null } | { level: 2; cityId: CityId };

export function App() {
  const [view, setView] = useState<AppView>({ level: 1, cityId: null });

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-page font-sans text-ink">
      <Header level={view.level} cityName={view.cityId ? CITIES[view.cityId].name : ""} />
      {view.level === 1 ? (
        <Level1SceneMap onEnterCity={(cityId) => setView({ level: 2, cityId })} />
      ) : (
        <CityCanvas cityId={view.cityId} onBack={() => setView({ level: 1, cityId: null })} />
      )}
    </div>
  );
}
