import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import type { VitalsSnapshot } from "@/data/patients";

type RiskTimelineChartProps = {
  history: VitalsSnapshot[];
  patientName: string;
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-card px-3 py-2 shadow text-xs space-y-0.5">
      <div className="font-semibold text-muted-foreground">T+{label}h</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-bold">{Math.round(p.value)}{p.dataKey === "spo2" ? "%" : p.dataKey === "score" ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
};

const RiskTimelineChart = ({ history, patientName }: RiskTimelineChartProps) => {
  return (
    <div className="space-y-3">
      {/* Risk Score Timeline */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Risk Score — {patientName}
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={75} stroke="hsl(0, 84%, 60%)" strokeDasharray="3 3" strokeWidth={1} label={{ value: "High", position: "right", fontSize: 9, fill: "hsl(0, 84%, 60%)" }} />
              <ReferenceLine y={40} stroke="hsl(48, 96%, 53%)" strokeDasharray="3 3" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(0, 84%, 60%)"
                fill="url(#riskGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HR + SpO2 Mini Charts */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "hr", label: "HR (bpm)", color: "hsl(0, 84%, 60%)", gradId: "hrGrad" },
          { key: "spo2", label: "SpO2 (%)", color: "hsl(200, 98%, 39%)", gradId: "spo2Grad" },
        ].map((v) => (
          <div key={v.key}>
            <div className="text-xs text-muted-foreground mb-1">{v.label}</div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 2, right: 2, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id={v.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={v.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={v.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide />
                  <XAxis dataKey="t" hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey={v.key} stroke={v.color} fill={`url(#${v.gradId})`} strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskTimelineChart;
