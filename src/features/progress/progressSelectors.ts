import { CITIES, LANDMARKS, PROGRESS, TOTAL_READINESS_ITEMS } from "../../content/sceneMapContent";
import type { CityId, KnowledgePointId, LandmarkId, Status } from "../../types/content";

export const kpDone = (kpId: KnowledgePointId): boolean => PROGRESS.knowledgePoints[kpId]?.status === "completed";

export const getLandmarkKps = (landmarkId: LandmarkId): KnowledgePointId[] => LANDMARKS[landmarkId]?.knowledgePoints ?? [];

export const getLandmarkProgress = (landmarkId: LandmarkId): number => {
  const kps = getLandmarkKps(landmarkId);
  return kps.length ? kps.filter(kpDone).length / kps.length : 0;
};

export const getLandmarkStarted = (landmarkId: LandmarkId): boolean =>
  getLandmarkKps(landmarkId).some((kpId) => Boolean(PROGRESS.knowledgePoints[kpId]));

export const getLandmarkStatus = (landmarkId: LandmarkId): Status => {
  const landmark = LANDMARKS[landmarkId];
  const progress = getLandmarkProgress(landmarkId);

  if (progress === 1) return "completed";
  if (getLandmarkStarted(landmarkId)) return "inProgress";

  const unlocked = landmark.unlockAfter.every((dependencyId) => getLandmarkProgress(dependencyId) === 1);
  return unlocked ? "available" : "locked";
};

export const getCityKps = (cityId: CityId): KnowledgePointId[] => CITIES[cityId].landmarks.flatMap(getLandmarkKps);

export const getCityProgress = (cityId: CityId): number => {
  const kps = getCityKps(cityId);
  return kps.length ? kps.filter(kpDone).length / kps.length : 0;
};

export const getCityDerivedStatus = (cityId: CityId): Status => {
  const city = CITIES[cityId];

  if (city.status === "preview") return "preview";

  const kps = getCityKps(cityId);
  if (kps.length && kps.every(kpDone)) return "completed";
  if (kps.some((kpId) => PROGRESS.knowledgePoints[kpId])) return "inProgress";
  return "available";
};

export const getTravelReadiness = (): number =>
  Math.round((PROGRESS.readiness.unlockedItems.length / TOTAL_READINESS_ITEMS) * 100);
