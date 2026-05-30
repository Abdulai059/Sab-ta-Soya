import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ResolutionGauge({ resolved, total }) {
  const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const data = [{ value: pct }, { value: 100 - pct }];

  return (
    <div className="flex flex-col items-center pt-4 pb-2">
      <div className="relative w-56 h-32">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={75}
              outerRadius={95}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#1D9E75" />
              <Cell fill="#F3F4F6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <p className="text-4xl font-semibold text-gray-800">{pct}%</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2">resolution rate</p>
    </div>
  );
}
