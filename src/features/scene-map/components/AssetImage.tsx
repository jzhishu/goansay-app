import { ASSETS } from "../../../content/assets";
import type { AssetKey } from "../../../types/content";

interface MarkerImageProps {
  assetKey: AssetKey;
  size?: number;
  dim?: boolean;
}

export function MarkerImage({ assetKey, size = 76, dim = false }: MarkerImageProps) {
  return (
    <img
      src={ASSETS[assetKey]}
      alt=""
      draggable={false}
      className={`object-contain transition-all duration-200 ${dim ? "opacity-50 grayscale" : "opacity-100"}`}
      style={{
        width: size,
        height: size,
        filter: dim ? "grayscale(55%)" : "drop-shadow(0 6px 10px rgba(0,0,0,0.10))",
      }}
    />
  );
}

export function BackgroundImage({ assetKey }: { assetKey: AssetKey }) {
  return (
    <img
      src={ASSETS[assetKey]}
      alt=""
      draggable={false}
      className="map-canvas-image absolute inset-0 h-full w-full object-cover"
    />
  );
}

interface HeroImageProps {
  assetKey?: AssetKey;
  height?: number;
  radiusClass?: string;
}

export function HeroImage({ assetKey, height = 150, radiusClass = "rounded-t-[30px]" }: HeroImageProps) {
  if (!assetKey) {
    return <div className={`${radiusClass} block w-full shrink-0 bg-black/5`} style={{ height }} />;
  }

  return (
    <img
      src={ASSETS[assetKey]}
      alt=""
      draggable={false}
      className={`${radiusClass} block w-full shrink-0 object-cover`}
      style={{ height }}
    />
  );
}
