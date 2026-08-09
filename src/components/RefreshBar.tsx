"use client";

interface Props {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: Date | null;
  count: number;
}

/**
 * The manual refresh control every display screen sits behind. Nothing is
 * pushed to these screens, so this is how staff pull in what has come in since
 * the page loaded — and the timestamp tells them how stale what they are
 * looking at actually is.
 */
export default function RefreshBar({ onRefresh, loading, lastUpdated, count }: Props) {
  return (
    <div className="refresh-bar">
      <button type="button" className="btn btn-gold" onClick={onRefresh} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>
      <span className="refresh-bar__meta">
        {count} {count === 1 ? "order" : "orders"}
        {lastUpdated && ` · updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
      </span>
    </div>
  );
}
