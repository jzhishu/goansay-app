export type AssetKey =
  | "map_china"
  | "canvas_chengdu"
  | "marker_beijing"
  | "marker_chengdu"
  | "marker_dunhuang"
  | "marker_xian"
  | "marker_hangzhou"
  | "marker_dali"
  | "marker_xiamen"
  | "marker_tripprep"
  | "lm_teahouse"
  | "lm_panda"
  | "lm_hotpot"
  | "lm_opera"
  | "hero_beijing"
  | "hero_chengdu"
  | "hero_dunhuang"
  | "hero_xian"
  | "hero_hangzhou"
  | "hero_dali"
  | "hero_lm_teahouse"
  | "hero_lm_panda"
  | "hero_lm_hotpot"
  | "hero_lm_opera";

export type CityId =
  | "city_beijing"
  | "city_chengdu"
  | "city_dunhuang"
  | "city_xian"
  | "city_hangzhou"
  | "city_dali"
  | "city_xiamen";

export type LandmarkId =
  | "lm_chengdu_teahouse"
  | "lm_chengdu_panda"
  | "lm_chengdu_hotpot"
  | "lm_chengdu_opera";

export type KnowledgePointId =
  | "kp_teahouse_01"
  | "kp_teahouse_02"
  | "kp_teahouse_03"
  | "kp_teahouse_04"
  | "kp_panda_01"
  | "kp_panda_02"
  | "kp_panda_03"
  | "kp_hotpot_01"
  | "kp_hotpot_02"
  | "kp_hotpot_03"
  | "kp_hotpot_04"
  | "kp_hotpot_05"
  | "kp_opera_01"
  | "kp_opera_02"
  | "kp_opera_03"
  | "kp_opera_04";

export type Status = "available" | "inProgress" | "preview" | "completed" | "locked";
export type CityBaseStatus = "available" | "preview";
export type Mode = "guided" | "shadowing" | "immersion";
export type ModeStatus = "locked" | "available" | "inProgress" | "completed";
export type KnowledgePointStatus = "locked" | "available" | "inProgress" | "completed";

export interface PositionPct {
  xPct: number;
  yPct: number;
}

export interface ViewTransform {
  x: number;
  y: number;
  k: number;
}

export interface MapRoute {
  from: CityId | LandmarkId | "tripPrep";
  to: CityId | LandmarkId | "tripPrep";
  kind: "main" | "preview";
  waypoints?: PositionPct[];
}

export interface MapScene {
  id: "map_china";
  name: string;
  background: {
    image: AssetKey;
    width: number;
    height: number;
  };
  initialTransform: ViewTransform;
  tripPrep: {
    position: PositionPct;
    label: string;
  };
  cities: CityId[];
  routes: MapRoute[];
}

export interface PreviewChip {
  label: string;
  landmarkRef?: LandmarkId;
  image?: AssetKey;
}

export interface City {
  id: CityId;
  name: string;
  status: CityBaseStatus;
  mapPosition: PositionPct;
  markerImage: AssetKey;
  heroImage?: AssetKey;
  trailerCard: {
    promise: string;
    landmarkCount: number;
    estimatedMin: number;
    sceneTasks: {
      label: string;
      icon?: string;
      landmarkRef?: LandmarkId;
      image?: AssetKey;
    }[];
  };
  previewChips: PreviewChip[];
  canvas?: {
    background: AssetKey;
    width: number;
    height: number;
    initialTransform: ViewTransform;
    routes: MapRoute[];
  };
  landmarks: LandmarkId[];
}

export interface Landmark {
  id: LandmarkId;
  name: string;
  canvasPosition: PositionPct;
  unlockAfter: LandmarkId[];
  markerImage: AssetKey;
  heroImage: AssetKey;
  hero: {
    promise: string;
    meta: {
      conversations: number;
      phrases: number;
      estimatedMin: number;
    };
  };
  knowledgePoints: KnowledgePointId[];
}

export interface UserProgress {
  version: string;
  tripPrepCompleted: boolean;
  knowledgePoints: Partial<
    Record<
      KnowledgePointId,
      {
        status: KnowledgePointStatus;
        modes: Partial<Record<Mode, { status: ModeStatus }>>;
      }
    >
  >;
  readiness: {
    unlockedItems: string[];
  };
}
