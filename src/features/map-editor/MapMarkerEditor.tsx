import { useEffect, useMemo, useRef, useState } from "react";
import { ASSETS } from "../../content/assets";
import { CITIES, LANDMARKS, MAP_SCENE } from "../../content/sceneMapContent";
import type { AssetKey, FitBoundsPct, PositionPct } from "../../types/content";

type EditorMode = "china" | "chengdu";

interface EditableMarker {
  id: string;
  label: string;
  position: PositionPct;
  image: AssetKey;
}

interface EditorScene {
  mode: EditorMode;
  title: string;
  background: AssetKey;
  size: { width: number; height: number };
  fitBounds: FitBoundsPct;
  markers: EditableMarker[];
}

type DragTarget =
  | { type: "marker"; id: string }
  | { type: "fit"; edge: "move" }
  | { type: "fit"; edge: "nw" | "ne" | "sw" | "se" }
  | null;

const roundPct = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const STORAGE_KEY = "goansay.mapMarkerEditor.v1";

const sceneFromContent = (mode: EditorMode): EditorScene => {
  if (mode === "chengdu") {
    const city = CITIES.city_chengdu;

    const fitBounds = city.canvas?.initialViewBounds ?? { minXPct: 20, minYPct: 18, maxXPct: 75, maxYPct: 82 };

    return {
      mode,
      title: "Chengdu Canvas",
      background: city.canvas?.background ?? "canvas_chengdu",
      size: { width: city.canvas?.width ?? 2400, height: city.canvas?.height ?? 1350 },
      fitBounds,
      markers: city.landmarks.map((landmarkId) => {
        const landmark = LANDMARKS[landmarkId];
        return {
          id: landmark.id,
          label: landmark.name,
          position: landmark.canvasPosition,
          image: landmark.markerImage,
        };
      }),
    };
  }

  const fitBounds = MAP_SCENE.initialViewBounds ?? { minXPct: 5, minYPct: 18, maxXPct: 64, maxYPct: 82 };

  return {
    mode,
    title: "China Map",
    background: MAP_SCENE.background.image,
    size: { width: MAP_SCENE.background.width, height: MAP_SCENE.background.height },
    fitBounds,
    markers: [
      {
        id: "tripPrep",
        label: "Trip Prep",
        position: MAP_SCENE.tripPrep.position,
        image: "marker_tripprep",
      },
      ...MAP_SCENE.cities.map((cityId) => {
        const city = CITIES[cityId];
        return {
          id: city.id,
          label: city.name,
          position: city.mapPosition,
          image: city.markerImage,
        };
      }),
    ],
  };
};

const loadDraftScenes = (): Partial<Record<EditorMode, EditorScene>> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    return JSON.parse(raw) as Partial<Record<EditorMode, EditorScene>>;
  } catch {
    return {};
  }
};

const saveDraftScenes = (scenes: Partial<Record<EditorMode, EditorScene>>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
};

const pointFromEvent = (event: React.PointerEvent, element: HTMLDivElement): PositionPct => {
  const rect = element.getBoundingClientRect();
  return {
    xPct: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
    yPct: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
  };
};

const moveFitBounds = (bounds: FitBoundsPct, delta: PositionPct): FitBoundsPct => {
  const width = bounds.maxXPct - bounds.minXPct;
  const height = bounds.maxYPct - bounds.minYPct;
  const minXPct = clamp(bounds.minXPct + delta.xPct, 0, 100 - width);
  const minYPct = clamp(bounds.minYPct + delta.yPct, 0, 100 - height);

  return {
    minXPct,
    minYPct,
    maxXPct: minXPct + width,
    maxYPct: minYPct + height,
  };
};

const updateFitBounds = (bounds: FitBoundsPct, point: PositionPct, edge: "nw" | "ne" | "sw" | "se"): FitBoundsPct => {
  const next = { ...bounds };

  if (edge.includes("n")) next.minYPct = clamp(point.yPct, 0, bounds.maxYPct - 8);
  if (edge.includes("s")) next.maxYPct = clamp(point.yPct, bounds.minYPct + 8, 100);
  if (edge.includes("w")) next.minXPct = clamp(point.xPct, 0, bounds.maxXPct - 8);
  if (edge.includes("e")) next.maxXPct = clamp(point.xPct, bounds.minXPct + 8, 100);

  return next;
};

export function MapMarkerEditor() {
  const [mode, setMode] = useState<EditorMode>("china");
  const [draftScenes, setDraftScenes] = useState<Partial<Record<EditorMode, EditorScene>>>(() => loadDraftScenes());
  const [scene, setScene] = useState<EditorScene>(() => loadDraftScenes().china ?? sceneFromContent("china"));
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const lastPointRef = useRef<PositionPct | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveDraftScenes(draftScenes);
  }, [draftScenes]);

  const output = useMemo(() => {
    if (scene.mode === "chengdu") {
      return {
        cityId: "city_chengdu",
        canvas: {
          initialViewBounds: scene.fitBounds,
        },
        landmarks: Object.fromEntries(scene.markers.map((marker) => [marker.id, { canvasPosition: marker.position }])),
      };
    }

    return {
      mapScene: {
        initialViewBounds: scene.fitBounds,
        tripPrep: { position: scene.markers.find((marker) => marker.id === "tripPrep")?.position },
      },
      cities: Object.fromEntries(scene.markers.filter((marker) => marker.id !== "tripPrep").map((marker) => [marker.id, { mapPosition: marker.position }])),
    };
  }, [scene]);

  const switchMode = (nextMode: EditorMode) => {
    const nextDrafts = { ...draftScenes, [scene.mode]: scene };
    setDraftScenes(nextDrafts);
    setMode(nextMode);
    setScene(nextDrafts[nextMode] ?? sceneFromContent(nextMode));
    setDragTarget(null);
    lastPointRef.current = null;
  };

  const updateScene = (updater: (current: EditorScene) => EditorScene) => {
    setScene((current) => {
      const next = updater(current);
      setDraftScenes((drafts) => ({ ...drafts, [next.mode]: next }));
      return next;
    });
  };

  const resetCurrentScene = () => {
    const defaultScene = sceneFromContent(mode);
    setScene(defaultScene);
    setDraftScenes((drafts) => ({ ...drafts, [mode]: defaultScene }));
    setDragTarget(null);
    lastPointRef.current = null;
  };

  const clearAllDrafts = () => {
    const defaultScene = sceneFromContent(mode);
    localStorage.removeItem(STORAGE_KEY);
    setDraftScenes({});
    setScene(defaultScene);
    setDragTarget(null);
    lastPointRef.current = null;
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragTarget || !stageRef.current) return;

    const point = pointFromEvent(event, stageRef.current);

    if (dragTarget.type === "marker") {
      updateScene((current) => ({
        ...current,
        markers: current.markers.map((marker) =>
          marker.id === dragTarget.id ? { ...marker, position: { xPct: roundPct(point.xPct), yPct: roundPct(point.yPct) } } : marker,
        ),
      }));
      return;
    }

    if (dragTarget.edge === "move") {
      const lastPoint = lastPointRef.current ?? point;
      const delta = { xPct: point.xPct - lastPoint.xPct, yPct: point.yPct - lastPoint.yPct };
      lastPointRef.current = point;
      updateScene((current) => ({ ...current, fitBounds: moveFitBounds(current.fitBounds, delta) }));
      return;
    }

    updateScene((current) => ({ ...current, fitBounds: updateFitBounds(current.fitBounds, point, dragTarget.edge) }));
  };

  const startDrag = (event: React.PointerEvent, target: DragTarget) => {
    event.preventDefault();
    event.stopPropagation();
    setDragTarget(target);
    if (stageRef.current) lastPointRef.current = pointFromEvent(event, stageRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const stopDrag = () => {
    setDragTarget(null);
    lastPointRef.current = null;
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2));
  };

  return (
    <div className="fixed inset-0 grid grid-cols-[1fr_360px] overflow-hidden bg-[#F8F8F5] font-sans text-ink">
      <main className="flex min-w-0 flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="m-0 font-serif text-[28px] font-medium">Map Marker Editor</h1>
            <p className="m-0 mt-1 text-sm text-secondary">Drag markers and adjust the fit region used by the initial camera.</p>
          </div>
          <div className="flex rounded-full border border-black/10 bg-white/70 p-1 shadow-sm">
            <button
              type="button"
              onClick={() => switchMode("china")}
              className={`rounded-full px-4 py-2 text-sm ${mode === "china" ? "bg-olive text-white" : "text-secondary"}`}
            >
              China map
            </button>
            <button
              type="button"
              onClick={() => switchMode("chengdu")}
              className={`rounded-full px-4 py-2 text-sm ${mode === "chengdu" ? "bg-olive text-white" : "text-secondary"}`}
            >
              Chengdu
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center rounded-[28px] border border-black/10 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div
            ref={stageRef}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className="relative w-full max-w-[1200px] overflow-hidden rounded-2xl border border-black/10 bg-paper shadow-inner"
            style={{ aspectRatio: `${scene.size.width} / ${scene.size.height}` }}
          >
            <img src={ASSETS[scene.background]} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />

            <div
              onPointerDown={(event) => startDrag(event, { type: "fit", edge: "move" })}
              className="absolute cursor-move border-2 border-dashed border-olive/80 bg-sage/10"
              style={{
                left: `${scene.fitBounds.minXPct}%`,
                top: `${scene.fitBounds.minYPct}%`,
                width: `${scene.fitBounds.maxXPct - scene.fitBounds.minXPct}%`,
                height: `${scene.fitBounds.maxYPct - scene.fitBounds.minYPct}%`,
              }}
            >
              <div className="absolute left-2 top-2 rounded-full bg-olive px-2 py-1 text-[11px] font-medium text-white">Initial fit region</div>
              {(["nw", "ne", "sw", "se"] as const).map((edge) => (
                <button
                  key={edge}
                  type="button"
                  onPointerDown={(event) => startDrag(event, { type: "fit", edge })}
                  className={`absolute h-4 w-4 rounded-full border-2 border-white bg-olive shadow ${
                    edge === "nw" ? "-left-2 -top-2 cursor-nwse-resize" : ""
                  } ${edge === "ne" ? "-right-2 -top-2 cursor-nesw-resize" : ""} ${edge === "sw" ? "-bottom-2 -left-2 cursor-nesw-resize" : ""} ${
                    edge === "se" ? "-bottom-2 -right-2 cursor-nwse-resize" : ""
                  }`}
                />
              ))}
            </div>

            {scene.markers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                onPointerDown={(event) => startDrag(event, { type: "marker", id: marker.id })}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col items-center gap-1 rounded-xl border border-black/10 bg-white/80 px-2 py-1 text-[11px] text-ink shadow-md backdrop-blur active:cursor-grabbing"
                style={{ left: `${marker.position.xPct}%`, top: `${marker.position.yPct}%` }}
              >
                <img src={ASSETS[marker.image]} alt="" draggable={false} className="h-10 w-10 object-contain drop-shadow" />
                <span className="whitespace-nowrap">{marker.label}</span>
                <span className="text-[10px] text-tertiary">
                  {roundPct(marker.position.xPct)}, {roundPct(marker.position.yPct)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <aside className="flex min-h-0 flex-col border-l border-black/10 bg-white/75 p-5 backdrop-blur">
        <div>
          <h2 className="m-0 font-serif text-[22px] font-medium">{scene.title}</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            The fit region is the camera target. It should include the important map area, not just marker centers, so the initial view can show the whole intended composition.
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-black/[0.035] p-4 text-sm text-secondary">
          <div className="font-medium text-ink">Fit bounds</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <span>minX {roundPct(scene.fitBounds.minXPct)}</span>
            <span>minY {roundPct(scene.fitBounds.minYPct)}</span>
            <span>maxX {roundPct(scene.fitBounds.maxXPct)}</span>
            <span>maxY {roundPct(scene.fitBounds.maxYPct)}</span>
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-auto rounded-2xl border border-black/10 bg-[#151512] p-4">
          <pre className="m-0 whitespace-pre-wrap break-words text-xs leading-5 text-[#EDEBE0]">{JSON.stringify(output, null, 2)}</pre>
        </div>

        <button type="button" onClick={copyOutput} className="mt-4 rounded-2xl bg-olive px-4 py-3 text-sm font-medium text-white">
          Copy JSON
        </button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={resetCurrentScene} className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-xs font-medium text-secondary">
            Reset current
          </button>
          <button type="button" onClick={clearAllDrafts} className="rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-xs font-medium text-secondary">
            Clear drafts
          </button>
        </div>
      </aside>
    </div>
  );
}
