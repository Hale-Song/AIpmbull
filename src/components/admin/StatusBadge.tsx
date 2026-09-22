interface StatusBadgeProps {
  status: "published" | "draft" | "pending" | "answered" | "featured" | string;
  label?: string;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-400",
  draft: "bg-amber-500/10 text-amber-400",
  pending: "bg-amber-500/10 text-amber-400",
  answered: "bg-emerald-500/10 text-emerald-400",
  featured: "bg-blue-500/10 text-blue-400",
};

const statusLabels: Record<string, Record<string, string>> = {
  published: { zh: "已发布", en: "Published" },
  draft: { zh: "草稿", en: "Draft" },
  pending: { zh: "待回复", en: "Pending" },
  answered: { zh: "已回复", en: "Answered" },
  featured: { zh: "精选", en: "Featured" },
};

export function StatusBadge({ status, label, onClick }: StatusBadgeProps) {
  const colors = statusColors[status] || "bg-slate-800 text-slate-400";
  const displayLabel = label || statusLabels[status]?.zh || status;

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80 ${colors}`}
      >
        {displayLabel}
      </button>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}>
      {displayLabel}
    </span>
  );
}
