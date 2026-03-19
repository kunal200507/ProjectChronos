import * as React from "react";
import { patients as basePatients, type Patient } from "@/data/patients";
import { toast } from "@/hooks/use-toast";

export type SimPatient = Patient & { _simHr: number; _simSpo2: number; _simMap: number; _simScore: number };

type SimulationState = {
  active: boolean;
  patients: SimPatient[];
};

const TICK_MS = 2000;

function applyNoise(base: number, amplitude: number) {
  return base + (Math.random() - 0.5) * 2 * amplitude;
}

export function useSimulation() {
  const [state, setState] = React.useState<SimulationState>(() => ({
    active: false,
    patients: basePatients.map((p) => ({
      ...p,
      _simHr: p.hr,
      _simSpo2: p.spo2,
      _simMap: p.map,
      _simScore: p.score,
    })),
  }));

  const prevHighRef = React.useRef<Set<string>>(new Set());

  // Tick: nudge vitals when simulation is active
  React.useEffect(() => {
    if (!state.active) return;
    const interval = setInterval(() => {
      setState((prev) => {
        const updated = prev.patients.map((p) => {
          const riskFactor = p._simScore >= 75 ? 1.4 : p._simScore >= 40 ? 1.0 : 0.6;
          const newHr = Math.round(Math.max(40, Math.min(200, applyNoise(p._simHr, 4 * riskFactor))));
          const newSpo2 = Math.round(Math.max(75, Math.min(100, applyNoise(p._simSpo2, 1 * riskFactor))));
          const newMap = Math.round(Math.max(40, Math.min(130, applyNoise(p._simMap, 3 * riskFactor))));
          // Derive score from vitals shift
          const scoreDelta =
            (newHr > 120 ? 2 : newHr < 60 ? 1 : 0) +
            (newSpo2 < 92 ? 3 : newSpo2 < 95 ? 1 : -0.5) +
            (newMap < 65 ? 3 : newMap > 100 ? -0.5 : 0) +
            (Math.random() - 0.4) * 1.5;
          const newScore = Math.round(Math.max(0, Math.min(100, p._simScore + scoreDelta)));
          return { ...p, _simHr: newHr, _simSpo2: newSpo2, _simMap: newMap, _simScore: newScore };
        });

        // Fire toasts for newly high-risk patients
        updated.forEach((p) => {
          const wasHigh = prevHighRef.current.has(p.name);
          if (p._simScore >= 75 && !wasHigh) {
            prevHighRef.current.add(p.name);
            toast({
              title: "🚨 High-Risk Alert",
              description: `${p.name} · Bed ${p.bed} · Risk ${p._simScore}%`,
              variant: "destructive",
            });
          } else if (p._simScore < 75 && wasHigh) {
            prevHighRef.current.delete(p.name);
          }
        });

        return { ...prev, patients: updated };
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [state.active]);

  const startSimulation = React.useCallback(() => {
    prevHighRef.current = new Set(
      basePatients.filter((p) => p.score >= 75).map((p) => p.name)
    );
    setState((prev) => ({ ...prev, active: true }));
  }, []);

  const stopSimulation = React.useCallback(() => {
    setState((prev) => ({
      active: false,
      patients: prev.patients.map((p) => ({
        ...p,
        _simHr: p.hr,
        _simSpo2: p.spo2,
        _simMap: p.map,
        _simScore: p.score,
      })),
    }));
    prevHighRef.current.clear();
  }, []);

  // "Simulate ICU Crash" — spike John Doe to critical
  const simulateCrash = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      active: true,
      patients: prev.patients.map((p) =>
        p.name === "John Doe"
          ? { ...p, _simHr: 158, _simSpo2: 82, _simMap: 55, _simScore: 96 }
          : p
      ),
    }));
    toast({
      title: "🔴 CRITICAL — ICU Crash Simulated",
      description: "John Doe · Bed A1 · Risk spiked to 96% — Septic Shock imminent",
      variant: "destructive",
    });
  }, []);

  return {
    active: state.active,
    patients: state.patients,
    startSimulation,
    stopSimulation,
    simulateCrash,
  };
}
