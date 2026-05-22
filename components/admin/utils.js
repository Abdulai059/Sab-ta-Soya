export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function timeAgoLabel(ts) {
  if (!ts) return null;
  const diff = Date.now() - new Date(ts);
  const d = Math.floor(diff / 864e5);
  const h = Math.floor(diff / 36e5);
  return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : "recently";
}

export function buildInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(ts, opts) {
  return new Date(ts).toLocaleDateString("en-GB", opts);
}
