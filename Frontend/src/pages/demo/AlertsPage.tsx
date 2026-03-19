import * as React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, X, ChevronRight, Bell, Clock, AlertTriangle } from "lucide-react";

import { patients as basePats } from "@/data/patients";
import { scoreToRiskLabel } from "@/lib/risk";
import SHAPChart from "@/components/SHAPChart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const riskBadge: Record<string, string> = { High: "risk-high", Medium: "risk-medium", Low: "risk-low" };
const riskBorder: Record<string, string> = {
  High: "border-l-4 border-l-destructive",
  Medium: "border-l-4 border-l-warning",
  Low: "border-l-4 border-l-success",
};
const riskRingColor: Record<string, string> = {
  High: "stroke-destructive",
  Medium: "stroke-warning",
  Low: "stroke-success",
};

const filters = ["All", "High", "Medium", "Low"] as const;
type Filter = (typeof filters)[number];

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

type AlertEntry = (typeof basePats)[0] & {
  derivedRisk: string;
  status: "active" | "acknowledged" | "dismissed";
};

const RiskCircle = ({ score, risk }: { score: number; risk: string }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-border" />
      <circle
        cx="40" cy="40" r={r} fill="none" strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className={riskRingColor[risk]}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="36" textAnchor="middle" className="text-xs font-bold" fill="currentColor">{score}%</text>
      <text x="40" y="50" textAnchor="middle" fontSize="8" fill="currentColor" className="text-muted-foreground">{risk}</text>
    </svg>
  );
};

const AlertsPage = () => {
  const [filter, setFilter] = React.useState<Filter>("All");
  const [alerts, setAlerts] = React.useState<AlertEntry[]>(() =>
    basePats.map((p) => ({ ...p, derivedRisk: scoreToRiskLabel(p.score), status: p.alertStatus }))
  );
  const [selected, setSelected] = React.useState<AlertEntry | null>(null);
  const navigate = useNavigate();

  const filtered = alerts.filter((a) => {
    if (a.status === "dismissed") return false;
    if (filter === "All") return true;
    return a.derivedRisk === filter;
  });

  const sorted = filtered.slice().sort((a, b) => {
    const rank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    return (rank[b.derivedRisk] ?? 0) - (rank[a.derivedRisk] ?? 0);
  });

  const acknowledge = (name: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.name === name ? { ...a, status: "acknowledged" } : a))
    );
    if (selected?.name === name) setSelected((s) => s ? { ...s, status: "acknowledged" } : s);
  };

  const dismiss = (name: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.name === name ? { ...a, status: "dismissed" } : a))
    );
    if (selected?.name === name) setSelected(null);
  };

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold">Alerts</h1>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Updated {nowStr}
            <span className="mx-1">·</span>
            <Bell className="w-3 h-3 text-destructive" />
            <span className="text-destructive font-medium">{activeCount} active alert{activeCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
              }`}
          >
            {f === "All" ? `All (${alerts.filter((a) => a.status !== "dismissed").length})` : f}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            No alerts in this category.
          </div>
        )}
        {sorted.map((a) => (
          <div
            key={`${a.name}-${a.bed}`}
            className={`rounded-lg border bg-card overflow-hidden ${riskBorder[a.derivedRisk]} ${a.status === "acknowledged" ? "opacity-60" : ""
              }`}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {a.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{a.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${riskBadge[a.derivedRisk]}`}>
                    {a.derivedRisk}
                  </span>
                  {a.status === "acknowledged" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-muted-foreground">
                      Acknowledged
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {a.icuType} Bed {a.bed} · Risk {a.score}% · HR {a.hr} bpm · SpO2 {a.spo2}% · MAP {a.map} mmHg
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Top driver: {Object.entries(a.shap).sort(([, av], [, bv]) => Math.abs(bv) - Math.abs(av))[0]?.[0]?.toUpperCase()} impact
                </div>
              </div>

              {/* Score badge */}
              <div className={`text-2xl font-bold shrink-0 ${a.derivedRisk === "High" ? "text-destructive" : a.derivedRisk === "Medium" ? "text-warning" : "text-success"
                }`}>
                {a.score}%
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {a.status === "active" && (
                  <button
                    type="button"
                    title="Acknowledge"
                    onClick={() => acknowledge(a.name)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-success hover:bg-success/10 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  title="Dismiss"
                  onClick={() => dismiss(a.name)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="View details"
                  onClick={() => setSelected(a)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Detail Side Panel */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-[420px] sm:w-[500px] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Alert Detail
                </SheetTitle>
                <div className="text-sm text-muted-foreground">{selected.name} · Bed {selected.bed}</div>
              </SheetHeader>

              {/* Risk Circle */}
              <div className="flex items-center gap-6 mb-5 p-4 rounded-lg bg-card border">
                <RiskCircle score={selected.score} risk={selected.derivedRisk} />
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Diagnosis trigger</div>
                  <div className="font-semibold text-sm">{selected.diagnosisHistory.find((d) => d.status === "Active")?.label ?? "Under review"}</div>
                  <div className="text-xs text-muted-foreground mt-1">ICU · {selected.icuType} · {selected.careLevel}</div>
                  <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold mt-1 ${riskBadge[selected.derivedRisk]}`}>
                    {selected.status === "active" ? "🔴 Active Alert" : "✓ Acknowledged"}
                  </div>
                </div>
              </div>

              {/* Vitals snapshot */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "HR", value: `${selected.hr} bpm`, hi: selected.hr > 100 },
                  { label: "SpO2", value: `${selected.spo2}%`, hi: selected.spo2 < 92 },
                  { label: "MAP", value: `${selected.map} mmHg`, hi: selected.map < 65 },
                ].map((v) => (
                  <div key={v.label} className={`rounded-md border p-2 text-center ${v.hi ? "border-destructive/40 bg-destructive/5" : ""}`}>
                    <div className="text-xs text-muted-foreground">{v.label}</div>
                    <div className={`font-bold text-sm ${v.hi ? "text-destructive" : ""}`}>{v.value}</div>
                    {v.hi && <div className="text-[10px] text-destructive">⚠ Abnormal</div>}
                  </div>
                ))}
              </div>

              {/* SHAP Explainability */}
              <div className="mb-5">
                <div className="text-sm font-semibold mb-3">AI Explainability (SHAP)</div>
                <SHAPChart shap={selected.shap} />
              </div>

              {/* Smart Suggestions */}
              <div className="mb-5">
                <div className="text-sm font-semibold mb-2">💡 Suggested Interventions</div>
                <ul className="space-y-2">
                  {selected.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5 shrink-0">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => navigate(`/demo/patients?patient=${encodeURIComponent(slugify(selected.name))}`)}
                  className="flex-1 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Open Patient Record
                </button>
                {selected.status === "active" && (
                  <button
                    type="button"
                    onClick={() => acknowledge(selected.name)}
                    className="px-3 py-2 rounded-md text-sm font-medium border border-success/40 text-success hover:bg-success/10 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismiss(selected.name)}
                  className="px-3 py-2 rounded-md text-sm font-medium border hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AlertsPage;
