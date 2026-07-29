/**
 * @vitest-environment jsdom
 */

import { useReplayStore } from "@/store/replayStore";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReplayTick } from "./useReplayTick";

/**
 * Frames are driven by hand instead of by fake timers: a stub replaces the
 * browser's rAF and keeps the pending callbacks, so each test decides exactly
 * when a frame happens and with which timestamp.
 *
 * Two benefits over `advanceTimersByTime`: expectations become exact numbers
 * instead of thresholds tuned to a frame cadence, and cancellation is modelled
 * — a cancelled frame genuinely does not run, which is what gives the pause
 * and unmount tests something real to prove.
 */
describe("useReplayTick", () => {
    let pending: Map<number, FrameRequestCallback>;
    let nextId: number;

    /** Runs every frame scheduled so far, with the given timestamp. */
    const runFrame = (timestamp: number) => {
        const callbacks = [...pending.values()];
        pending.clear();
        act(() => { callbacks.forEach((cb) => cb(timestamp)) });
    };

    const cursor = () => useReplayStore.getState().cursor;
    const play = () => act(() => useReplayStore.getState().play());
    const pause = () => act(() => useReplayStore.getState().pause());
    const setSpeed = (speed: 1 | 10 | 30) =>
        act(() => useReplayStore.getState().setSpeed(speed));

    beforeEach(() => {
        pending = new Map();
        nextId = 1;
        vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
            const id = nextId++;
            pending.set(id, cb);
            return id;
        });
        vi.stubGlobal("cancelAnimationFrame", (id: number) => { pending.delete(id) });
        useReplayStore.getState().reset();
        useReplayStore.getState().setDuration(600_000);
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it("does not schedule frames while paused", () => {
        renderHook(() => useReplayTick());
        runFrame(0);
        runFrame(50);
        expect(cursor()).toBe(0);
    });

    it("advances the cursor by the elapsed time while playing", () => {
        renderHook(() => useReplayTick());
        setSpeed(1);
        play();
        runFrame(0);   // first frame only records the baseline timestamp
        runFrame(50);  // 50 ms elapsed at 1x
        expect(cursor()).toBe(50);
    });

    it("scales the advance by the replay speed", () => {
        renderHook(() => useReplayTick());
        setSpeed(1);
        play();
        runFrame(0);
        runFrame(50);
        expect(cursor()).toBe(50);

        setSpeed(10);
        runFrame(100); // same 50 ms gap, ten times the advance
        expect(cursor()).toBe(550);
    });

    it("clamps a huge frame gap so a sleeping tab cannot jump the cursor", () => {
        renderHook(() => useReplayTick());
        setSpeed(1);
        play();
        runFrame(0);
        runFrame(5000); // tab was asleep for five seconds
        expect(cursor()).toBe(100); // the clamp, not 5000
    });

    it("stops advancing once paused", () => {
        renderHook(() => useReplayTick());
        setSpeed(1);
        play();
        runFrame(0);
        runFrame(50);
        pause();

        // Note: this one cannot detect a leaked rAF loop — the store's `tick`
        // refuses to move while `isPlaying` is false, so a leaked frame would
        // be swallowed anyway. It documents the user-visible behaviour; the
        // unmount test below is what actually guards the cleanup.
        runFrame(100);
        runFrame(150);
        expect(cursor()).toBe(50);
    });

    it("stops advancing after unmount", () => {
        const { unmount } = renderHook(() => useReplayTick());
        setSpeed(1);
        play();
        runFrame(0);
        runFrame(50);
        unmount();

        // Two frames, not one: cleanup both cancels the pending frame and
        // resets the baseline ref. A leaked loop skips the tick on its first
        // frame (empty ref) and only reveals itself on the second.
        runFrame(100);
        runFrame(150);
        expect(cursor()).toBe(50);
    });
});
