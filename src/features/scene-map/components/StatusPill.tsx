import type { Status } from "../../../types/content";

const STATUS_COPY: Record<Status, string> = {
  available: "Available",
  inProgress: "In progress",
  preview: "Preview available",
  completed: "Completed",
  locked: "Locked",
};

const STATUS_CLASS: Record<Status, string> = {
  available: "bg-sage/10 text-olive",
  inProgress: "bg-[#b89b68]/10 text-[#8a6f42]",
  preview: "bg-black/[0.04] text-secondary",
  completed: "bg-success/20 text-[#8a7a55]",
  locked: "bg-black/[0.04] text-tertiary",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.2px] ${STATUS_CLASS[status]}`}
    >
      {STATUS_COPY[status]}
    </span>
  );
}

export { STATUS_COPY };
