import { useMemo } from "react";
import type { Interval, Lap, Pit, Position, Stint } from "../types/openf1";
import { annotatePb, buildSessionBest, buildTimeIndex, type CompletedLap } from "../replay/timeIndex";
import { buildStintIndex } from "../replay/stints";

export function useSessionIndexes(positions: Position[], intervals: Interval[], laps:Lap[], pits: Pit[], stints: Stint[], sessionStartMs: number) {
    const positionIndex = useMemo(() => buildTimeIndex(positions, sessionStartMs, r => ({position: r.position}), r => new Date(r.date).getTime()), [positions, sessionStartMs])
    const intervalIndex = useMemo(() => buildTimeIndex(intervals, sessionStartMs, r => ({ gap: r.gap_to_leader, interval: r.interval}), r => new Date(r.date).getTime()), [intervals, sessionStartMs])
    const completedLaps = useMemo(() => laps.filter((lap): lap is CompletedLap => lap.lap_duration !== null), [laps])
    const lapIndex = useMemo(() => {
        const idx = buildTimeIndex(completedLaps, sessionStartMs, r => ({duration: r.lap_duration, lapNumber: r.lap_number, isPb: false}), r => new Date(r.date_start).getTime() + r.lap_duration * 1000)
        annotatePb(idx)
        return idx
    }, [completedLaps, sessionStartMs])
    const sessionBest = useMemo(() => buildSessionBest(completedLaps, sessionStartMs), [completedLaps, sessionStartMs])
    const pitIndex = useMemo(() => buildTimeIndex(pits, sessionStartMs, r => ({pitDuration: r.pit_duration}), r => new Date(r.date).getTime() - r.pit_duration * 1000), [pits, sessionStartMs])
    const stintIndex = useMemo(() => buildStintIndex(stints), [stints])
    return { positionIndex, intervalIndex, lapIndex, sessionBest, completedLaps, pitIndex, stintIndex }
}