import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type SHAPEntry = {
  feature: string;
  value: number;
};

type SHAPChartProps = {
  shap: Record<string, number>;
};

const FEATURE_LABELS: Record<string, string> = {
  spo2: "SpO2",
  hr: "Heart Rate",
  map: "MAP",
  lactate: "Lactate",
  wbc: "WBC",
  temp: "Temperature",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: SHAPEntry }[] }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const sign = item.value > 0 ? "+" : "";
  return (
    <div className="rounded-md border bg-card px-3 py-2 shadow text-xs">
      <div className="font-semibold mb-0.5">{item.feature}</div>
      <div className={item.value > 0 ? "text-destructive" : "text-success"}>
        Impact: {sign}{item.value.toFixed(3)}
      </div>
    </div>
  );
};

const SHAPChart = ({ shap }: SHAPChartProps) => {
  const data: SHAPEntry[] = Object.entries(shap)
    .map(([k, v]) => ({ feature: FEATURE_LABELS[k] ?? k, value: v }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 0.01);
  const domain: [number, number] = [-maxAbs * 1.3, maxAbs * 1.3];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>← Reduces risk</span>
        <span className="font-semibold text-foreground">SHAP Feature Impact</span>
        <span>Increases risk →</span>
      </div>
      <ResponsiveContainer width="100%" height={data.length * 34 + 16}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 16, bottom: 0, left: 72 }}
        >
          <XAxis type="number" domain={domain} hide />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={68}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary))" }} />
          <ReferenceLine x={0} stroke="hsl(var(--border))" strokeWidth={1} />
          <Bar dataKey="value" radius={3} maxBarSize={16}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value > 0 ? "hsl(0, 84%, 60%)" : "hsl(142, 71%, 45%)"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-xs mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block bg-destructive/80" />
          Risk-increasing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "hsl(142, 71%, 45%)" }} />
          Risk-reducing
        </span>
      </div>
    </div>
  );
};

export default SHAPChart;
