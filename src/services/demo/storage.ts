import { DEMO_STORAGE_KEY } from "@/services/demo/rules";
import type { DemoState } from "@/services/demo/types";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeDemo(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Snapshot estável para o useSyncExternalStore. Vazio no servidor e na hidratação. */
export function readDemoRaw() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeDemoState(state: DemoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  notify();
}

export function clearDemoState() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_STORAGE_KEY);
  notify();
}
