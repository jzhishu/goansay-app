import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ASSETS } from "../../../content/assets";
import type { AssetKey, FitBoundsPct, PositionPct } from "../../../types/content";

interface PanZoomProps {
  children: ReactNode;
  aspect: string;
  backgroundAssetKey?: AssetKey;
  contentSize: {
    width: number;
    height: number;
  };
  focusPoints: PositionPct[];
  focusBounds?: FitBoundsPct;
  storageKey?: string;
  reservedRight?: number;
  reservedTop?: number;
  reservedLeft?: number;
  reservedBottom?: number;
}

interface TransformState {
  x: number;
  y: number;
  k: number;
}

interface CameraBounds {
  minScale: number;
  maxScale: number;
  initial: TransformState;
}

interface DragState {
  sx: number;
  sy: number;
  ox: number;
  oy: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const getStorageKey = (key: string) => `goansay.panZoom.${key}`;

const isTransformState = (value: unknown): value is TransformState => {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<TransformState>;
  return typeof maybe.x === "number" && typeof maybe.y === "number" && typeof maybe.k === "number";
};

const readStoredTransform = (key?: string): TransformState | null => {
  if (!key) return null;

  try {
    const raw = localStorage.getItem(getStorageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;

    return isTransformState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeStoredTransform = (key: string | undefined, transform: TransformState) => {
  if (!key) return;
  localStorage.setItem(getStorageKey(key), JSON.stringify(transform));
};

const getFocusBounds = (focusPoints: PositionPct[], contentSize: PanZoomProps["contentSize"], focusBounds?: FitBoundsPct) => {
  if (focusBounds) {
    return {
      minX: (focusBounds.minXPct / 100) * contentSize.width,
      maxX: (focusBounds.maxXPct / 100) * contentSize.width,
      minY: (focusBounds.minYPct / 100) * contentSize.height,
      maxY: (focusBounds.maxYPct / 100) * contentSize.height,
    };
  }

  const points = focusPoints.length ? focusPoints : [{ xPct: 50, yPct: 50 }];
  const xs = points.map((point) => (point.xPct / 100) * contentSize.width);
  const ys = points.map((point) => (point.yPct / 100) * contentSize.height);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

const calculateCamera = ({
  viewport,
  contentSize,
  focusPoints,
  focusBounds,
  reservedRight,
  reservedTop,
  reservedLeft,
  reservedBottom,
}: {
  viewport: { width: number; height: number };
  contentSize: PanZoomProps["contentSize"];
  focusPoints: PositionPct[];
  focusBounds?: FitBoundsPct;
  reservedRight: number;
  reservedTop: number;
  reservedLeft: number;
  reservedBottom: number;
}): CameraBounds => {
  const baseWidth = viewport.width * 0.92;
  const baseHeight = baseWidth * (contentSize.height / contentSize.width);
  const measuredFocusBounds = getFocusBounds(focusPoints, contentSize, focusBounds);
  const padding = focusBounds ? Math.max(18, Math.min(contentSize.width, contentSize.height) * 0.015) : Math.max(90, Math.min(contentSize.width, contentSize.height) * 0.08);
  const boundsWidth = Math.max(1, measuredFocusBounds.maxX - measuredFocusBounds.minX + padding * 2);
  const boundsHeight = Math.max(1, measuredFocusBounds.maxY - measuredFocusBounds.minY + padding * 2);
  const safeLeft = reservedLeft + 40;
  const safeRight = Math.max(safeLeft + 240, viewport.width - reservedRight - 40);
  const safeTop = reservedTop + 24;
  const safeBottom = Math.max(safeTop + 220, viewport.height - reservedBottom - 40);
  const safeWidth = Math.max(240, safeRight - safeLeft);
  const safeHeight = Math.max(220, safeBottom - safeTop);
  const safeCenterX = (safeLeft + safeRight) / 2;
  const safeCenterY = (safeTop + safeBottom) / 2;
  const viewportCenterX = viewport.width / 2;
  const viewportCenterY = viewport.height / 2;

  const fitScale = Math.min((safeWidth * contentSize.width) / (baseWidth * boundsWidth), (safeHeight * contentSize.height) / (baseHeight * boundsHeight));
  const minScale = clamp(fitScale * 0.72, 0.52, 1.1);
  const maxScale = clamp(fitScale * 1.9, 1.25, 2.6);
  const initialScale = clamp(fitScale, minScale, maxScale);
  const focusCenterX = (measuredFocusBounds.minX + measuredFocusBounds.maxX) / 2;
  const focusCenterY = (measuredFocusBounds.minY + measuredFocusBounds.maxY) / 2;
  const normalizedFocusX = focusCenterX / contentSize.width - 0.5;
  const normalizedFocusY = focusCenterY / contentSize.height - 0.5;

  return {
    minScale,
    maxScale,
    initial: {
      x: safeCenterX - viewportCenterX - normalizedFocusX * baseWidth * initialScale,
      y: safeCenterY - viewportCenterY - normalizedFocusY * baseHeight * initialScale,
      k: initialScale,
    },
  };
};

export function PanZoom({
  children,
  aspect,
  backgroundAssetKey,
  contentSize,
  focusPoints,
  focusBounds,
  storageKey,
  reservedRight = 392,
  reservedTop = 96,
  reservedLeft = 0,
  reservedBottom = 0,
}: PanZoomProps) {
  const [transform, setTransform] = useState<TransformState>({ x: 0, y: 0, k: 1 });
  const [cameraBounds, setCameraBounds] = useState<CameraBounds>({ minScale: 0.75, maxScale: 1.8, initial: { x: 0, y: 0, k: 1 } });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const didUserInteractRef = useRef(false);
  const didRestoreStoredRef = useRef(false);

  const resetCamera = useCallback(() => {
    didUserInteractRef.current = false;
    didRestoreStoredRef.current = true;
    setTransform(cameraBounds.initial);
    writeStoredTransform(storageKey, cameraBounds.initial);
  }, [cameraBounds.initial, storageKey]);

  const handleMouseDown = (event: React.MouseEvent) => {
    didUserInteractRef.current = true;
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
    writeStoredTransform(storageKey, transform);
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    didUserInteractRef.current = true;
    setTransform((current) => ({
      ...current,
      k: clamp(current.k - event.deltaY * 0.0012, cameraBounds.minScale, cameraBounds.maxScale),
    }));
  }, [cameraBounds.maxScale, cameraBounds.minScale]);

  useEffect(() => {
    if (didUserInteractRef.current) {
      writeStoredTransform(storageKey, transform);
    }
  }, [storageKey, transform]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const updateCamera = () => {
      const nextBounds = calculateCamera({
        viewport: { width: element.clientWidth, height: element.clientHeight },
        contentSize,
        focusPoints,
        focusBounds,
        reservedRight,
        reservedTop,
        reservedLeft,
        reservedBottom,
      });

      setCameraBounds(nextBounds);
      setTransform((current) => {
        if (!didRestoreStoredRef.current) {
          const stored = readStoredTransform(storageKey);
          didRestoreStoredRef.current = true;

          if (stored) {
            didUserInteractRef.current = true;
            return { ...stored, k: clamp(stored.k, nextBounds.minScale, nextBounds.maxScale) };
          }
        }

        return didUserInteractRef.current ? { ...current, k: clamp(current.k, nextBounds.minScale, nextBounds.maxScale) } : nextBounds.initial;
      });
    };

    updateCamera();

    const resizeObserver = new ResizeObserver(updateCamera);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [contentSize, focusBounds, focusPoints, reservedBottom, reservedLeft, reservedRight, reservedTop, storageKey]);

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
          onClick={() => {
            didUserInteractRef.current = true;
            setTransform((current) => {
              const next = { ...current, k: clamp(current.k + 0.15, cameraBounds.minScale, cameraBounds.maxScale) };
              writeStoredTransform(storageKey, next);
              return next;
            });
          }}
          className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/70 text-[15px] text-secondary backdrop-blur-[14px]"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            didUserInteractRef.current = true;
            setTransform((current) => {
              const next = { ...current, k: clamp(current.k - 0.15, cameraBounds.minScale, cameraBounds.maxScale) };
              writeStoredTransform(storageKey, next);
              return next;
            });
          }}
          className="h-9 w-9 rounded-[11px] border border-black/[0.06] bg-white/70 text-[15px] text-secondary backdrop-blur-[14px]"
        >
          -
        </button>
        <button
          type="button"
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
