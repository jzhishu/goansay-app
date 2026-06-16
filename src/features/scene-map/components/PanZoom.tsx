import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ASSETS } from "../../../content/assets";
import type { AssetKey, ViewTransform } from "../../../types/content";

interface PanZoomProps {
  children: ReactNode;
  aspect: string;
  backgroundAssetKey?: AssetKey;
  initialTransform: ViewTransform;
}

interface DragState {
  sx: number;
  sy: number;
  ox: number;
  oy: number;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.6;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function PanZoom({ children, aspect, backgroundAssetKey, initialTransform }: PanZoomProps) {
  const [transform, setTransform] = useState<ViewTransform>(initialTransform);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTransform(initialTransform);
  }, [initialTransform]);

  const shouldIgnoreDragStart = (target: EventTarget | null) =>
    target instanceof Element ? Boolean(target.closest("[data-panzoom-stop-drag='true']")) : false;

  const resetCamera = useCallback(() => {
    setTransform(initialTransform);
  }, [initialTransform]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0 || shouldIgnoreDragStart(event.target)) return;
    dragRef.current = { sx: event.clientX, sy: event.clientY, ox: transform.x, oy: transform.y };
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragRef.current) return;
    const drag = dragRef.current;
    setTransform((current) => ({
      ...current,
      x: drag.ox + event.clientX - drag.sx,
      y: drag.oy + event.clientY - drag.sy,
    }));
  };

  const handleMouseUp = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    setTransform((current) => ({
      ...current,
      k: clamp(current.k - event.deltaY * 0.0012, MIN_SCALE, MAX_SCALE),
    }));
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <div
      ref={rootRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`absolute inset-0 isolate overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      {backgroundAssetKey ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-page">
          <img
            src={ASSETS[backgroundAssetKey]}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full scale-[1.18] object-cover opacity-70 blur-md saturate-[0.95]"
          />
          <div className="absolute inset-0 bg-[#F8F8F5]/25" />
        </div>
      ) : null}

      <div
        className={`absolute left-1/2 top-1/2 z-10 w-[92%] ${isDragging ? "" : "transition-transform duration-200 ease-out"}`}
        style={{
          aspectRatio: aspect,
          transform: `translate(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px)) scale(${transform.k})`,
        }}
      >
        {children}
      </div>

      <div className="absolute bottom-[110px] left-7 z-30 flex flex-col gap-1.5">
        <button
          type="button"
          data-panzoom-stop-drag="true"
          onClick={() => setTransform((current) => ({ ...current, k: clamp(current.k + 0.15, MIN_SCALE, MAX_SCALE) }))}
          className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/70 text-[15px] text-secondary backdrop-blur-[14px]"
        >
          +
        </button>
        <button
          type="button"
          data-panzoom-stop-drag="true"
          onClick={() => setTransform((current) => ({ ...current, k: clamp(current.k - 0.15, MIN_SCALE, MAX_SCALE) }))}
          className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/70 text-[15px] text-secondary backdrop-blur-[14px]"
        >
          -
        </button>
        <button
          type="button"
          data-panzoom-stop-drag="true"
          onClick={resetCamera}
          className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/70 text-[15px] text-secondary backdrop-blur-[14px]"
        >
          ◎
        </button>
      </div>

      <div className="absolute bottom-10 left-7 z-30 flex gap-2.5">
        {["✋ Drag to explore", "🖱 Scroll to zoom"].map((label) => (
          <div
            key={label}
            className="rounded-full border border-black/[0.06] bg-white/65 px-4 py-[9px] text-[12.5px] text-secondary backdrop-blur-[14px]"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
