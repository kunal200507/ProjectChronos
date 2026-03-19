import React, { useState } from "react";

/* ─── Tiny Sparkline ─────────────────────────────────────────────────── */
function Sparkline({ data, color = "#b0cfe8", height = 36, width = 160 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const fillPts = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Risk Circle ─────────────────────────────────────────────────────── */
function RiskCircle({ score }) {
  const bg =
    score >= 80 ? "#e84444"
    : score >= 55 ? "#f5a623"
    : score >= 30 ? "#4ab8e0"
    : "#4caf7d";
  return (
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: `0 4px 14px ${bg}55`,
      position: "relative",
    }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px" }}>
        {score}{score < 30 ? "%" : ""}
      </span>
      {/* small dot indicator */}
      <span style={{
        position: "absolute", top: 4, right: 4,
        width: 7, height: 7, borderRadius: "50%",
        background: "#fff", opacity: 0.7,
      }} />
    </div>
  );
}

/* ─── Patient data ────────────────────────────────────────────────────── */
const patients = [
  {
    name: "John Doe", age: 68, bed: "A1", risk: 87,
    hr: 132, spo2: 89, bp: 66,
    hrLabel: "HR, Sa·2", spo2Label: "BPCI", bpLabel: "Δmg",
    spo2Dot: "#e84444", bpDot: "#f5a623",
    sparkColor: "#94b8d8",
    sparkData: [60,58,62,55,65,60,58,62,60,57,63,59],
  },
  {
    name: "Jane Smith", age: null, bed: "A2", risk: 62,
    hr: 110, spo2: 94, bp: 78,
    hrLabel: "HR: Sa·2", spo2Label: "BRAD", bpLabel: "mmhg",
    spo2Dot: "#f5a623", bpDot: "#f5a623",
    sparkColor: "#94b8d8",
    sparkData: [50,54,52,58,56,54,52,55,56,52,54,53],
  },
  {
    name: "Rahul Sharma", age: 84, bed: "B1", risk: 18,
    hr: 82, spo2: null, bp: 92,
    hrLabel: "HR: Za·3", spo2Label: "", bpLabel: "mmhg",
    spo2Dot: "", bpDot: "#4caf7d",
    sparkColor: "#f0c87a",
    sparkData: [48,50,49,52,51,49,50,51,50,52,50,49],
  },
  {
    name: "Emily Wong", age: null, bed: "60", risk: 18,
    hr: 75, spo2: 99, bp: 92,
    hrLabel: "HR, St·a", spo2Label: "BPCI", bpLabel: "mmhg",
    spo2Dot: "", bpDot: "#4caf7d",
    sparkColor: "#94c8e8",
    sparkData: [45,47,46,50,48,46,48,47,46,48,47,46],
    isPercent: true,
  },
  {
    name: "Jade Worg", age: null, bed: "62", risk: 18,
    hr: 75, spo2: 99, bp: 93,
    hrLabel: "HR: St·a", spo2Label: "MAP·", bpLabel: "mmhg",
    spo2Dot: "", bpDot: "#4caf7d",
    sparkColor: "#94c8e8",
    sparkData: [44,46,45,48,47,45,47,46,45,47,46,45],
    isPercent: true,
  },
  {
    name: "Emily Wong", age: 62, bed: "63", risk: 18,
    hr: 75, spo2: null, bp: 93,
    hrLabel: "HR: Str·a", spo2Label: "", bpLabel: "mmhg",
    spo2Dot: "", bpDot: "#4caf7d",
    sparkColor: "#94c8e8",
    sparkData: [43,45,44,47,46,44,46,45,44,46,45,44],
    isPercent: true,
  },
];

/* ─── Nav items ───────────────────────────────────────────────────────── */
const navItems = [
  {
    key: "dashboard", label: "ICU Dashboard",
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#4ab8e0" : "#9baab8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    key: "patients", label: "Patients",
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#4ab8e0" : "#9baab8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    key: "alerts", label: "Alerts",
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#4ab8e0" : "#9baab8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  {
    key: "vitals", label: "Vitals",
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#4ab8e0" : "#9baab8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    key: "transfer", label: "Transfer",
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#4ab8e0" : "#9baab8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3v18M11 21L3 13h14M21 3l-8 8H3"/>
      </svg>
    ),
  },
  {
    key: "reports", label: "Reports",
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#4ab8e0" : "#9baab8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"/>
      </svg>
    ),
  },
  {
    key: "settings", label: "Settings",
    icon: (active) => (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#4ab8e0" : "#9baab8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

/* ─── Patient Card ────────────────────────────────────────────────────── */
function PatientCard({ p }) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 16,
      padding: "18px 20px 16px",
      boxShadow: "0 2px 12px rgba(100,130,170,0.10)",
      display: "flex", flexDirection: "column", gap: 0,
      cursor: "pointer",
      transition: "box-shadow 0.2s, transform 0.2s",
      border: "1px solid #edf1f7",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(74,184,224,0.18)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(100,130,170,0.10)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#1a2b42", letterSpacing: "-0.3px" }}>{p.name}</span>
            {p.age && <span style={{ fontSize: 14, color: "#9baab8", fontWeight: 400 }}>{p.age}</span>}
          </div>
          <div style={{ fontSize: 12, color: "#9baab8", marginTop: 2 }}>Bed · {p.bed}</div>
        </div>
        <RiskCircle score={p.risk} />
      </div>

      {/* Sparkline */}
      <div style={{ margin: "12px 0 10px", overflow: "hidden" }}>
        <Sparkline data={p.sparkData} color={p.sparkColor} height={38} width={220} />
      </div>

      {/* Vitals row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 0, borderTop: "1px solid #f0f4f8", paddingTop: 12 }}>
        {/* HR */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#1a2b42" }}>{p.hr}</span>
            <span style={{ fontSize: 11, color: "#9baab8", fontWeight: 500 }}>bpm</span>
          </div>
          <div style={{ fontSize: 10, color: "#b0bfcc", marginTop: 1 }}>{p.hrLabel}</div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: "#edf1f7", margin: "0 14px" }} />

        {/* SpO2 */}
        {p.spo2 && (
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#1a2b42" }}>{p.spo2}</span>
              <span style={{ fontSize: 11, color: "#9baab8", fontWeight: 500 }}>%</span>
            </div>
            <div style={{ fontSize: 10, color: "#b0bfcc", marginTop: 1 }}>{p.spo2Label}</div>
          </div>
        )}

        {/* BP */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {p.bpDot && (
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: p.bpDot, display: "inline-block", flexShrink: 0,
            }} />
          )}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#1a2b42" }}>{p.bp}</span>
            </div>
            <div style={{ fontSize: 10, color: "#b0bfcc", marginTop: 1 }}>{p.bpLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [search, setSearch] = useState("");

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    `${p.bed}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "#f0f4f9",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* ══ SIDEBAR ════════════════════════════════════════════════════ */}
      <aside style={{
        width: 200,
        minWidth: 200,
        background: "#ffffff",
        borderRight: "1px solid #edf1f7",
        display: "flex",
        flexDirection: "column",
        padding: "0 0 24px",
      }}>
        {/* Logo text only */}
        <div style={{ padding: "24px 20px 28px" }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#1a2b42", letterSpacing: "0.02em" }}>
            CHRONOS
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
          {navItems.map(item => {
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "#e8f6fc" : "transparent",
                  color: active ? "#4ab8e0" : "#6b7f96",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f5f8fb"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; } }}
              >
                {item.icon(active)}
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ══ MAIN ════════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Topbar ─────────────────────────────────────────────────── */}
        <header style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 28px",
          background: "#ffffff",
          borderBottom: "1px solid #edf1f7",
          flexShrink: 0,
        }}>
          {/* Filter icon */}
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "6px", borderRadius: 8, display: "flex", alignItems: "center",
            color: "#6b7f96",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7f96" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>

          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f0f4f9", borderRadius: 24,
            padding: "8px 16px", flex: 1, maxWidth: 340,
            border: "1px solid #e4eaf2",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9baab8" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: "none", border: "none", outline: "none",
                fontSize: 13, color: "#1a2b42", flex: 1,
              }}
            />
            {/* arrow */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9baab8" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

        </header>

        {/* ── Scrollable content ──────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#1a2b42", letterSpacing: "-0.4px" }}>
              ICU Dashboard
            </h1>
          </div>

          {/* Patient grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}>
            {filtered.map((p, i) => (
              <PatientCard key={i} p={p} />
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html, body, #root {
          margin: 0; padding: 0;
          width: 100vw; height: 100vh;
          overflow: hidden;
          background: #f0f4f9;
          max-width: 100vw;
          border: none;
          text-align: left;
          display: block;
        }
        input::placeholder { color: #9baab8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d0dae6; border-radius: 2px; }
      `}</style>
    </div>
  );
}
