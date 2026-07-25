const STYLES = {
  PAID: "text-forest",
  UNPAID: "text-mustard",
  OVERDUE: "text-stamp",
  CANCELLED: "text-ink-soft",
};

export default function StatusStamp({ status }) {
  const colorClass = STYLES[status] || "text-ink-soft";
  return (
    <span
      className={`stamp inline-block px-3 py-0.5 font-display text-xs font-bold uppercase ${colorClass}`}
    >
      {status}
    </span>
  );
}
