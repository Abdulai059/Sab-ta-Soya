import { Card, CardTitle } from "./DashboardCard";

export default function StatusSnapshot({ statusSnap }) {
  return (
    <Card>
      <CardTitle>Status snapshot</CardTitle>
      <div className="grid grid-cols-3 gap-2.5">
        {statusSnap.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 flex flex-col justify-between min-h-[90px]"
            style={{ background: s.bg }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: s.color }}
            >
              {s.label}
            </p>
            <div className="flex items-end justify-between mt-2">
              <p
                className="text-3xl font-medium leading-none"
                style={{ color: s.textColor }}
              >
                {s.count}
              </p>
              {s.icon && (
                <span className="text-lg opacity-40" style={{ color: s.color }}>
                  {s.icon}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
