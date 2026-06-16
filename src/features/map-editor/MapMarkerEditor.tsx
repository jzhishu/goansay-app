import { useEffect, useMemo, useRef, useState } from "react";
import { ASSETS } from "../../content/assets";
import { CITIES, LANDMARKS, MAP_SCENE } from "../../content/sceneMapContent";
import type { AssetKey, PositionPct, ViewTransform } from "../../types/content";

type EditorMode = "china" | "chengdu";

interface EditorGuide {
  id: "header" | "maker";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

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
  viewport: { width: number; height: number };
  initialTransform: ViewTransform;
  guides: EditorGuide[];
  markers: EditableMarker[];
}

type DragTarget =
  | { type: "camera"; sx: number; sy: number; origin: ViewTransform }
  | { type: "marker"; id: string }
  | null;

const STORAGE_KEY = "goansay.mapMarkerEditor.v2";
const VIEWPORT = { width: 1280, height: 720 };
const MIN_SCALE = 0.35;
const MAX_SCALE = 2.6;

const GUIDE_LAYOUTS: Record<EditorMode, EditorGuide[]> = {
  china: [
    { id: "header", label: "Header Placeholder", x: 36, y: 22, width: 1208, height: 58 },
    { id: "maker", label: "Maker Placeholder", x: 888, y: 110, width: 360, height: 580 },
  ],
  chengdu: [
    { id: "header", label: "Header Placeholder", x: 36, y: 22, width: 1208, height: 58 },
    { id: "maker", label: "Maker Placeholder", x: 898, y: 110, width: 350, height: 470 },
  ],
};

const roundPct = (value: number) => Math.round(value * 10) / 10;
const roundPx = (value: number) => Math.round(value * 10) / 10;
const roundScale = (value: number) => Math.round(value * 10000) / 10000;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sceneFromContent = (mode: EditorMode): EditorScene => {
  if (mode === "chengdu") {
    const city = CITIES.city_chengdu;

    return {
      mode,
      title: "Chengdu Canvas",
      background: city.canvas?.background ?? "canvas_chengdu",
      size: { width: city.canvas?.width ?? 2400, height: city.canvas?.height ?? 1350 },
      viewport: VIEWPORT,
      initialTransform: city.canvas?.initialTransform ?? { x: -200, y: 74, k: 1.0703 },
      guides: GUIDE_LAYOUTS.chengdu,
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

  return {
    mode,
    title: "China Map",
    background: MAP_SCENE.background.image,
    size: { width: MAP_SCENE.background.width, height: MAP_SCENE.background.height },
    viewport: VIEWPORT,
    initialTransform: MAP_SCENE.initialTransform,
    guides: GUIDE_LAYOUTS.china,
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

const getStageMetrics = (element: HTMLDivElement, scene: EditorScene) => {
  const rect = element.getBoundingClientRect();
  const viewportScale = rect.width / scene.viewport.width;
  const baseWidth = rect.width * 0.92;
  const baseHeight = baseWidth * (scene.size.height / scene.size.width);
  const displayX = scene.initialTransform.x * viewportScale;
  const displayY = scene.initialTransform.y * viewportScale;
  const centerX = rect.width / 2 + displayX;
  const centerY = rect.height / 2 + displayY;

  return { rect, viewportScale, baseWidth, baseHeight, centerX, centerY };
};

const pointToMarkerPosition = (event: React.PointerEvent, element: HTMLDivElement, scene: EditorScene): PositionPct => {
  const { rect, baseWidth, baseHeight, centerX, centerY } = getStageMetrics(element, scene);
  const localX = ((event.clientX - rect.left - centerX) / scene.initialTransform.k) + baseWidth / 2;
  const localY = ((event.clientY - rect.top - centerY) / scene.initialTransform.k) + baseHeight / 2;

  return {
    xPct: roundPct(clamp((localX / baseWidth) * 100, 0, 100)),
    yPct: roundPct(clamp((localY / baseHeight) * 100, 0, 100)),
  };
};

export function MapMarkerEditor() {
  const [mode, setMode] = useState<EditorMode>("china");
  const [draftScenes, setDraftScenes] = useState<Partial<Record<EditorMode, EditorScene>>>(() => loadDraftScenes());
  const [scene, setScene] = useState<EditorScene>(() => loadDraftScenes().china ?? sceneFromContent("china"));
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveDraftScenes(draftScenes);
  }, [draftScenes]);

  const output = useMemo(() => {
    if (scene.mode === "chengdu") {
      return {
        cityId: "city_chengdu",
        canvas: {
          initialTransform: scene.initialTransform,
        },
        landmarks: Object.fromEntries(scene.markers.map((marker) => [marker.id, { canvasPosition: marker.position }])),
      };
    }

    return {
      mapScene: {
        initialTransform: scene.initialTransform,
        tripPrep: { position: scene.markers.find((marker) => marker.id === "tripPrep")?.position },
      },
      cities: Object.fromEntries(scene.markers.filter((marker) => marker.id !== "tripPrep").map((marker) => [marker.id, { mapPosition: marker.position }])),
    };
  }, [scene]);

  const updateScene = (updater: (current: EditorScene) => EditorScene) => {
    setScene((current) => {
      const next = updater(current);
      setDraftScenes((drafts) => ({ ...drafts, [next.mode]: next }));
      return next;
    });
  };

  const switchMode = (nextMode: EditorMode) => {
    const nextDrafts = { ...draftScenes, [scene.mode]: scene };
    setDraftScenes(nextDrafts);
    setMode(nextMode);
    setScene(nextDrafts[nextMode] ?? sceneFromContent(nextMode));
    setDragTarget(null);
  };

  const resetCurrentScene = () => {
    const defaultScene = sceneFromContent(mode);
    setScene(defaultScene);
    setDraftScenes((drafts) => ({ ...drafts, [mode]: defaultScene }));
    setDragTarget(null);
  };

  const clearAllDrafts = () => {
    const defaultScene = sceneFromContent(mode);
    localStorage.removeItem(STORAGE_KEY);
    setDraftScenes({});
    setScene(defaultScene);
    setDragTarget(null);
  };

  const startCameraDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("[data-editor-stop-drag='true']")) return;
    event.preventDefault();
    setDragTarget({
      type: "camera",
      sx: event.clientX,
      sy: event.clientY,
      origin: scene.initialTransform,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const startMarkerDrag = (event: React.PointerEvent<HTMLButtonElement>, markerId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setDragTarget({ type: "marker", id: markerId });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragTarget || !stageRef.current) return;

    if (dragTarget.type === "camera") {
      const viewportScale = stageRef.current.getBoundingClientRect().width / scene.viewport.width;
      updateScene((current) => ({
        ...current,
        initialTransform: {
          ...current.initialTransform,
          x: roundPx(dragTarget.origin.x + (event.clientX - dragTarget.sx) / viewportScale),
          y: roundPx(dragTarget.origin.y + (event.clientY - dragTarget.sy) / viewportScale),
        },
      }));
      return;
    }

    const position = pointToMarkerPosition(event, stageRef.current, scene);
    updateScene((current) => ({
      ...current,
      markers: current.markers.map((marker) => (marker.id === dragTarget.id ? { ...marker, position } : marker)),
    }));
  };

  const stopDrag = () => {
    setDragTarget(null);
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2));
  };

  return (
    <div className="min-h-dvh bg-[#F8F8F5] font-sans text-ink lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden">
      <main className="flex min-w-0 flex-col p-4 sm:p-6 lg:min-h-0 lg:overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="m-0 font-serif text-[28px] font-medium">Map Marker Editor</h1>
            <p className="m-0 mt-1 text-sm text-secondary">
              Drag the map until it looks right under the header and maker placeholders, then fine-tune marker positions on top.
            </p>
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

        <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-[28px] border border-black/10 bg-white/60 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-6 lg:min-h-0">
          <div
            ref={stageRef}
            onPointerDown={startCameraDrag}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className="relative w-full max-w-[980px] overflow-hidden rounded-[26px] border border-black/10 bg-paper shadow-inner"
            style={{ aspectRatio: `${scene.viewport.width} / ${scene.viewport.height}` }}
          >
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-page">
              <img
                src={ASSETS[scene.background]}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full scale-[1.18] object-cover opacity-70 blur-md saturate-[0.95]"
              />
              <div className="absolute inset-0 bg-[#F8F8F5]/25" />
            </div>

            <div
              className="absolute left-1/2 top-1/2 z-10 w-[92%] transition-transform duration-150 ease-out"
              style={{
                aspectRatio: `${scene.size.width} / ${scene.size.height}`,
                left: `calc(50% + ${(scene.initialTransform.x / scene.viewport.width) * 100}%)`,
                top: `calc(50% + ${(scene.initialTransform.y / scene.viewport.height) * 100}%)`,
                transform: `translate(-50%, -50%) scale(${scene.initialTransform.k})`,
              }}
            >
              <div className="relative h-full w-full">
                <img src={ASSETS[scene.background]} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />

                {scene.markers.map((marker) => (
                  <button
                    key={marker.id}
                    type="button"
                    data-editor-stop-drag="true"
                    onPointerDown={(event) => startMarkerDrag(event, marker.id)}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col items-center gap-1 rounded-xl border border-black/10 bg-white/85 px-2 py-1 text-[11px] text-ink shadow-md backdrop-blur active:cursor-grabbing"
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

            <div className="pointer-events-none absolute inset-0 z-20">
              {scene.guides.map((guide) => (
                <div
                  key={guide.id}
                  className={`absolute rounded-[22px] border-2 border-dashed ${
                    guide.id === "header" ? "border-[#8A9574] bg-[#8A9574]/10" : "border-[#C49A74] bg-[#C49A74]/10"
                  }`}
                  style={{
                    left: `${(guide.x / scene.viewport.width) * 100}%`,
                    top: `${(guide.y / scene.viewport.height) * 100}%`,
                    width: `${(guide.width / scene.viewport.width) * 100}%`,
                    height: `${(guide.height / scene.viewport.height) * 100}%`,
                  }}
                >
                  <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-ink shadow-sm">
                    {guide.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-7 left-7 z-30 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  data-editor-stop-drag="true"
                  onClick={() =>
                    updateScene((current) => ({
                      ...current,
                      initialTransform: { ...current.initialTransform, k: roundScale(clamp(current.initialTransform.k + 0.15, MIN_SCALE, MAX_SCALE)) },
                    }))
                  }
                  className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/80 text-[15px] text-secondary backdrop-blur-[14px]"
                >
                  +
                </button>
                <button
                  type="button"
                  data-editor-stop-drag="true"
                  onClick={() =>
                    updateScene((current) => ({
                      ...current,
                      initialTransform: { ...current.initialTransform, k: roundScale(clamp(current.initialTransform.k - 0.15, MIN_SCALE, MAX_SCALE)) },
                    }))
                  }
                  className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/80 text-[15px] text-secondary backdrop-blur-[14px]"
                >
                  -
                </button>
                <button
                  type="button"
                  data-editor-stop-drag="true"
                  onClick={() => updateScene((current) => ({ ...current, initialTransform: sceneFromContent(current.mode).initialTransform }))}
                  className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/80 text-[15px] text-secondary backdrop-blur-[14px]"
                >
                  ◎
                </button>
              </div>
              <div className="rounded-full border border-black/[0.06] bg-white/75 px-4 py-[9px] text-[12.5px] text-secondary backdrop-blur-[14px]">
                Drag map in empty space. Drag markers directly. Header and maker are reference only.
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="flex min-h-0 flex-col border-t border-black/10 bg-white/75 p-4 backdrop-blur sm:p-5 lg:h-dvh lg:overflow-y-auto lg:border-l lg:border-t-0">
        <div>
          <h2 className="m-0 font-serif text-[22px] font-medium">{scene.title}</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            This editor now outputs the exact initial camera transform. Runtime pages read that config directly on every refresh.
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-black/[0.035] p-4 text-sm text-secondary">
          <div className="font-medium text-ink">Initial transform</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <span>x {roundPx(scene.initialTransform.x)}</span>
            <span>y {roundPx(scene.initialTransform.y)}</span>
            <span>k {roundScale(scene.initialTransform.k)}</span>
            <span>viewport {scene.viewport.width}×{scene.viewport.height}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-black/[0.035] p-4 text-sm text-secondary">
          <div className="font-medium text-ink">Reference overlays</div>
          <div className="mt-2 flex flex-col gap-2 text-xs">
            {scene.guides.map((guide) => (
              <span key={guide.id}>
                {guide.label}: {guide.width}×{guide.height} at {guide.x}, {guide.y}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 min-h-[240px] flex-1 overflow-auto rounded-2xl border border-black/10 bg-[#151512] p-4 lg:min-h-0">
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
