export type RiskLabel = "High" | "Medium" | "Low";

export type DiagnosisStatus = "Active" | "Chronic" | "Resolved";

export type ICUType =
  | "MICU"
  | "SICU"
  | "NICU"
  | "PICU"
  | "CCU"
  | "Neuro ICU"
  | "Burn ICU"
  | "TICU"
  | "PACU"
  | "General ICU";

export type CareLevel = "Level I" | "Level II" | "Level III";

export type Pod = {
  id: string;
  label: string;
};

export type VitalsSnapshot = {
  t: number;
  hr: number;
  spo2: number;
  map: number;
  score: number;
};

export type Patient = {
  name: string;
  age: number;
  bed: string;
  risk: RiskLabel;
  score: number;
  hr: number;
  spo2: number;
  map: number;
  admitted: string;
  icuType: ICUType;
  careLevel: CareLevel;
  pod: string;
  bloodGroup: string;
  weightKg: number;
  heightCm: number;
  emergencyContact: { name: string; relation: string; phone: string };
  primaryPhysician: string;
  allergies: string[];
  diagnosisHistory: Array<{ label: string; status: DiagnosisStatus; year: number }>;
  pastMedicalHistory: Array<{ label: string; year: number }>;
  medications: { current: string[]; past: string[] };
  familyHistory: string[];
  lifestyle: { smoking: string; alcohol: string; exercise: string };
  labReports: Array<{ name: string; date: string; type: string; url: string }>;
  timeline: Array<{ year: number; text: string }>;
  // New fields for AI / backend alignment
  shap: Record<string, number>;
  suggestions: string[];
  alertStatus: "active" | "acknowledged" | "dismissed";
  vitalsHistory: VitalsSnapshot[];
};

const DEFAULT_PODS: Pod[] = [
  { id: "pod-a", label: "Pod A (10 beds)" },
  { id: "pod-b", label: "Pod B (8 beds)" },
  { id: "pod-c", label: "Pod C (12 beds)" },
  { id: "pod-d", label: "Pod D (10 beds)" },
];

export const wardPods: Record<ICUType, Pod[]> = {
  MICU: DEFAULT_PODS,
  SICU: DEFAULT_PODS,
  NICU: DEFAULT_PODS,
  PICU: DEFAULT_PODS,
  CCU: DEFAULT_PODS,
  "Neuro ICU": DEFAULT_PODS,
  "Burn ICU": DEFAULT_PODS,
  TICU: DEFAULT_PODS,
  PACU: DEFAULT_PODS,
  "General ICU": DEFAULT_PODS,
};

// Helper: generate a plausible vitals history for the last 24 "ticks"
function makeHistory(
  baseHr: number,
  baseSpo2: number,
  baseMap: number,
  baseScore: number,
  trend: "rising" | "stable" | "falling"
): VitalsSnapshot[] {
  return Array.from({ length: 24 }, (_, i) => {
    const progress = i / 23;
    const trendFactor =
      trend === "rising" ? progress * 25 : trend === "falling" ? -progress * 10 : 0;
    const noise = Math.sin(i / 3) * 4 + Math.cos(i / 5) * 2;
    const hr = Math.round(Math.max(50, Math.min(180, baseHr + trendFactor * 0.8 + noise)));
    const spo2 = Math.round(Math.max(80, Math.min(100, baseSpo2 - trendFactor * 0.15 + noise * 0.2)));
    const map = Math.round(Math.max(50, Math.min(120, baseMap - trendFactor * 0.4 + noise * 0.5)));
    const score = Math.round(Math.max(0, Math.min(100, baseScore - 20 + trendFactor * 0.8 + noise)));
    return { t: i, hr, spo2, map, score };
  });
}

export const patients: Patient[] = [
  {
    name: "John Doe",
    age: 68,
    bed: "A1",
    risk: "High",
    score: 87,
    hr: 132,
    spo2: 89,
    map: 66,
    admitted: "Apr 19, 2024",
    icuType: "MICU",
    careLevel: "Level III",
    pod: "Pod A (10 beds)",
    bloodGroup: "O+",
    weightKg: 78,
    heightCm: 175,
    emergencyContact: { name: "Mary Doe", relation: "Spouse", phone: "+1 (555) 013-2210" },
    primaryPhysician: "Dr. Smith",
    allergies: ["Penicillin", "Peanuts"],
    diagnosisHistory: [
      { label: "Septic Shock", status: "Active", year: 2026 },
      { label: "Type 2 Diabetes", status: "Chronic", year: 2018 },
      { label: "Hypertension", status: "Chronic", year: 2015 },
    ],
    pastMedicalHistory: [
      { label: "Appendectomy", year: 2012 },
      { label: "Fractured Arm", year: 2019 },
      { label: "Asthma (Childhood)", year: 1990 },
    ],
    medications: {
      current: ["Metformin", "Insulin", "Amlodipine"],
      past: ["Antibiotics (2023)", "Painkillers (post surgery)"],
    },
    familyHistory: ["Heart Disease (Father)", "Diabetes (Mother)", "Cancer (Grandparent)"],
    lifestyle: { smoking: "No", alcohol: "Occasional", exercise: "Low" },
    labReports: [
      { name: "CBC (Blood Test)", date: "Mar 02, 2026", type: "Blood Test", url: "" },
      { name: "ECG", date: "Feb 21, 2026", type: "ECG", url: "" },
      { name: "Chest X-Ray", date: "Jan 15, 2026", type: "Imaging", url: "" },
    ],
    timeline: [
      { year: 2015, text: "Diagnosed with Hypertension" },
      { year: 2018, text: "Type 2 Diabetes detected" },
      { year: 2019, text: "Arm fracture treated" },
      { year: 2023, text: "Infection treated with antibiotics" },
      { year: 2026, text: "ICU admission (Septic Shock)" },
    ],
    shap: { spo2: -0.38, lactate: 0.28, hr: 0.22, map: -0.19, wbc: 0.14, temp: 0.07 },
    suggestions: [
      "Fluid resuscitation (30 mL/kg IV bolus)",
      "Broad-spectrum antibiotics immediately",
      "Repeat blood cultures × 2 before antibiotics",
      "Vasopressors if MAP < 65 mmHg persists",
    ],
    alertStatus: "active",
    vitalsHistory: makeHistory(100, 93, 72, 60, "rising"),
  },
  {
    name: "Jane Smith",
    age: 62,
    bed: "A2",
    risk: "Medium",
    score: 62,
    hr: 110,
    spo2: 94,
    map: 78,
    admitted: "Apr 12, 2024",
    icuType: "MICU",
    careLevel: "Level II",
    pod: "Pod A (10 beds)",
    bloodGroup: "A+",
    weightKg: 64,
    heightCm: 168,
    emergencyContact: { name: "Robert Smith", relation: "Partner", phone: "+1 (555) 019-8834" },
    primaryPhysician: "Dr. Kumar",
    allergies: ["Dust Allergy"],
    diagnosisHistory: [
      { label: "Respiratory Infection", status: "Active", year: 2026 },
      { label: "Hypertension", status: "Chronic", year: 2017 },
      { label: "Anemia", status: "Resolved", year: 2020 },
    ],
    pastMedicalHistory: [{ label: "Gallbladder surgery", year: 2014 }],
    medications: { current: ["Amlodipine", "Azithromycin"], past: ["Iron supplements (2020)"] },
    familyHistory: ["Diabetes (Mother)", "Stroke (Father)"],
    lifestyle: { smoking: "No", alcohol: "No", exercise: "Moderate" },
    labReports: [
      { name: "Blood Culture", date: "Mar 05, 2026", type: "Blood Test", url: "" },
      { name: "ECG", date: "Feb 10, 2026", type: "ECG", url: "" },
    ],
    timeline: [
      { year: 2014, text: "Gallbladder surgery" },
      { year: 2017, text: "Diagnosed with Hypertension" },
      { year: 2020, text: "Anemia resolved" },
      { year: 2026, text: "Admitted for respiratory infection" },
    ],
    shap: { hr: 0.18, spo2: -0.14, wbc: 0.12, map: -0.08, temp: 0.06, lactate: 0.04 },
    suggestions: [
      "Continue Azithromycin course",
      "Monitor SpO2 — supplement O2 if < 92%",
      "Incentive spirometry every 4h",
    ],
    alertStatus: "acknowledged",
    vitalsHistory: makeHistory(95, 96, 80, 45, "stable"),
  },
  {
    name: "Rahul Sharma",
    age: 54,
    bed: "B1",
    risk: "High",
    score: 42,
    hr: 82,
    spo2: 98,
    map: 92,
    admitted: "Apr 21, 2024",
    icuType: "SICU",
    careLevel: "Level II",
    pod: "Pod B (8 beds)",
    bloodGroup: "B+",
    weightKg: 74,
    heightCm: 172,
    emergencyContact: { name: "Anita Sharma", relation: "Spouse", phone: "+1 (555) 010-7744" },
    primaryPhysician: "Dr. Lee",
    allergies: ["None known"],
    diagnosisHistory: [
      { label: "Sepsis (suspected)", status: "Active", year: 2026 },
      { label: "Type 2 Diabetes", status: "Chronic", year: 2016 },
    ],
    pastMedicalHistory: [{ label: "Knee surgery", year: 2011 }],
    medications: { current: ["Metformin", "IV Fluids"], past: ["Painkillers (2011)"] },
    familyHistory: ["Heart Disease (Father)"],
    lifestyle: { smoking: "Yes", alcohol: "Occasional", exercise: "Low" },
    labReports: [{ name: "CBC (Blood Test)", date: "Mar 08, 2026", type: "Blood Test", url: "" }],
    timeline: [
      { year: 2011, text: "Knee surgery" },
      { year: 2016, text: "Type 2 Diabetes detected" },
      { year: 2026, text: "ICU evaluation for suspected sepsis" },
    ],
    shap: { wbc: 0.20, lactate: 0.15, temp: 0.10, hr: 0.08, spo2: -0.05, map: -0.04 },
    suggestions: [
      "Blood cultures before antibiotics",
      "IV fluids 30 mL/kg bolus",
      "Monitor lactate — repeat in 2h",
    ],
    alertStatus: "active",
    vitalsHistory: makeHistory(78, 97, 90, 30, "stable"),
  },
  {
    name: "Emily Wong",
    age: 60,
    bed: "B0",
    risk: "Low",
    score: 18,
    hr: 75,
    spo2: 99,
    map: 92,
    admitted: "Apr 21, 2024",
    icuType: "PACU",
    careLevel: "Level II",
    pod: "Pod B (8 beds)",
    bloodGroup: "AB+",
    weightKg: 58,
    heightCm: 162,
    emergencyContact: { name: "Kevin Wong", relation: "Spouse", phone: "+1 (555) 012-1156" },
    primaryPhysician: "Dr. Smith",
    allergies: ["Peanuts"],
    diagnosisHistory: [{ label: "Post-op recovery", status: "Active", year: 2026 }],
    pastMedicalHistory: [{ label: "Hip replacement", year: 2025 }],
    medications: { current: ["Pain management"], past: ["Antibiotics (2025)"] },
    familyHistory: ["Cancer (Grandparent)"],
    lifestyle: { smoking: "No", alcohol: "Occasional", exercise: "Moderate" },
    labReports: [{ name: "X-Ray (Post-op)", date: "Mar 01, 2026", type: "Imaging", url: "" }],
    timeline: [
      { year: 2025, text: "Hip replacement" },
      { year: 2026, text: "Post-op recovery monitoring" },
    ],
    shap: { map: 0.05, hr: 0.04, spo2: -0.02, temp: 0.02, wbc: 0.01, lactate: 0.01 },
    suggestions: [
      "Standard post-op monitoring",
      "Pain management as charted",
      "Mobilise when stable",
    ],
    alertStatus: "dismissed",
    vitalsHistory: makeHistory(74, 99, 91, 12, "falling"),
  },
  {
    name: "Parul Verna",
    age: 62,
    bed: "B2",
    risk: "Low",
    score: 12,
    hr: 75,
    spo2: 99,
    map: 93,
    admitted: "Apr 21, 2024",
    icuType: "General ICU",
    careLevel: "Level I",
    pod: "Pod C (12 beds)",
    bloodGroup: "O-",
    weightKg: 70,
    heightCm: 166,
    emergencyContact: { name: "Ravi Verna", relation: "Brother", phone: "+1 (555) 013-5402" },
    primaryPhysician: "Dr. Kumar",
    allergies: ["Dust Allergy"],
    diagnosisHistory: [{ label: "Observation", status: "Active", year: 2026 }],
    pastMedicalHistory: [{ label: "Hospitalization (2019)", year: 2019 }],
    medications: { current: ["None"], past: ["Antibiotics (2019)"] },
    familyHistory: ["Diabetes (Mother)"],
    lifestyle: { smoking: "No", alcohol: "No", exercise: "Low" },
    labReports: [{ name: "Blood Test", date: "Mar 09, 2026", type: "Blood Test", url: "" }],
    timeline: [
      { year: 2019, text: "Hospitalization for infection" },
      { year: 2026, text: "Observation unit admission" },
    ],
    shap: { map: 0.03, hr: 0.02, spo2: -0.01, temp: 0.01, wbc: 0.01, lactate: 0.00 },
    suggestions: [
      "Routine observation",
      "Discharge planning if stable after 24h",
    ],
    alertStatus: "dismissed",
    vitalsHistory: makeHistory(74, 99, 92, 10, "falling"),
  },
  {
    name: "David Park",
    age: 53,
    bed: "B4",
    risk: "High",
    score: 78,
    hr: 88,
    spo2: 91,
    map: 70,
    admitted: "Apr 21, 2024",
    icuType: "CCU",
    careLevel: "Level III",
    pod: "Pod D (10 beds)",
    bloodGroup: "B-",
    weightKg: 82,
    heightCm: 180,
    emergencyContact: { name: "Soo Park", relation: "Spouse", phone: "+1 (555) 017-4481" },
    primaryPhysician: "Dr. Lee",
    allergies: ["Penicillin"],
    diagnosisHistory: [
      { label: "Septic Shock", status: "Active", year: 2026 },
      { label: "Hypertension", status: "Chronic", year: 2014 },
    ],
    pastMedicalHistory: [{ label: "Shoulder injury", year: 2019 }],
    medications: { current: ["IV Antibiotics", "Fluids"], past: ["Painkillers (2019)"] },
    familyHistory: ["Heart Disease (Father)", "Hypertension (Mother)"],
    lifestyle: { smoking: "No", alcohol: "Occasional", exercise: "Low" },
    labReports: [{ name: "ECG", date: "Mar 06, 2026", type: "ECG", url: "" }],
    timeline: [
      { year: 2014, text: "Diagnosed with Hypertension" },
      { year: 2019, text: "Shoulder injury treated" },
      { year: 2026, text: "ICU admission (Septic Shock)" },
    ],
    shap: { spo2: -0.30, map: -0.22, lactate: 0.18, hr: 0.15, wbc: 0.12, temp: 0.08 },
    suggestions: [
      "IV antibiotics — continue current regimen",
      "Vasopressor support if MAP < 65",
      "Echocardiogram to assess cardiac function",
      "Daily lactate monitoring",
    ],
    alertStatus: "active",
    vitalsHistory: makeHistory(80, 94, 75, 55, "rising"),
  },
];
