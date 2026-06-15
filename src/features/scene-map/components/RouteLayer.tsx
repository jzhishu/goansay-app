import type { MapRoute, PositionPct } from "../../../types/content";

type ResolvePosition = (id: MapRoute["from"] | MapRoute["to"]) => PositionPct | undefined;

interface RouteLayerProps {
  routes: MapRoute[];
  resolvePos: ResolvePosition;
  selectedId?: string | null;
  vw: number;
  vh: number;
}

export function RouteLayer({ routes, resolvePos, selectedId, vw, vh }: RouteLayerProps) {
  const toXY = (position: PositionPct) => [(position.xPct / 100) * vw, (position.yPct / 100) * vh];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${vw} ${vh}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {routes.map((route, index) => {
        const from = resolvePos(route.from);
        const to = resolvePos(route.to);

        if (!from || !to) return null;

        const [x1, y1] = toXY(from);
        const [x2, y2] = toXY(to);
        const d = route.waypoints?.length
          ? (() => {
              const [wx, wy] = toXY(route.waypoints[0]);
              return `M ${x1} ${y1} Q ${wx} ${wy} ${x2} ${y2}`;
            })()
          : (() => {
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.07;
              return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
            })();
        const selected = selectedId && (route.from === selectedId || route.to === selectedId);
        const opacity = selected ? 0.34 : route.kind === "main" ? 0.2 : 0.12;

        return (
          <path
            key={`${route.from}-${route.to}-${index}`}
            d={d}
            fill="none"
            stroke={route.kind === "main" ? "#7d8470" : "#8d8d88"}
            strokeWidth={3.2}
            strokeDasharray="2 12"
            strokeLinecap="round"
            opacity={opacity}
            className="transition-opacity duration-200"
          />
        );
      })}
    </svg>
  );
}
