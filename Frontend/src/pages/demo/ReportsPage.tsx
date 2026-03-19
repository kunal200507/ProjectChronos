import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

const weeklyData = Array.from({ length: 10 }, (_, i) => ({
  week: `W${i + 1}`,
  cardiac: Math.floor(10 + Math.random() * 30),
  septic: Math.floor(5 + Math.random() * 25),
}));

const alarmData = [
  { label: "G880", old: 1630, new: 1630, base: 715 },
  { label: "New Alerts", old: 800, new: 400, base: 200 },
  { label: "P1%", old: 600, new: 300, base: 150 },
];

const perfTrend = Array.from({ length: 12 }, (_, i) => ({
  m: `M${i + 1}`,
  auroc: 0.90 + Math.sin(i / 5) * 0.02 + Math.random() * 0.005,
  precision: 0.62 + Math.cos(i / 4) * 0.05 + Math.random() * 0.01,
  recall: 0.74 + Math.sin(i / 6) * 0.04 + Math.random() * 0.01,
}));

const driftData = Array.from({ length: 8 }, (_, i) => ({
  w: `W${i + 1}`,
  drift: Math.max(0.02, Math.min(0.35, 0.08 + Math.sin(i / 2.2) * 0.06 + Math.random() * 0.03)),
}));

const reportFiles = [
  { name: "Monthly ICU Performance Review", period: "Mar 2026", type: "PDF", size: "1.2 MB" },
  { name: "Alert Volume & False Alarm Audit", period: "Mar 2026", type: "CSV", size: "420 KB" },
  { name: "Model Drift & Calibration Report", period: "Feb 2026", type: "PDF", size: "860 KB" },
  { name: "Unit-wise Outcomes Summary", period: "Q1 2026", type: "PDF", size: "1.6 MB" },
];

const ReportsPage = () => {
  const [tab, setTab] = useState<"Event Statistics" | "Performance Review">("Event Statistics");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Reports</h1>

      <div className="flex gap-2 mb-6">
        {(["Event Statistics", "Performance Review"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Event Statistics" ? (
        <>
          {/* Event Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { title: "Cardiac Arrest", count: 49, unit: "cases", risk: "6 High Risk", pct: 49, color: "text-destructive" },
              { title: "Septic Shock", count: 37, unit: "High Risk", risk: "8 High Risk", pct: 37, color: "text-warning" },
              { title: "Hemodynamic Collapse", count: 65, unit: "E&S Risk", risk: "15 High Risk", pct: 15, color: "text-primary" },
            ].map((e) => (
              <div key={e.title} className="rounded-lg border bg-card p-5">
                <div className="text-sm font-semibold mb-1">{e.title}</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {e.count} <span className="text-sm font-normal text-muted-foreground">{e.unit}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">● {e.risk}</div>
                  </div>
                  <div className={`text-2xl font-bold ${e.color}`}>{e.pct}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Trend */}
          <div className="rounded-lg border bg-card p-5 mb-8">
            <div className="text-sm font-semibold mb-4">Weekly Event Trend</div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="cardiac" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%, 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="septic" stroke="hsl(200, 98%, 39%)" fill="hsl(200, 98%, 39%, 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-1">Accuracy</div>
              <div className="text-4xl font-bold">92%</div>
              <div className="text-xs text-muted-foreground">AUROC ≥ 0.928</div>
              <div className="mt-2 px-2 py-1 rounded bg-success/10 text-success text-xs font-semibold inline-block">Great</div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-1">False Alarm Reduction</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={alarmData}>
                    <Bar dataKey="old" fill="hsl(214, 32%, 91%)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="new" fill="hsl(200, 98%, 39%)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="base" fill="hsl(0, 84%, 60%)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-3">EHR Distribution</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>MICU</span><span className="font-semibold">51%</span></div>
                <div className="flex justify-between"><span>SICU</span><span className="font-semibold">26%</span></div>
                <div className="flex justify-between"><span>CCU</span><span className="font-semibold">16%</span></div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Performance Review KPIs */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-1">AUROC</div>
              <div className="text-4xl font-bold">0.93</div>
              <div className="text-xs text-muted-foreground">Rolling 90-day</div>
              <div className="mt-2 px-2 py-1 rounded bg-success/10 text-success text-xs font-semibold inline-block">Stable</div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-1">Precision</div>
              <div className="text-4xl font-bold">0.66</div>
              <div className="text-xs text-muted-foreground">High-risk alerts</div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-1">Recall</div>
              <div className="text-4xl font-bold">0.78</div>
              <div className="text-xs text-muted-foreground">High-risk events</div>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-1">Median Lead Time</div>
              <div className="text-4xl font-bold">2.4h</div>
              <div className="text-xs text-muted-foreground">Before onset</div>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-4">Performance Over Time</div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfTrend}>
                    <XAxis dataKey="m" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Area type="monotone" dataKey="auroc" stroke="hsl(200, 98%, 39%)" fill="hsl(200, 98%, 39%, 0.12)" strokeWidth={2} />
                    <Area type="monotone" dataKey="precision" stroke="hsl(262, 50%, 50%)" fill="hsl(262, 50%, 50%, 0.10)" strokeWidth={2} />
                    <Area type="monotone" dataKey="recall" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%, 0.08)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div><div className="font-bold text-lg">0.93</div><div className="text-muted-foreground">AUROC</div></div>
                <div><div className="font-bold text-lg">0.66</div><div className="text-muted-foreground">Precision</div></div>
                <div><div className="font-bold text-lg">0.78</div><div className="text-muted-foreground">Recall</div></div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-4">Model Drift (PSI)</div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={driftData}>
                    <XAxis dataKey="w" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Bar dataKey="drift" fill="hsl(48, 96%, 53%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                PSI &lt; 0.1 is typically stable. 0.1–0.25 = moderate shift. &gt; 0.25 = significant drift.
              </div>
            </div>
          </div>

          {/* Report Files + Unit Summary */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-3">Downloadable Reports</div>
              <div className="space-y-3">
                {reportFiles.map((f) => (
                  <div key={`${f.name}-${f.period}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.period} · {f.type} · {f.size}</div>
                    </div>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-md border hover:bg-secondary transition-colors">
                      Download
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                Note: these are mock downloads right now. We can wire them to real files/URLs when you have them.
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5">
              <div className="text-sm font-semibold mb-3">Unit-wise Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">MICU</span><span className="font-semibold">AUROC 0.94 · Alerts/day 18</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SICU</span><span className="font-semibold">AUROC 0.92 · Alerts/day 11</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CCU</span><span className="font-semibold">AUROC 0.91 · Alerts/day 7</span></div>
              </div>
              <div className="mt-4 text-sm font-semibold">Operational Notes</div>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li>• High-risk alerts increased +6% after threshold adjustment</li>
                <li>• False alarms reduced ~50% vs baseline rule-based alarms</li>
                <li>• Recommended: recalibration check for SICU (moderate drift)</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
