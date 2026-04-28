/**
 * MockDataService — generates realistic fluctuating system metrics.
 * Designed so it can be swapped for a real API (e.g. an edge function
 * polling Prometheus / OS stats) without touching the UI.
 */

export type MetricSample = {
  cpu: number;
  memory: number;
  network_in: number;
  network_out: number;
  disk: number;
  created_at: string;
};

type State = { cpu: number; memory: number; net_in: number; net_out: number; disk: number };

const state: State = { cpu: 32, memory: 54, net_in: 120, net_out: 80, disk: 41 };

function drift(value: number, min: number, max: number, volatility = 6) {
  const next = value + (Math.random() - 0.5) * volatility;
  return Math.max(min, Math.min(max, next));
}

/** Produce one sample and advance internal state. */
export function nextSample(): MetricSample {
  state.cpu = drift(state.cpu, 5, 99, 8);
  state.memory = drift(state.memory, 20, 96, 4);
  state.net_in = drift(state.net_in, 0, 1000, 60);
  state.net_out = drift(state.net_out, 0, 1000, 60);
  state.disk = drift(state.disk, 30, 95, 1.2);
  return {
    cpu: Math.round(state.cpu * 10) / 10,
    memory: Math.round(state.memory * 10) / 10,
    network_in: Math.round(state.net_in),
    network_out: Math.round(state.net_out),
    disk: Math.round(state.disk * 10) / 10,
    created_at: new Date().toISOString(),
  };
}

/** Seed an initial buffer for charts so they don't start empty. */
export function seedHistory(n = 30): MetricSample[] {
  return Array.from({ length: n }, () => nextSample());
}