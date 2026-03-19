import * as React from "react";
import { Plus, Pencil, Trash2, Search, UserRound, X, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────────────────────────────────
type Condition = "Critical" | "Serious" | "Fair" | "Stable" | "Discharged";

interface ManagedPatient {
  id: number;
  name: string;
  age: number;
  bedId: string;
  condition: Condition;
  ward: string;
  admitDate: string;
}

const CONDITIONS: Condition[] = ["Critical", "Serious", "Fair", "Stable", "Discharged"];
const WARDS = ["MICU", "CCU", "SICU", "PACU", "General ICU"];

const conditionColor: Record<Condition, string> = {
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
  Serious:  "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400",
  Fair:     "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400",
  Stable:   "bg-success/10 text-success border-success/30",
  Discharged: "bg-secondary text-muted-foreground border border-muted",
};

// ── Pre-seeded patient list ───────────────────────────────────────────────
const INITIAL_PATIENTS: ManagedPatient[] = [
  { id: 1, name: "John Doe",      age: 68, bedId: "A1", condition: "Critical", ward: "MICU",       admitDate: "2025-03-10" },
  { id: 2, name: "Jane Smith",    age: 62, bedId: "A2", condition: "Serious",  ward: "General ICU", admitDate: "2025-03-12" },
  { id: 3, name: "Rahul Sharma",  age: 54, bedId: "B1", condition: "Fair",     ward: "CCU",         admitDate: "2025-03-14" },
  { id: 4, name: "Emily Wong",    age: 41, bedId: "B0", condition: "Stable",   ward: "PACU",        admitDate: "2025-03-15" },
  { id: 5, name: "Parul Verna",   age: 37, bedId: "B2", condition: "Stable",   ward: "PACU",        admitDate: "2025-03-16" },
  { id: 6, name: "David Park",    age: 53, bedId: "B4", condition: "Critical", ward: "SICU",        admitDate: "2025-03-11" },
];

let nextId = 10;

// ── Empty form ────────────────────────────────────────────────────────────
const emptyForm = (): Omit<ManagedPatient, "id"> => ({
  name: "", age: 0, bedId: "", condition: "Stable", ward: WARDS[0], admitDate: new Date().toISOString().slice(0, 10),
});

// ── Patient Form Modal ────────────────────────────────────────────────────
const PatientFormModal = ({
  open, onClose, onSave, initial, mode,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: Omit<ManagedPatient, "id">) => void;
  initial: Omit<ManagedPatient, "id">;
  mode: "add" | "edit";
}) => {
  const [form, setForm] = React.useState(initial);
  React.useEffect(() => setForm(initial), [initial, open]);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: key === "age" ? Number(e.target.value) : e.target.value }));

  const valid = form.name.trim().length >= 2 && form.age >= 0 && form.bedId.trim().length >= 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "➕ Add New Patient" : "✏️ Edit Patient"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name *</label>
            <input
              type="text" placeholder="e.g. John Doe" value={form.name} onChange={set("name")}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Age + Bed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Age *</label>
              <input
                type="number" min="0" max="130" placeholder="e.g. 65" value={form.age || ""} onChange={set("age")}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Bed ID *</label>
              <input
                type="text" placeholder="e.g. A3" value={form.bedId} onChange={set("bedId")}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              />
            </div>
          </div>
          {/* Condition */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Condition *</label>
            <select value={form.condition} onChange={set("condition")}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Ward */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Ward</label>
            <select value={form.ward} onChange={set("ward")}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          {/* Admit Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Admit Date</label>
            <input
              type="date" value={form.admitDate} onChange={set("admitDate")}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (valid) { onSave(form); onClose(); } }} disabled={!valid}>
            <Check className="w-4 h-4 mr-1" />{mode === "add" ? "Add Patient" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Delete Confirmation Dialog ────────────────────────────────────────────
const DeleteDialog = ({
  open, onClose, onConfirm, patientName,
}: { open: boolean; onClose: () => void; onConfirm: () => void; patientName: string }) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>❌ Remove Patient</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground py-2">
        Are you sure you want to remove <span className="font-semibold text-foreground">{patientName}</span> from the system?
        This action cannot be undone.
      </p>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>
          <Trash2 className="w-4 h-4 mr-1" /> Remove Patient
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ── Main Transfer / Patient Management Page ───────────────────────────────
const TransferPage = () => {
  const { toast } = useToast();
  const [patients, setPatients] = React.useState<ManagedPatient[]>(INITIAL_PATIENTS);
  const [query, setQuery] = React.useState("");
  const [filterCondition, setFilterCondition] = React.useState<Condition | "All">("All");

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"add" | "edit">("add");
  const [formInitial, setFormInitial] = React.useState<Omit<ManagedPatient, "id">>(emptyForm());
  const [editingId, setEditingId] = React.useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingPatient, setDeletingPatient] = React.useState<ManagedPatient | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.bedId.toLowerCase().includes(q) || p.ward.toLowerCase().includes(q);
      const matchC = filterCondition === "All" || p.condition === filterCondition;
      return matchQ && matchC;
    });
  }, [patients, query, filterCondition]);

  const stats = React.useMemo(() => ({
    total: patients.length,
    critical: patients.filter((p) => p.condition === "Critical").length,
    serious: patients.filter((p) => p.condition === "Serious").length,
    stable: patients.filter((p) => p.condition === "Stable" || p.condition === "Fair").length,
  }), [patients]);

  const openAdd = () => { setFormMode("add"); setFormInitial(emptyForm()); setEditingId(null); setFormOpen(true); };
  const openEdit = (p: ManagedPatient) => {
    const { id, ...rest } = p;
    setFormMode("edit"); setFormInitial(rest); setEditingId(id); setFormOpen(true);
  };
  const openDelete = (p: ManagedPatient) => { setDeletingPatient(p); setDeleteOpen(true); };

  const handleSave = (form: Omit<ManagedPatient, "id">) => {
    if (formMode === "add") {
      const newP: ManagedPatient = { ...form, id: ++nextId, bedId: form.bedId.toUpperCase() };
      setPatients((prev) => [newP, ...prev]);
      toast({ title: "✅ Patient Added", description: `${form.name} admitted to ${form.ward} · Bed ${form.bedId.toUpperCase()}` });
    } else {
      setPatients((prev) => prev.map((p) => p.id === editingId ? { ...form, id: p.id, bedId: form.bedId.toUpperCase() } : p));
      toast({ title: "✏️ Patient Updated", description: `${form.name}'s record has been updated.` });
    }
  };

  const handleDelete = () => {
    if (!deletingPatient) return;
    setPatients((prev) => prev.filter((p) => p.id !== deletingPatient.id));
    toast({ title: "Patient Removed", description: `${deletingPatient.name} has been removed from the system.`, variant: "destructive" });
    setDeletingPatient(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Patient Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Add, edit, transfer, and manage ICU patient records</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Patients", value: stats.total, color: "text-foreground" },
          { label: "Critical", value: stats.critical, color: "text-destructive" },
          { label: "Serious", value: stats.serious, color: "text-orange-500" },
          { label: "Stable / Fair", value: stats.stable, color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-52 border rounded-md bg-card px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text" placeholder="Search by name, bed, or ward…" value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none"
          />
          {query && <button type="button" onClick={() => setQuery("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        {/* Condition filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["All", ...CONDITIONS] as const).map((c) => (
            <button key={c} type="button" onClick={() => setFilterCondition(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterCondition === c ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-secondary/50"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b bg-secondary/30 flex items-center justify-between">
          <span className="text-sm font-semibold">Patients ({filtered.length})</span>
          {filterCondition !== "All" && (
            <button type="button" onClick={() => setFilterCondition("All")} className="text-xs text-primary hover:underline">Clear filter</button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <UserRound className="w-10 h-10 mb-3 opacity-30" />
            <div className="text-sm">No patients match your search.</div>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {p.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.age}y · {p.ward} · Bed {p.bedId} · Admitted {p.admitDate}</div>
                </div>
                {/* Condition badge */}
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${conditionColor[p.condition]}`}>
                  {p.condition}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8 p-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openDelete(p)} className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PatientFormModal
        open={formOpen} onClose={() => setFormOpen(false)}
        onSave={handleSave} initial={formInitial} mode={formMode}
      />
      <DeleteDialog
        open={deleteOpen} onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete} patientName={deletingPatient?.name ?? ""}
      />
    </div>
  );
};

export default TransferPage;
