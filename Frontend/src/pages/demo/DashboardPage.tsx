import * as React from "react";
import { Activity, AlertTriangle, Users, RefreshCw, Zap, Play, Square } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

import { useSimulation } from "@/hooks/useSimulation";
import { scoreToRiskLevel } from "@/lib/risk";

type RiskLevel = "high" | "medium" | "low";

const riskColor = { high: "text-destructive", medium: "text-warning", low: "text-success" };
const riskBg = { high: "bg-destructive/10 border-destructive/30", medium: "bg-warning/10 border-warning/30", low: "bg-success/10 border-success/30" };
const riskRing = { high: "stroke-destructive", medium: "stroke-warning", low: "stroke-success" };

const RiskGauge = ({ value, level }: { value: number; level: RiskLevel }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
      <circle cx="30" cy="30" r={r} fill="none" strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className={riskRing[level]} transform="rotate(-90 30 30)" />
      <text x="30" y="34" textAnchor="middle" className={`text-xs font-bold fill-current ${riskColor[level]}`}>{value}</text>
    </svg>
  );
};

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const DashboardPage = () => {
  const navigate = useNavigate();
  const { active, patients, startSimulation, stopSimulation, simulateCrash } = useSimulation();
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [tick, setTick] = React.useState(0);

  // Track last updated time during simulation
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLastUpdated(new Date());
      setTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(id);
  }, [active]);

  const withLevel = patients.map((p) => {
    const score = active ? p._simScore : p.score;
    const hr = active ? p._simHr : p.hr;
    const spo2 = active ? p._simSpo2 : p.spo2;
    const map = active ? p._simMap : p.map;
    return { ...p, _score: score, _hr: hr, _spo2: spo2, _map: map, level: scoreToRiskLevel(score) };
  });

  const monitored = withLevel.filter((p) => p.level !== "low").sort((a, b) => b._score - a._score);
  const highAlerts = withLevel.filter((p) => p.level === "high");
  const allHighCount = withLevel.filter((p) => p.level === "high").length;

  const makeTrendData = (seed: number, pScore: number) =>
    Array.from({ length: 20 }, (_, i) => {
      const wobble = Math.sin((i + seed) / 3) * 12 + Math.cos((i + seed + tick) / 5) * 6;
      const hr = 75 + wobble + (seed % 7);
      const spo2 = 95 + Math.sin((i + seed) / 4) * 2.5 - (seed % 3) - (pScore > 75 ? 2 : 0);
      return { t: i, hr: Math.round(hr), spo2: Math.round(spo2) };
    });

  const goToPatient = (name: string) => {
    navigate(`/demo/patients?patient=${encodeURIComponent(slugify(name))}`);
  };

  const timeStr = lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold">ICU Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* Simulate ICU Crash */}
          <button
            type="button"
            onClick={simulateCrash}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Simulate ICU Crash
          </button>
          {/* Live Simulation Toggle */}
          <button
            type="button"
            onClick={active ? stopSimulation : startSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${active
              ? "bg-success/10 border border-success/40 text-success hover:bg-success/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
          >
            {active ? (
              <><Square className="w-3 h-3 fill-current" /> Stop Simulation</>
            ) : (
              <><Play className="w-3 h-3 fill-current" /> Start Simulation</>
            )}
          </button>
        </div>
      </div>

      {/* ICU Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: "Total Patients", value: patients.length, color: "text-primary" },
          { icon: AlertTriangle, label: "High Risk", value: allHighCount, color: "text-destructive" },
          { icon: Activity, label: "Active Alerts", value: patients.filter((p) => p.alertStatus === "active").length, color: "text-warning" },
          { icon: RefreshCw, label: "Last Updated", value: active ? timeStr : "Paused", color: "text-muted-foreground", small: true },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4 flex items-center gap-3">
            <div className={`rounded-md p-2 bg-secondary/50 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <div className={`font-bold text-lg leading-none ${stat.small ? "text-sm mt-0.5" : ""}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
            {stat.label === "Last Updated" && active && (
              <span className="ml-auto relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Patient Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {monitored.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToPatient(p.name)}
            className={`rounded-lg border p-4 bg-card ${riskBg[p.level]} text-left hover:brightness-[0.98] transition-all`}
            aria-label={`Open ${p.name} in Patients`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-sm">{p.name} <span className="text-muted-foreground font-normal">{p.age}</span></div>
                <div className="text-xs text-muted-foreground">{p.icuType} · Bed · {p.bed}</div>
                {active && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                    </span>
                    <span className="text-[10px] text-success font-medium">Live</span>
                  </div>
                )}
              </div>
              <RiskGauge value={p._score} level={p.level} />
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div><span className="font-semibold text-base">{p._hr}</span> <span className="text-muted-foreground">bpm</span></div>
              <div className="w-px h-4 bg-border" />
              <div><span className="font-semibold text-base">{p._spo2}%</span> <span className="text-muted-foreground">SpO2</span></div>
              <div className="w-px h-4 bg-border" />
              <div className={`font-semibold text-base ${riskColor[p.level]}`}>{p._map}</div>
              <span className="text-muted-foreground">mmHg</span>
            </div>
          </button>
        ))}
      </div>

      {/* Critical Alerts */}
      <h2 className="text-lg font-semibold mb-4">Critical Alerts</h2>
      {highAlerts.length === 0 ? (
        <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">No high-alert patients right now.</div>
      ) : (
        <div className="space-y-4">
          {highAlerts.sort((a, b) => b._score - a._score).map((p) => {
            const initials = p.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
            const rr = Math.max(12, Math.min(32, Math.round(16 + (p._score - 60) / 4)));
            const data = makeTrendData(p.score, p._score);
            return (
              <div key={`${p.name}-${p.bed}`} className="grid lg:grid-cols-2 gap-4">
                {/* Patient Alert Card */}
                <div className="rounded-lg border bg-card p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <button
                      type="button"
                      onClick={() => goToPatient(p.name)}
                      className="flex items-center gap-3 text-left group"
                      aria-label={`Open ${p.name} in Patients`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold group-hover:bg-primary/30 transition-colors">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-sm group-hover:underline">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.icuType} · Bed · {p.bed} </div>
                      </div>
                    </button>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-destructive leading-none">
                        {p._score}% <span className="text-base font-semibold">High</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">High alert</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    {[
                      { label: "HR", value: `${p._hr} bpm` },
                      { label: "SpO2", value: `${p._spo2}%` },
                      { label: "MAP", value: `${p._map} mmHg` },
                    ].map((v) => (
                      <div key={v.label} className="rounded-md border bg-secondary/30 p-2">
                        <div className="text-muted-foreground">{v.label}</div>
                        <div className="font-semibold text-base">{v.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-semibold mb-1">AI Explainability (SHAP)</div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 mb-3">
                    {Object.entries(p.shap)
                      .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                      .slice(0, 3)
                      .map(([k, v]) => (
                        <li key={k}>• {k.toUpperCase()}: {v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)} {v > 0 ? "↑ risk" : "↓ risk"}</li>
                      ))}
                  </ul>

                  <div className="text-xs font-semibold mb-1">Suggested Interventions</div>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {p.suggestions.slice(0, 3).map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>

                {/* Vital Trends Card */}
                <div className="rounded-lg border bg-card p-5">
                  <div className="text-sm font-semibold mb-3">Vital Trends · {p.name}</div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <XAxis dataKey="t" tick={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Area type="monotone" dataKey="hr" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%, 0.1)" strokeWidth={2} />
                        <Area type="monotone" dataKey="spo2" stroke="hsl(200, 98%, 39%)" fill="hsl(200, 98%, 39%, 0.1)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { label: "HR", val: p._hr },
                      { label: "SpO2", val: `${p._spo2}%` },
                      { label: "MAP", val: p._map },
                      { label: "RR", val: rr },
                    ].map((v) => (
                      <div key={v.label}>
                        <div className="font-bold text-lg">{v.val}</div>
                        <div className="text-muted-foreground">{v.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
