import type { City, CityId, Landmark, MapScene, UserProgress } from "../types/content";

export const MAP_SCENE: MapScene = {
  id: "map_china",
  name: "China Map",
  background: { image: "map_china", width: 2400, height: 1500 },
  initialTransform: {
    x: -141.66318240334093,
    y: 46.67898169991807,
    k: 0.9608928912404756,
  },
  tripPrep: { position: { xPct: 61, yPct: 64 }, label: "Trip Prep" },
  cities: [
    "city_dunhuang",
    "city_beijing",
    "city_xian",
    "city_chengdu",
    "city_hangzhou",
    "city_dali",
    "city_xiamen",
  ],
  routes: [
    { from: "tripPrep", to: "city_dunhuang", kind: "preview" },
    { from: "city_dunhuang", to: "city_beijing", kind: "preview", waypoints: [{ xPct: 44, yPct: 20 }] },
    { from: "city_beijing", to: "city_xian", kind: "main", waypoints: [{ xPct: 52, yPct: 40 }] },
    { from: "city_xian", to: "city_chengdu", kind: "main" },
    { from: "city_chengdu", to: "city_dali", kind: "preview" },
    { from: "city_xian", to: "city_hangzhou", kind: "preview", waypoints: [{ xPct: 52, yPct: 56 }] },
    { from: "city_hangzhou", to: "city_xiamen", kind: "preview", waypoints: [{ xPct: 58, yPct: 70 }] },
    { from: "city_chengdu", to: "city_xiamen", kind: "preview", waypoints: [{ xPct: 40, yPct: 80 }] },
  ],
};

export const CITIES: Record<CityId, City> = {
  city_beijing: {
    id: "city_beijing",
    name: "Beijing",
    status: "available",
    mapPosition: { xPct: 64.2, yPct: 33.5 },
    markerImage: "marker_beijing",
    heroImage: "hero_beijing",
    trailerCard: {
      promise: "Move through your first classic China day - tickets, directions, food, and casual small talk.",
      landmarkCount: 4,
      estimatedMin: 45,
      sceneTasks: [
        { label: "Ask for Temple tickets", icon: "🎫" },
        { label: "Order breakfast in a hutong", icon: "🥟" },
        { label: "Navigate rail arrival", icon: "🚄" },
      ],
    },
    previewChips: [{ label: "Temple of Heaven" }, { label: "Hutong Streets" }, { label: "Forbidden City" }],
    landmarks: [],
  },
  city_chengdu: {
    id: "city_chengdu",
    name: "Chengdu",
    status: "available",
    mapPosition: { xPct: 44.6, yPct: 59.7 },
    markerImage: "marker_chengdu",
    heroImage: "hero_chengdu",
    trailerCard: {
      promise: "Slow down the Chengdu way - tea in the park, hotpot with locals, pandas, and an opera night.",
      landmarkCount: 4,
      estimatedMin: 70,
      sceneTasks: [
        { label: "Ask for a seat in a teahouse", icon: "🍵", landmarkRef: "lm_chengdu_teahouse" },
        { label: "Order hotpot like a local", icon: "🍲", landmarkRef: "lm_chengdu_hotpot" },
        { label: "Visit the panda base", icon: "🐼", landmarkRef: "lm_chengdu_panda" },
      ],
    },
    previewChips: [
      { label: "People's Park", landmarkRef: "lm_chengdu_teahouse" },
      { label: "Hotpot Night", landmarkRef: "lm_chengdu_hotpot" },
      { label: "Panda Base", landmarkRef: "lm_chengdu_panda" },
    ],
    canvas: {
      background: "canvas_chengdu",
      width: 2400,
      height: 1350,
      initialTransform: {
        x: -200.00128113648157,
        y: 73.81078100674623,
        k: 1.0703165542293718,
      },
      routes: [
        { from: "lm_chengdu_teahouse", to: "lm_chengdu_hotpot", kind: "main" },
        { from: "lm_chengdu_hotpot", to: "lm_chengdu_opera", kind: "preview" },
        {
          from: "lm_chengdu_teahouse",
          to: "lm_chengdu_panda",
          kind: "preview",
          waypoints: [{ xPct: 50, yPct: 30 }],
        },
      ],
    },
    landmarks: ["lm_chengdu_teahouse", "lm_chengdu_panda", "lm_chengdu_hotpot", "lm_chengdu_opera"],
  },
  city_dunhuang: {
    id: "city_dunhuang",
    name: "Dunhuang",
    status: "preview",
    mapPosition: { xPct: 35.7, yPct: 32.6 },
    markerImage: "marker_dunhuang",
    heroImage: "hero_dunhuang",
    trailerCard: {
      promise: "Walk the Silk Road - caves, camels, and desert markets.",
      landmarkCount: 3,
      estimatedMin: 40,
      sceneTasks: [],
    },
    previewChips: [{ label: "Mogao Caves" }, { label: "Desert Camel Ride" }],
    landmarks: [],
  },
  city_xian: {
    id: "city_xian",
    name: "Xi'an",
    status: "preview",
    mapPosition: { xPct: 42, yPct: 47.5 },
    markerImage: "marker_xian",
    heroImage: "hero_xian",
    trailerCard: {
      promise: "Ancient capital days - warriors, city walls, and noodle streets.",
      landmarkCount: 3,
      estimatedMin: 40,
      sceneTasks: [],
    },
    previewChips: [{ label: "Terracotta Army" }, { label: "Muslim Quarter" }],
    landmarks: [],
  },
  city_hangzhou: {
    id: "city_hangzhou",
    name: "Hangzhou",
    status: "preview",
    mapPosition: { xPct: 69.8, yPct: 50.3 },
    markerImage: "marker_hangzhou",
    heroImage: "hero_hangzhou",
    trailerCard: {
      promise: "West Lake mornings - boats, tea hills, and lakeside walks.",
      landmarkCount: 3,
      estimatedMin: 40,
      sceneTasks: [],
    },
    previewChips: [{ label: "West Lake" }, { label: "Tea Plantation" }],
    landmarks: [],
  },
  city_dali: {
    id: "city_dali",
    name: "Dali",
    status: "preview",
    mapPosition: { xPct: 39.6, yPct: 72.6 },
    markerImage: "marker_dali",
    heroImage: "hero_dali",
    trailerCard: {
      promise: "Mountain-and-lake life - old town lanes and Bai culture.",
      landmarkCount: 3,
      estimatedMin: 40,
      sceneTasks: [],
    },
    previewChips: [{ label: "Three Pagodas" }, { label: "Old Town" }],
    landmarks: [],
  },
  city_xiamen: {
    id: "city_xiamen",
    name: "Xiamen",
    status: "preview",
    mapPosition: { xPct: 70.5, yPct: 66.2 },
    markerImage: "marker_xiamen",
    heroImage: "hero_hangzhou",
    trailerCard: {
      promise: "Island breezes - coffee streets, ferries, and seafood.",
      landmarkCount: 3,
      estimatedMin: 40,
      sceneTasks: [],
    },
    previewChips: [{ label: "Gulangyu Island" }, { label: "Shapowei" }],
    landmarks: [],
  },
};

export const LANDMARKS: Record<Landmark["id"], Landmark> = {
  lm_chengdu_teahouse: {
    id: "lm_chengdu_teahouse",
    name: "People's Park Teahouse",
    canvasPosition: { xPct: 34.8, yPct: 41.2 },
    unlockAfter: [],
    markerImage: "lm_teahouse",
    heroImage: "hero_lm_teahouse",
    hero: {
      promise: "Learn the tea ritual, ask for a seat, and enjoy a cup of tea - in Chinese.",
      meta: { conversations: 4, phrases: 16, estimatedMin: 18 },
    },
    knowledgePoints: ["kp_teahouse_01", "kp_teahouse_02", "kp_teahouse_03", "kp_teahouse_04"],
  },
  lm_chengdu_panda: {
    id: "lm_chengdu_panda",
    name: "Panda Base Morning",
    canvasPosition: { xPct: 68, yPct: 24 },
    unlockAfter: [],
    markerImage: "lm_panda",
    heroImage: "hero_lm_panda",
    hero: {
      promise: "Get tickets, find the nursery, and talk about pandas - in Chinese.",
      meta: { conversations: 3, phrases: 12, estimatedMin: 14 },
    },
    knowledgePoints: ["kp_panda_01", "kp_panda_02", "kp_panda_03"],
  },
  lm_chengdu_hotpot: {
    id: "lm_chengdu_hotpot",
    name: "Hotpot Night",
    canvasPosition: { xPct: 69.2, yPct: 75.8 },
    unlockAfter: ["lm_chengdu_teahouse"],
    markerImage: "lm_hotpot",
    heroImage: "hero_lm_hotpot",
    hero: {
      promise: "Choose your broth, order dishes, and survive the spice - in Chinese.",
      meta: { conversations: 5, phrases: 20, estimatedMin: 22 },
    },
    knowledgePoints: ["kp_hotpot_01", "kp_hotpot_02", "kp_hotpot_03", "kp_hotpot_04", "kp_hotpot_05"],
  },
  lm_chengdu_opera: {
    id: "lm_chengdu_opera",
    name: "Sichuan Opera Show",
    canvasPosition: { xPct: 51, yPct: 49.3 },
    unlockAfter: ["lm_chengdu_hotpot"],
    markerImage: "lm_opera",
    heroImage: "hero_lm_opera",
    hero: {
      promise: "Understand the ritual, ask for seats, and enjoy face-changing - in Chinese.",
      meta: { conversations: 4, phrases: 16, estimatedMin: 18 },
    },
    knowledgePoints: ["kp_opera_01", "kp_opera_02", "kp_opera_03", "kp_opera_04"],
  },
};

export const PROGRESS: UserProgress = {
  version: "0.2",
  tripPrepCompleted: true,
  knowledgePoints: {
    kp_teahouse_01: {
      status: "completed",
      modes: {
        guided: { status: "completed" },
        shadowing: { status: "completed" },
        immersion: { status: "completed" },
      },
    },
    kp_teahouse_02: {
      status: "inProgress",
      modes: {
        guided: { status: "completed" },
        shadowing: { status: "inProgress" },
        immersion: { status: "locked" },
      },
    },
  },
  readiness: {
    unlockedItems: [
      "I can greet people politely.",
      "I can ask where something is.",
      "I can pay with mobile apps.",
      "I can ask for a seat in a teahouse.",
    ],
  },
};

export const TOTAL_READINESS_ITEMS = 17;
