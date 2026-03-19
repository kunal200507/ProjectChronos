import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import * as React from "react";
import { ChartLine, Download, Brain, FlaskConical } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { patients } from "@/data/patients";
import { scoreToRiskLabel } from "@/lib/risk";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SHAPChart from "@/components/SHAPChart";
import RiskTimelineChart from "@/components/RiskTimelineChart";
import { useToast } from "@/hooks/use-toast";

const riskBadge: Record<string, string> = { High: "risk-high", Medium: "risk-medium", Low: "risk-low" };
const diagnosisBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "destructive",
  Chronic: "secondary",
  Resolved: "outline",
};

function makeVitalsData(seed: number) {
  return Array.from({ length: 24 }, (_, i) => ({
    t: `${i}:00`,
    hr: Math.round(75 + Math.sin((i + seed) / 3) * 20 + Math.random() * 6),
    spo2: Math.round(95 + Math.sin((i + seed) / 5) * 4),
    map: Math.round(80 + Math.cos((i + seed) / 4) * 15),
  }));
}

const PatientsPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { toast } = useToast();

  const selected = patients[selectedIndex] ?? patients[0];
  const selectedRisk = scoreToRiskLabel(selected.score);
  const initials = selected.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const vitalsData = React.useMemo(() => makeVitalsData(selectedIndex), [selectedIndex]);

  // Vitals input form state
  const [vitalsForm, setVitalsForm] = React.useState({ hr: "", spo2: "", sbp: "", dbp: "", lactate: "", wbc: "", gcs: "", notes: "" });
  const [submitLoading, setSubmitLoading] = React.useState(false);

  const slugify = React.useCallback((value: string) => {
    return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }, []);

  React.useEffect(() => {
    const target = searchParams.get("patient");
    if (!target) return;
    const idx = patients.findIndex((p) => slugify(p.name) === target);
    if (idx >= 0) setSelectedIndex(idx);
  }, [searchParams, slugify]);

  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const wards = React.useMemo(() => {
    const set = new Set(patients.map((p) => p.icuType));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const [activeWard, setActiveWard] = React.useState<string>(() => wards[0] ?? "MICU");

  // Sync ward to selected patient when deep-linking
  React.useEffect(() => {
    if (!selected) return;
    setActiveWard(selected.icuType);
  }, [selected.icuType]);

  // Filter by ward only — no pod sub-filter
  const visiblePatients = React.useMemo(() => {
    const base = patients.filter((p) => p.icuType === activeWard);
    if (!q) return base;
    return base.filter((p) => p.name.toLowerCase().includes(q) || p.bed.toLowerCase().includes(q));
  }, [activeWard, q]);

  React.useEffect(() => {
    if (!q) return;
    if (searchParams.get("patient")) return;
    const first = visiblePatients[0];
    if (!first) return;
    const idx = patients.findIndex((p) => p.name === first.name && p.bed === first.bed);
    if (idx >= 0) setSelectedIndex(idx);
  }, [q, searchParams, visiblePatients]);

  const handleVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitalsForm.hr || !vitalsForm.spo2) return;
    setSubmitLoading(true);
    // Simulate AI analysis
    setTimeout(() => {
      setSubmitLoading(false);
      const hr = parseInt(vitalsForm.hr);
      const spo2 = parseInt(vitalsForm.spo2);
      const lacVal = parseFloat(vitalsForm.lactate) || 1.0;
      const wbcVal = parseFloat(vitalsForm.wbc) || 7.5;
      const riskEst = Math.min(100, Math.max(0,
        (hr > 120 ? 30 : 0) + (spo2 < 92 ? 40 : 0) +
        (lacVal > 4 ? 25 : lacVal > 2 ? 12 : 0) +
        (wbcVal > 12 || wbcVal < 4 ? 15 : 0) +
        selected.score * 0.4
      ));
      toast({
        title: riskEst >= 75 ? "🚨 High Risk Detected!" : "✅ Vitals Recorded",
        description: `AI Analysis → Risk: ${Math.round(riskEst)}% for ${selected.name}. Top driver: ${Object.entries(selected.shap).sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))[0]?.[0]?.toUpperCase()}${lacVal > 2 ? " · Lactate ↑" : ""}${wbcVal > 12 ? " · WBC ↑" : ""}.`,
      });
      setVitalsForm({ hr: "", spo2: "", sbp: "", dbp: "", lactate: "", wbc: "", gcs: "", notes: "" });
    }, 900);
  };

  const riskColor = selectedRisk === "High" ? "text-destructive" : selectedRisk === "Medium" ? "text-warning" : "text-success";
  const riskBgColor = selectedRisk === "High" ? "bg-destructive/10 border-destructive/20" : selectedRisk === "Medium" ? "bg-warning/10 border-warning/20" : "bg-success/10 border-success/20";

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Patients</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1 rounded-lg border bg-card overflow-hidden">
          {/* Ward Tabs */}
          <div className="border-b bg-secondary/30">
            <Tabs value={activeWard} onValueChange={setActiveWard}>
              <div className="p-3 pb-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wards</div>
              </div>
              <div className="px-3 pb-3">
                <TabsList className="w-full h-auto flex flex-wrap justify-start gap-2 bg-transparent p-0">
                  {wards.map((w) => (
                    <TabsTrigger
                      key={w}
                      value={w}
                      className="text-xs h-9 px-3 rounded-md border bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {w}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </div>

          {/* Patients */}
          <div className="p-3 border-b bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Patients ({visiblePatients.length})
          </div>
          <div className="divide-y">
            {visiblePatients.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No patients in this ward.</div>
            ) : (
              visiblePatients.map((p) => {
                const idx = patients.findIndex((x) => x.name === p.name && x.bed === p.bed);
                const derivedRisk = scoreToRiskLabel(p.score);
                return (
                  <div
                    key={`${p.name}-${p.bed}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => idx >= 0 && setSelectedIndex(idx)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && idx >= 0) setSelectedIndex(idx);
                    }}
                    className={`p-3 cursor-pointer transition-colors hover:bg-secondary/50 ${
                      idx === selectedIndex ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{p.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${riskBadge[derivedRisk]}`}>{derivedRisk}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.age}y · {p.icuType} · Bed {p.bed} · Score: {p.score}%
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Patient Detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <span className={`${riskBadge[selectedRisk]} px-2 py-0.5 rounded text-xs font-semibold`}>{selectedRisk}</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open patient chart">
                      <ChartLine className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-[min(92vw,1100px)] p-0">
                    <DialogHeader className="p-6 pb-3">
                      <DialogTitle>Patient Chart</DialogTitle>
                      <div className="text-sm text-muted-foreground">
                        {selected.name} · {selected.age} · Bed {selected.bed}
                      </div>
                    </DialogHeader>
                    <Separator />
                    <ScrollArea className="max-h-[75vh]">
                      <div className="p-6 space-y-4">
                        {/* Summary + Allergies */}
                        <div className="grid lg:grid-cols-3 gap-4">
                          <Card className="lg:col-span-2">
                            <CardHeader className="pb-3"><CardTitle className="text-base">Patient Summary</CardTitle></CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                              {[
                                ["Blood Group", selected.bloodGroup],
                                ["Weight / Height", `${selected.weightKg} kg / ${selected.heightCm} cm`],
                                ["Emergency Contact", `${selected.emergencyContact.name} (${selected.emergencyContact.relation})`],
                                ["Contact Phone", selected.emergencyContact.phone],
                                ["Primary Physician", selected.primaryPhysician],
                                ["Admit Date", selected.admitted],
                              ].map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-3">
                                  <span className="text-muted-foreground">{label}</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                          <Card className="border-destructive/40">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center justify-between">
                                Allergies <Badge variant="destructive">Important</Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                              {selected.allergies.map((a) => (
                                <Badge key={a} variant={a.toLowerCase().includes("none") ? "secondary" : "destructive"}>{a}</Badge>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="pb-3"><CardTitle className="text-base">Diagnosis History</CardTitle></CardHeader>
                          <CardContent className="flex flex-wrap gap-2">
                            {selected.diagnosisHistory.map((d) => (
                              <Badge key={`${d.label}-${d.year}`} variant={diagnosisBadge[d.status]}>
                                {d.label} · {d.year} · {d.status}
                              </Badge>
                            ))}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3"><CardTitle className="text-base">Past Medical History</CardTitle></CardHeader>
                          <CardContent className="grid sm:grid-cols-2 gap-2 text-sm">
                            {selected.pastMedicalHistory.map((m) => (
                              <div key={`${m.label}-${m.year}`} className="flex justify-between gap-3">
                                <span className="text-muted-foreground">{m.year}</span>
                                <span className="font-medium">{m.label}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3"><CardTitle className="text-base">Medications</CardTitle></CardHeader>
                          <CardContent>
                            <Tabs defaultValue="current">
                              <TabsList>
                                <TabsTrigger value="current">Current</TabsTrigger>
                                <TabsTrigger value="past">Past</TabsTrigger>
                              </TabsList>
                              <TabsContent value="current">
                                <ul className="mt-2 space-y-2 text-sm">
                                  {selected.medications.current.map((m) => (
                                    <li key={m} className="flex items-center justify-between">
                                      <span className="font-medium">{m}</span>
                                      <Badge variant="secondary">Current</Badge>
                                    </li>
                                  ))}
                                </ul>
                              </TabsContent>
                              <TabsContent value="past">
                                <ul className="mt-2 space-y-2 text-sm">
                                  {selected.medications.past.map((m) => (
                                    <li key={m} className="flex items-center justify-between">
                                      <span className="font-medium">{m}</span>
                                      <Badge variant="outline">Past</Badge>
                                    </li>
                                  ))}
                                </ul>
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>

                        <div className="grid lg:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Family History</CardTitle></CardHeader>
                            <CardContent className="text-sm">
                              <ul className="space-y-2">
                                {selected.familyHistory.map((f) => (
                                  <li key={f} className="text-muted-foreground">• <span className="text-foreground">{f}</span></li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Lifestyle & Habits</CardTitle></CardHeader>
                            <CardContent className="grid gap-2 text-sm">
                              {Object.entries(selected.lifestyle).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3">
                                  <span className="text-muted-foreground capitalize">{k}</span>
                                  <span className="font-medium">{v}</span>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Previous Lab Reports</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                              {selected.labReports.map((r) => (
                                <div key={`${r.name}-${r.date}`} className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{r.name}</div>
                                    <div className="text-xs text-muted-foreground">{r.type} · {r.date}</div>
                                  </div>
                                  <Button size="sm" variant="outline" disabled={!r.url}>
                                    <Download className="h-4 w-4" /> Download
                                  </Button>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Timeline View</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              {selected.timeline.map((t) => (
                                <div key={`${t.year}-${t.text}`} className="flex gap-3">
                                  <div className="w-16 text-muted-foreground font-medium">{t.year}</div>
                                  <div className="flex-1">{t.text}</div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="pb-2"><CardTitle className="text-base">ICU Organization (Reference)</CardTitle></CardHeader>
                          <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="big-four">
                                <AccordionTrigger>The "Big Four" (most common)</AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                                  <div className="grid md:grid-cols-2 gap-2">
                                    <div><span className="font-medium text-foreground">MICU</span> — Adults with medical critical illness (sepsis, organ failure).</div>
                                    <div><span className="font-medium text-foreground">SICU</span> — Post major surgery/trauma recovery.</div>
                                    <div><span className="font-medium text-foreground">NICU</span> — Newborns, prematurity/birth complications.</div>
                                    <div><span className="font-medium text-foreground">PICU</span> — Children/adolescents critically ill.</div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              <AccordionItem value="levels">
                                <AccordionTrigger>Levels of care (I/II/III)</AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground space-y-1">
                                  <div>• <span className="font-medium text-foreground">Level III</span> — Full ICU (24/7 specialists, advanced ventilators, dialysis).</div>
                                  <div>• <span className="font-medium text-foreground">Level II</span> — Step-down/HDU.</div>
                                  <div>• <span className="font-medium text-foreground">Level I</span> — Basic stabilization + transfer.</div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-sm text-muted-foreground">{selected.age} · Bed · {selected.bed}</div>
            </div>
          </div>

          {/* AI Risk Prediction Panel */}
          <div className={`rounded-lg border p-4 ${riskBgColor}`}>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <div className={`text-xs font-bold uppercase tracking-wider ${riskColor}`}>
                AI RISK ASSESSMENT — {selectedRisk.toUpperCase()}
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className={`text-4xl font-bold ${riskColor}`}>{selected.score}%</div>
              <div className="text-sm text-muted-foreground mb-1">
                {selected.score >= 75
                  ? "Predicted onset ~3 hours · " + (selected.diagnosisHistory.find((d) => d.status === "Active")?.label ?? "Critical condition")
                  : selected.score >= 40
                  ? "Monitor closely · " + (selected.diagnosisHistory.find((d) => d.status === "Active")?.label ?? "Watch patient")
                  : "Stable — routine monitoring"}
              </div>
            </div>
          </div>



          {/* Risk Timeline */}
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-semibold mb-3">Risk Timeline — Last 24h</div>
            <RiskTimelineChart history={selected.vitalsHistory} patientName={selected.name} />
          </div>

          {/* Vitals Charts */}
          <div className="grid md:grid-cols-1 gap-4">
            {[
              { key: "hr", label: "Heart Rate", value: `${selected.hr} bpm`, color: "hsl(0, 84%, 60%)" },
              { key: "spo2", label: "SpO2", value: `${selected.spo2}%`, color: "hsl(200, 98%, 39%)" },
              { key: "map", label: "MAP", value: `${selected.map} mmHg`, color: "hsl(262, 50%, 50%)" },
            ].map((v) => (
              <div key={v.key} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{v.label}</span>
                  <span className="text-lg font-bold">{v.value}</span>
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={vitalsData}>
                      <XAxis dataKey="t" tick={false} axisLine={false} />
                      <YAxis hide />
                      <Area type="monotone" dataKey={v.key} stroke={v.color} fill={`${v.color.slice(0, -1)}, 0.1)`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {/* SHAP Explainability */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">AI Explainability (SHAP)</h3>
            </div>
            <SHAPChart shap={selected.shap} />
          </div>

          {/* Patient Info + Medications (fixed) */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-sm mb-3">Patient Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Age</span><span>{selected.age}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ICU Type</span><span>{selected.icuType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Care Level</span><span>{selected.careLevel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pod</span><span>{selected.pod}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Admit Date</span><span>{selected.admitted}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Primary Physician</span><span>{selected.primaryPhysician}</span></div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-sm mb-3">Current Medications</h3>
              <ul className="space-y-2 text-sm">
                {selected.medications.current.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    <span className="text-foreground font-medium">{m}</span>
                  </li>
                ))}
              </ul>
              <h3 className="font-semibold text-sm mt-4 mb-2">Suggested Interventions</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {selected.suggestions.slice(0, 3).map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
