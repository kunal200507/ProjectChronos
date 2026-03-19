import * as React from "react";
import { Activity, Clock, Wifi, WifiOff, FlaskConical, ClipboardList, Stethoscope, Brain, Download, UserRoundCog } from "lucide-react";

import { patients, type Patient } from "@/data/patients";
import { scoreToRiskLabel } from "@/lib/risk";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SHAPChart from "@/components/SHAPChart";
import RiskTimelineChart from "@/components/RiskTimelineChart";

const riskBadge: Record<string, string> = { High: "risk-high", Medium: "risk-medium", Low: "risk-low" };
const diagnosisBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "destructive", Chronic: "secondary", Resolved: "outline",
};

function jitter(base: number, amplitude: number) {
  return base + (Math.random() - 0.5) * 2 * amplitude;
}
function isAbnormal(key: string, value: number): boolean {
  if (key === "hr") return value < 50 || value > 110;
  if (key === "spo2") return value < 95;
  if (key === "sbp") return value < 90 || value > 140;
  if (key === "dbp") return value < 60 || value > 90;
  if (key === "rr") return value < 12 || value > 20;
  if (key === "temp") return value < 36.1 || value > 37.5;
  return false;
}

type LiveVitals = { hr: number; spo2: number; sbp: number; dbp: number; rr: number; temp: number };
type ManualEntry = { lactate: string; wbc: string; gcs: string; urine: string; notes: string };
type Submission = {
  id: number; patientName: string; bed: string; icuType: string;
  patientData: Patient; live: LiveVitals; manual: ManualEntry;
  riskEst: number; topDriver: string; timestamp: string;
};

const GCS_OPTIONS = Array.from({ length: 15 }, (_, i) => i + 1);

// ── Pre-generated seed assessments ──────────────────────────────────────────
function makeSeedSubmissions(): Submission[] {
  const seeds: Array<{ pi: number; live: LiveVitals; manual: ManualEntry; minutesAgo: number }> = [
    {
      pi: 0,
      live: { hr: 132, spo2: 89, sbp: 85, dbp: 56, rr: 22, temp: 38.2 },
      manual: { lactate: "4.1", wbc: "14.2", gcs: "12", urine: "28", notes: "Patient restless, pallor noted" },
      minutesAgo: 18,
    },
    {
      pi: 1,
      live: { hr: 110, spo2: 94, sbp: 95, dbp: 62, rr: 19, temp: 37.8 },
      manual: { lactate: "2.3", wbc: "11.9", gcs: "14", urine: "45", notes: "Mild distress, SpO2 trending down" },
      minutesAgo: 35,
    },
    {
      pi: 3,
      live: { hr: 88, spo2: 91, sbp: 78, dbp: 50, rr: 18, temp: 37.2 },
      manual: { lactate: "1.8", wbc: "5.2", gcs: "13", urine: "52", notes: "Post-op monitoring, stable trend" },
      minutesAgo: 52,
    },
    {
      pi: 4,
      live: { hr: 76, spo2: 98, sbp: 118, dbp: 74, rr: 15, temp: 36.8 },
      manual: { lactate: "1.1", wbc: "7.8", gcs: "15", urine: "68", notes: "Improving, alert and cooperative" },
      minutesAgo: 74,
    },
  ];

  return seeds.map((s, i) => {
    const p = patients[s.pi];
    const lacVal = parseFloat(s.manual.lactate);
    const wbcVal = parseFloat(s.manual.wbc);
    const riskEst = Math.min(100, Math.max(0,
      (s.live.hr > 120 ? 20 : 0) +
      (s.live.spo2 < 92 ? 35 : s.live.spo2 < 95 ? 15 : 0) +
      (lacVal > 4 ? 25 : lacVal > 2 ? 12 : 0) +
      (wbcVal > 12 || wbcVal < 4 ? 15 : 0) +
      p.score * 0.35
    ));
    const topDriverEntry = Object.entries(p.shap).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))[0];
    const topDriver = topDriverEntry?.[0]?.toUpperCase() ?? "HR";
    const t = new Date(Date.now() - s.minutesAgo * 60000);
    return {
      id: i + 1, patientName: p.name, bed: p.bed, icuType: p.icuType,
      patientData: p, live: s.live, manual: s.manual,
      riskEst: Math.round(riskEst), topDriver,
      timestamp: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  });
}

// ── Patient Detail Sheet ─────────────────────────────────────────────────────
const PatientDetailSheet = ({
  submission, open, onClose,
}: { submission: Submission | null; open: boolean; onClose: () => void }) => {
  if (!submission) return null;
  const p = submission.patientData;
  const risk = scoreToRiskLabel(p.score);
  const initials = p.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[560px] sm:w-[620px] overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-5 pb-4 border-b sticky top-0 bg-card z-10">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">{initials}</div>
            <div>
              <div className="flex items-center gap-2">
                <span>{p.name}</span>
                <span className={`${riskBadge[risk]} px-2 py-0.5 rounded text-[10px] font-semibold`}>{risk}</span>
              </div>
              <div className="text-xs font-normal text-muted-foreground">{p.icuType} · Bed {p.bed} · {p.age}</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-5">
          {/* Assessment snapshot */}
          <div className={`rounded-lg border p-4 ${
            submission.riskEst >= 75 ? "bg-destructive/5 border-destructive/30"
            : submission.riskEst >= 40 ? "bg-warning/5 border-warning/30"
            : "bg-success/5 border-success/30"
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-primary" /> Assessment at {submission.timestamp}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">AI Risk Estimate</div>
                <div className={`text-3xl font-bold ${submission.riskEst >= 75 ? "text-destructive" : submission.riskEst >= 40 ? "text-warning" : "text-success"}`}>
                  {submission.riskEst}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">Top driver: <span className="font-semibold text-foreground">{submission.topDriver}</span></div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-muted-foreground mb-1">🔵 Live Vitals Snapshot</div>
                <div>HR: <span className="font-medium">{submission.live.hr} bpm</span></div>
                <div>SpO₂: <span className="font-medium">{submission.live.spo2}%</span></div>
                <div>BP: <span className="font-medium">{submission.live.sbp}/{submission.live.dbp} mmHg</span></div>
                <div>RR: <span className="font-medium">{submission.live.rr} /min</span></div>
                <div>Temp: <span className="font-medium">{submission.live.temp}°C</span></div>
              </div>
            </div>
            {/* Manual lab values — always shown */}
            <div className="rounded-md bg-background/60 border p-3">
              <div className="text-xs font-semibold text-muted-foreground mb-2">🟡 Manual / Lab Values</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Lactate</div>
                  <div className="font-semibold">{submission.manual.lactate ? `${submission.manual.lactate} mmol/L` : "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">WBC Count</div>
                  <div className="font-semibold">{submission.manual.wbc ? `${submission.manual.wbc} ×10³/µL` : "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">GCS Score</div>
                  <div className="font-semibold">{submission.manual.gcs ? `${submission.manual.gcs}/15` : "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Urine Output</div>
                  <div className="font-semibold">{submission.manual.urine ? `${submission.manual.urine} mL/hr` : "—"}</div>
                </div>
              </div>
              {submission.manual.notes && (
                <div className="mt-2 text-xs text-muted-foreground italic border-t pt-2">📝 "{submission.manual.notes}"</div>
              )}
            </div>
          </div>

          {/* SHAP + Timeline */}
          <div>
            <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> AI Explainability (SHAP)</div>
            <SHAPChart shap={p.shap} />
          </div>
          <div>
            <div className="text-sm font-semibold mb-3">Risk Timeline — Last 24h</div>
            <RiskTimelineChart history={p.vitalsHistory} patientName={p.name} />
          </div>

          {/* Patient record */}
          <div>
            <div className="text-sm font-semibold mb-3">Patient Record</div>
            <div className="space-y-3">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {([
                    ["Blood Group", p.bloodGroup],
                    ["Weight / Height", `${p.weightKg} kg / ${p.heightCm} cm`],
                    ["Primary Physician", p.primaryPhysician],
                    ["Admit Date", p.admitted],
                    ["Care Level", p.careLevel],
                    ["Emergency Contact", `${p.emergencyContact.name} (${p.emergencyContact.relation})`],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label}><div className="text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Diagnoses</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.diagnosisHistory.map((d) => (
                    <Badge key={`${d.label}-${d.year}`} variant={diagnosisBadge[d.status]}>{d.label} · {d.year} · {d.status}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Medications</div>
                <Tabs defaultValue="current">
                  <TabsList className="h-7"><TabsTrigger value="current" className="text-xs h-6">Current</TabsTrigger><TabsTrigger value="past" className="text-xs h-6">Past</TabsTrigger></TabsList>
                  <TabsContent value="current">
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {p.medications.current.map((m) => (<li key={m} className="flex items-center justify-between"><span className="font-medium">{m}</span><Badge variant="secondary" className="text-[9px]">Current</Badge></li>))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="past">
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {p.medications.past.map((m) => (<li key={m} className="flex items-center justify-between"><span className="font-medium">{m}</span><Badge variant="outline" className="text-[9px]">Past</Badge></li>))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Allergies</div>
                <div className="flex flex-wrap gap-1.5">
                  {p.allergies.map((a) => (<Badge key={a} variant={a.toLowerCase().includes("none") ? "secondary" : "destructive"}>{a}</Badge>))}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">💡 Suggested Interventions</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {p.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center mt-0.5 shrink-0">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lab Reports</div>
                <div className="space-y-2">
                  {p.labReports.map((r) => (
                    <div key={`${r.name}-${r.date}`} className="flex items-center justify-between gap-3 text-xs">
                      <div><div className="font-medium">{r.name}</div><div className="text-muted-foreground">{r.type} · {r.date}</div></div>
                      <Button size="sm" variant="outline" disabled={!r.url} className="h-6 text-[10px] px-2">
                        <Download className="h-3 w-3 mr-1" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const VitalsPage = () => {
  const { toast } = useToast();
  const [patientIdx, setPatientIdx] = React.useState(0);
  const [liveActive, setLiveActive] = React.useState(true);
  const [submissions, setSubmissions] = React.useState<Submission[]>(() => makeSeedSubmissions());
  const [selectedSubmission, setSelectedSubmission] = React.useState<Submission | null>(null);

  const selected = patients[patientIdx];

  const [live, setLive] = React.useState<LiveVitals>(() => ({
    hr: selected.hr, spo2: selected.spo2,
    sbp: Math.round(selected.map * 1.3), dbp: Math.round(selected.map * 0.85),
    rr: 16, temp: 37.0,
  }));

  React.useEffect(() => {
    setLive({ hr: selected.hr, spo2: selected.spo2, sbp: Math.round(selected.map * 1.3), dbp: Math.round(selected.map * 0.85), rr: 16, temp: 37.0 });
  }, [patientIdx, selected.hr, selected.spo2, selected.map]);

  React.useEffect(() => {
    if (!liveActive) return;
    const id = setInterval(() => {
      setLive((prev) => ({
        hr: Math.round(Math.max(30, Math.min(200, jitter(prev.hr, 3)))),
        spo2: Math.round(Math.max(75, Math.min(100, jitter(prev.spo2, 0.8)))),
        sbp: Math.round(Math.max(70, Math.min(200, jitter(prev.sbp, 2)))),
        dbp: Math.round(Math.max(40, Math.min(130, jitter(prev.dbp, 1.5)))),
        rr: Math.round(Math.max(8, Math.min(40, jitter(prev.rr, 0.6)))),
        temp: Math.round(Math.max(35, Math.min(42, jitter(prev.temp, 0.05))) * 10) / 10,
      }));
    }, 1500);
    return () => clearInterval(id);
  }, [liveActive]);

  const [manual, setManual] = React.useState<ManualEntry>({ lactate: "", wbc: "", gcs: "", urine: "", notes: "" });
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const handleManualChange = (key: keyof ManualEntry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setManual((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setTimeout(() => {
      setSubmitLoading(false);
      const lacVal = parseFloat(manual.lactate) || 1.0;
      const wbcVal = parseFloat(manual.wbc) || 7.5;
      const riskEst = Math.min(100, Math.max(0,
        (live.hr > 120 ? 20 : 0) + (live.spo2 < 92 ? 35 : live.spo2 < 95 ? 15 : 0) +
        (lacVal > 4 ? 25 : lacVal > 2 ? 12 : 0) + (wbcVal > 12 || wbcVal < 4 ? 15 : 0) + selected.score * 0.35
      ));
      const topDriverEntry = Object.entries(selected.shap).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))[0];
      const topDriver = topDriverEntry?.[0]?.toUpperCase() ?? "HR";
      const entry: Submission = {
        id: Date.now(), patientName: selected.name, bed: selected.bed, icuType: selected.icuType,
        patientData: selected, live: { ...live }, manual: { ...manual },
        riskEst: Math.round(riskEst), topDriver, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setSubmissions((prev) => [entry, ...prev.slice(0, 9)]);
      setManual({ lactate: "", wbc: "", gcs: "", urine: "", notes: "" });
      toast({
        title: riskEst >= 75 ? "🚨 High Risk Detected!" : riskEst >= 40 ? "⚠️ Elevated Risk" : "✅ Assessment Recorded",
        description: `${selected.name} · Risk: ${Math.round(riskEst)}% · Top driver: ${topDriver}${lacVal > 2 ? " · Lactate ↑" : ""}${wbcVal > 12 ? " · WBC ↑" : ""}`,
        variant: riskEst >= 75 ? "destructive" : "default",
      });
    }, 900);
  };

  const liveFields: { key: keyof LiveVitals; label: string; unit: string; icon: string }[] = [
    { key: "hr", label: "Heart Rate", unit: "bpm", icon: "❤️" },
    { key: "spo2", label: "SpO₂", unit: "%", icon: "🫁" },
    { key: "sbp", label: "Systolic BP", unit: "mmHg", icon: "🫀" },
    { key: "dbp", label: "Diastolic BP", unit: "mmHg", icon: "🫀" },
    { key: "rr", label: "Resp. Rate", unit: "/min", icon: "🌬" },
    { key: "temp", label: "Temperature", unit: "°C", icon: "🌡️" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Vitals Monitor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Auto vitals from bedside devices · Manual inputs from clinical assessment</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded-md px-3 py-1.5 bg-card">
            <Clock className="w-3.5 h-3.5" />{new Date().toLocaleTimeString()}
          </div>
          <button type="button" onClick={() => setLiveActive((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${liveActive ? "border-success/40 text-success bg-success/10 hover:bg-success/20" : "border-muted-foreground/30 text-muted-foreground hover:bg-secondary"}`}>
            {liveActive ? <><Wifi className="w-3.5 h-3.5" /> Live Feed</> : <><WifiOff className="w-3.5 h-3.5" /> Paused</>}
          </button>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="rounded-lg border bg-card p-4 mb-5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Patient</div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {patients.map((p, i) => {
            const risk = scoreToRiskLabel(p.score);
            return (
              <button key={`${p.name}-${p.bed}`} type="button" onClick={() => setPatientIdx(i)}
                className={`p-2.5 rounded-lg border text-left transition-all ${i === patientIdx ? "border-primary bg-primary/5" : "hover:bg-secondary/50"}`}>
                <div className="font-medium text-xs">{p.name.split(" ")[0]}</div>
                <div className="text-[10px] text-muted-foreground">{p.icuType} · Bed {p.bed}</div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold mt-1 inline-block ${riskBadge[risk]}`}>{risk}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Live Auto Vitals */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-secondary/30">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-success" />
                <span className="font-semibold text-sm">Live Vitals</span>
                <span className="text-xs text-muted-foreground">— Auto (Bedside Devices)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {liveActive && (<span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-success" /></span>)}
                <span className={`text-xs font-medium ${liveActive ? "text-success" : "text-muted-foreground"}`}>{liveActive ? "Streaming" : "Paused"}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex gap-3 mb-4 flex-wrap">
                {[{ label: "ECG Monitor", vitals: "HR" }, { label: "Pulse Oximeter", vitals: "SpO₂" }, { label: "Arterial Line / Cuff", vitals: "BP" }, { label: "Ventilator", vitals: "RR" }, { label: "Temp Probe", vitals: "Temp" }].map((d) => (
                  <div key={d.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground border rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />{d.label} → {d.vitals}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {liveFields.map(({ key, label, unit, icon }) => {
                  const val = live[key];
                  const abnormal = isAbnormal(key, val);
                  return (
                    <div key={key} className={`rounded-lg border p-3 transition-colors ${abnormal ? "border-destructive/50 bg-destructive/5" : "bg-secondary/20"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{icon} {label}</span>
                        {abnormal && <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1 py-0.5 rounded">⚠ ABNORMAL</span>}
                      </div>
                      <div className={`text-2xl font-bold font-mono tracking-tight ${abnormal ? "text-destructive" : liveActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {key === "temp" ? val.toFixed(1) : val}<span className="text-xs font-normal ml-1 text-muted-foreground">{unit}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        {liveActive ? <><span className="w-1 h-1 rounded-full bg-success inline-block animate-pulse" />Continuous</> : "Paused"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 rounded-md bg-secondary/40 px-4 py-2 grid grid-cols-2 md:grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                <span>HR: 60–100 bpm</span><span>SpO₂: ≥ 95%</span><span>SBP: 90–140 mmHg</span>
                <span>DBP: 60–90 mmHg</span><span>RR: 12–20 /min</span><span>Temp: 36.1–37.5 °C</span>
              </div>
            </div>
          </div>

          {/* Manual Clinical Inputs */}
          <form onSubmit={handleSubmit} className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b bg-secondary/30">
              <FlaskConical className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Manual Clinical Inputs</span>
              <span className="text-xs text-muted-foreground">— Nurse / Lab Entry</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    🧬 Lactate (mmol/L) <span className="text-[10px] text-muted-foreground/70">Lab test — blood draw</span>
                  </label>
                  <input type="number" step="0.1" min="0" max="20" placeholder="e.g. 2.1" value={manual.lactate} onChange={handleManualChange("lactate")}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="text-[10px] text-muted-foreground mt-1">Normal: &lt; 2.0 · Sepsis: &gt; 2.0 · Shock: &gt; 4.0</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    🔬 WBC Count (×10³/µL) <span className="text-[10px] text-muted-foreground/70">Lab test — CBC panel</span>
                  </label>
                  <input type="number" step="0.1" min="0" max="100" placeholder="e.g. 11.5" value={manual.wbc} onChange={handleManualChange("wbc")}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="text-[10px] text-muted-foreground mt-1">Normal: 4.0–11.0 · Infection: &gt; 12 · Neutropenia: &lt; 4</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    🧠 GCS Score (3–15) <span className="text-[10px] text-muted-foreground/70">Clinical observation</span>
                  </label>
                  <select value={manual.gcs} onChange={handleManualChange("gcs")}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select GCS…</option>
                    {GCS_OPTIONS.map((n) => (<option key={n} value={n}>{n} — {n >= 13 ? "Mild" : n >= 9 ? "Moderate" : "Severe"}</option>))}
                  </select>
                  <div className="text-[10px] text-muted-foreground mt-1">15 = fully alert · &lt;8 = intubation threshold</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    💧 Urine Output (mL/hr) <span className="text-[10px] text-muted-foreground/70">Measured from catheter</span>
                  </label>
                  <input type="number" min="0" max="1000" placeholder="e.g. 50" value={manual.urine} onChange={handleManualChange("urine")}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="text-[10px] text-muted-foreground mt-1">Target: &gt; 0.5 mL/kg/hr · Oliguria: &lt; 200 mL/4h</div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  <Stethoscope className="w-3 h-3 inline mr-1" />Clinical Notes <span className="text-[10px] text-muted-foreground/70">Nurse observations</span>
                </label>
                <textarea rows={2} placeholder="e.g. Patient agitated, skin mottled, cool extremities…" value={manual.notes} onChange={handleManualChange("notes")}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Patient: <span className="font-semibold text-foreground">{selected.name}</span>
                  &nbsp;·&nbsp;{selected.icuType} · Bed {selected.bed}&nbsp;·&nbsp;
                  <span className="font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                <Button type="submit" disabled={submitLoading} className="min-w-36">
                  {submitLoading ? "Running AI Analysis…" : "Submit Assessment"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Recent Assessments */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card h-full">
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-secondary/30">
              <ClipboardList className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Recent Assessments</span>
              <span className="ml-auto text-xs text-muted-foreground">{submissions.length}</span>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {submissions.map((s) => (
                  <button key={s.id} type="button" onClick={() => setSelectedSubmission(s)}
                    className={`w-full rounded-md border p-3 text-sm text-left transition-all hover:brightness-[0.97] hover:shadow-sm cursor-pointer ${
                      s.riskEst >= 75 ? "border-destructive/40 bg-destructive/5"
                      : s.riskEst >= 40 ? "border-warning/40 bg-warning/5"
                      : "border-success/40 bg-success/5"
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">{s.patientName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.riskEst >= 75 ? "risk-high" : s.riskEst >= 40 ? "risk-medium" : "risk-low"}`}>{s.riskEst}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-0.5">{s.icuType} · Bed {s.bed}</div>
                    <div className="text-[10px] text-muted-foreground mb-1">
                      HR {s.live.hr} · SpO₂ {s.live.spo2}%
                      {s.manual.lactate && ` · Lac ${s.manual.lactate}`}
                      {s.manual.wbc && ` · WBC ${s.manual.wbc}`}
                    </div>
                    <div className="text-[10px] flex items-center justify-between">
                      <span className="text-muted-foreground">Top: <span className="text-foreground font-medium">{s.topDriver}</span></span>
                      <span className="text-primary text-[10px] font-medium">Tap to view →</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{s.timestamp}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PatientDetailSheet submission={selectedSubmission} open={!!selectedSubmission} onClose={() => setSelectedSubmission(null)} />
    </div>
  );
};

export default VitalsPage;
