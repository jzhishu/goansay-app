import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ASSETS } from "../../../content/assets";
import type { AssetKey } from "../../../types/content";

interface PanZoomProps {
  children: ReactNode;
  aspect: string;
  backgroundAssetKey?: AssetKey;
}

interface TransformState {
  x: number;
  y: number;
  k: number;
}

interface DragState {
  sx: number;
  sy: number;
  ox: number;
  oy: number;
}

export function PanZoom({ children, aspect, backgroundAssetKey }: PanZoomProps) {
  const [transform, setTransform] = useState<TransformState>({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (event: React.MouseEvent) => {
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
      k: Math.min(1.8, Math.max(0.75, current.k - event.deltaY * 0.0012)),
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
      className={`absolute inset-0 overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
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
          onClick={() => setTransform((current) => ({ ...current, k: Math.min(1.8, current.k + 0.15) }))}
          className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/70 text-[15px] text-secondary backdrop-blur-[14px]"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setTransform((current) => ({ ...current, k: Math.max(0.75, current.k - 0.15) }))}
          className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/70 text-[15px] text-secondary backdrop-blur-[14px]"
        >
          -
        </button>
        <button
          type="button"
          onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
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
