export type RiskLevel = "high" | "medium" | "low";
export type RiskLabel = "High" | "Medium" | "Low";

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function scoreToRiskLabel(score: number): RiskLabel {
  const level = scoreToRiskLevel(score);
  return level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
}

