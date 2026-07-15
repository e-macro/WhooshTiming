import { create } from "zustand";

/**
 * Replay engine state.
 * `cursor` is the "current race time" (ms since session date_start).
 * All timing components subscribe to this store and render only records
 * whose `date` <= cursor. Data source (replay vs real live polling)
 * is swappable without touching the UI.
 */
interface ReplayState {
  cursor: number;          // ms from session start
  duration: number;        // total session length, ms
  speed: 1 | 10 | 30;
  isPlaying: boolean;

  play: () => void;
  pause: () => void;
  seek: (ms: number) => void;
  setSpeed: (speed: ReplayState["speed"]) => void;
  setDuration: (ms: number) => void;
  /** Advance cursor by real elapsed ms * speed (called from a rAF/interval tick). */
  tick: (elapsedMs: number) => void;
  reset: () => void
}

const initialState: Pick<ReplayState, 'cursor' | 'duration' | 'speed' | 'isPlaying'> = { cursor: 0, duration: 0, speed: 10, isPlaying: false}

export const useReplayStore = create<ReplayState>((set) => ({
  ...initialState,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  seek: (ms) => set((s) => ({ cursor: Math.min(Math.max(ms, 0), s.duration) })),
  setSpeed: (speed) => set({ speed }),
  setDuration: (ms) => set({ duration: ms }),
  tick: (elapsedMs) =>
    set((s) => {
      if (!s.isPlaying) return s;
      const next = s.cursor + elapsedMs * s.speed;
      if (next >= s.duration) return { cursor: s.duration, isPlaying: false };
      return { cursor: next };
    }),
    reset: () => set(initialState)
}));
