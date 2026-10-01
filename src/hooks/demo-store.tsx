"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { todayISO } from "@/lib/dates";
import {
  applyAction,
  createBooking,
  getAvailableRooms,
  parseStored,
  restoreDemoData,
  summarize,
  type CreateInput,
} from "@/services/demo/rules";
import { clearDemoState, readDemoRaw, subscribeDemo, writeDemoState } from "@/services/demo/storage";
import type { DemoAction, DemoSearch, DemoState } from "@/services/demo/types";

type DemoStore = {
  state: DemoState;
  search: (query: DemoSearch) => ReturnType<typeof getAvailableRooms>;
  requestStay: (input: CreateInput) => ReturnType<typeof createBooking>;
  act: (bookingId: string, action: DemoAction) => ReturnType<typeof applyAction>;
  restore: () => void;
  metrics: ReturnType<typeof summarize>;
};

const DemoContext = createContext<DemoStore | null>(null);
const serverSnapshot = () => "";

function stateFromRaw(raw: string): DemoState {
  if (!raw) return restoreDemoData(todayISO());
  return parseStored(raw) ?? restoreDemoData(todayISO());
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribeDemo, readDemoRaw, serverSnapshot);
  const state = useMemo(() => stateFromRaw(raw), [raw]);

  const store = useMemo<DemoStore>(() => {
    const current = () => stateFromRaw(readDemoRaw());
    return {
      state,
      search: (query) => getAvailableRooms(state, query),
      requestStay: (input) => {
        const result = createBooking(current(), input, { today: todayISO() });
        if (result.ok) writeDemoState(result.data.state);
        return result;
      },
      act: (bookingId, action) => {
        const result = applyAction(current(), bookingId, action);
        if (result.ok) writeDemoState(result.data);
        return result;
      },
      restore: () => {
        clearDemoState();
        writeDemoState(restoreDemoData(todayISO()));
      },
      metrics: summarize(state),
    };
  }, [state]);

  return <DemoContext.Provider value={store}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const store = useContext(DemoContext);
  if (!store) {
    throw new Error("useDemoStore precisa do DemoProvider.");
  }
  return store;
}

export function useDemoStoreOptional() {
  return useContext(DemoContext);
}
