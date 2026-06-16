import { LANDMARKS } from "../../../content/sceneMapContent";
import { kpDone, getLandmarkProgress, getLandmarkStatus } from "../../progress/progressSelectors";
import type { Landmark } from "../../../types/content";
import { HeroImage } from "./AssetImage";
import { LockIcon } from "./Icons";
import { ProgressBar } from "./ProgressBar";
import { StatusPill } from "./StatusPill";

export function LandmarkCard({ landmark }: { landmark: Landmark }) {
  const status = getLandmarkStatus(landmark.id);
  const progress = getLandmarkProgress(landmark.id);
  const kps = landmark.knowledgePoints;
  const done = kps.filter(kpDone).length;
  const locked = status === "locked";
  const dependency = landmark.unlockAfter.map((dependencyId) => LANDMARKS[dependencyId].name).join(", ");

  return (
    <div className="animate-cardIn w-[350px] overflow-hidden rounded-[30px] border border-black/[0.06] bg-white/90 shadow-[0_16px_48px_rgba(0,0,0,0.09)] backdrop-blur-[20px]">
      <HeroImage assetKey={landmark.heroImage} height={175} />
      <div className="px-6 pb-6 pt-5">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="m-0 font-serif text-[22px] font-medium leading-[1.2] text-ink">{landmark.name}</h3>
          <StatusPill status={status} />
        </div>
        <p className="m-0 mt-2.5 text-[13.5px] leading-[1.55] text-secondary">{landmark.hero.promise}</p>
        <div className="mt-3.5 flex gap-3.5 text-xs text-secondary">
          <span>💬 {landmark.hero.meta.conversations} conversations</span>
          <span>◷ ~{landmark.hero.meta.estimatedMin} min</span>
        </div>

        {status !== "locked" && kps.length > 0 ? (
          <div className="mt-3.5 flex items-center gap-3 rounded-[14px] bg-sage/10 px-3.5 py-[11px]">
            <ProgressBar pct={progress} width={110} />
            <span className="text-xs text-olive">
              {done} / {kps.length} conversations
            </span>
          </div>
        ) : null}

        {locked ? (
          <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-black/[0.03] px-4 py-[13px] text-[12.5px] text-secondary">
            <LockIcon size={13} /> Complete {dependency} to unlock this scene.
          </div>
        ) : (
          <button
            type="button"
            className="mt-4 w-full rounded-[15px] border-0 bg-olive py-3.5 font-sans text-[15px] font-medium text-[#F6F5EF] hover:bg-[#5d6350]"
            onClick={() => {
              window.alert(`→ Hero video: ${landmark.name}\n(进入 Level 3 学习流 - 由播放器模块承接)`);
            }}
          >
            {status === "inProgress" ? "Continue scene" : status === "completed" ? "Practice again" : "Step in"} →
          </button>
        )}
      </div>
    </div>
  );
}
