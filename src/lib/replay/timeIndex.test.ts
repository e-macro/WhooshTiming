import { describe, it, expect } from "vitest";
import { annotatePb, buildLapMilestones, buildSessionBest, buildTimeIndex, searchLatest, type CompletedLap, type LapPoint } from "./timeIndex";
import type { Position } from "../types/openf1";

const makePosition = (overrides: Partial<Position> = {}): Position => ({
    session_key: 1,
    driver_number: 1,
    position: 1,
    date: '2025-01-01T00:00:00+00:00',
    ...overrides
})

const makeLapPoint = (overrides: Partial<LapPoint> = {}): LapPoint => ({
    t: 0,
    duration: 100,
    lapNumber: 1,
    isPb: false,
    ...overrides
})

const makeCompletedLap = (overrides: Partial<CompletedLap> = {}): CompletedLap => ({
    session_key: 1,
    driver_number: 1,
    lap_number: 1,
    lap_duration: 90, // seconds; null for in/out laps
    duration_sector_1: 20,
    duration_sector_2: 35,
    duration_sector_3: 35,
    is_pit_out_lap: false,
    date_start: '2025-01-01T00:00:00+00:00',
    ...overrides
})

describe('searchLatest', () => {
    it('returns the last point with t <= cursor', () => {
        const points = [{ t: 10 }, { t: 30 }, { t: 50 }];
        const result = searchLatest(points, 35);
        expect(result).toEqual({ t: 30})
    })
    it('returns the point where cursor equals its t exactly', () => {
        const points = [{ t: 10 }, { t: 30 }, { t: 50 }];
        const result = searchLatest(points, 30);
        expect(result).toEqual({ t: 30})
    })
    it('returns null before first point', () => {
        const points = [{ t: 10 }, { t: 30 }, { t: 50 }];
        const result = searchLatest(points, 5);
        expect(result).toEqual(null)
    })
    it('returns last point after reaching it', () => {
        const points = [{ t: 10 }, { t: 30 }, { t: 50 }];
        const result = searchLatest(points, 60);
        expect(result).toEqual({ t: 50 })
    })
    it('returns null for empty array', () => {
        const result = searchLatest([], 0);
        expect(result).toEqual(null)
    })
})

describe('buildTimeIndex', () => {
    it('groups records by driver number', () => {
        const records = [
            makePosition({ driver_number: 1}),
            makePosition({ driver_number: 44}),
            makePosition({ driver_number: 1})
        ]
        const index = buildTimeIndex(records, 0, r => ({ position: r.position}), r => new Date(r.date).getTime())
        expect(index.get(1)).toHaveLength(2)
        expect(index.get(44)).toHaveLength(1);
    })
})

describe('annotatePb', () => {
    it('identifies personal best laps', () => {
        const laps = [
            makeLapPoint({ duration: 100 }),
            makeLapPoint({ duration: 110 }),
            makeLapPoint({ duration: 90 })
        ]
        const index = new Map([[1, laps]])
        annotatePb(index)
        expect(index.get(1)![0].isPb).toBe(true)
        expect(index.get(1)![1].isPb).toBe(false)
        expect(index.get(1)![2].isPb).toBe(true)
    })
    it('tracks personal bests independently per driver', () => {
        const index = new Map([
            [1, [makeLapPoint({ duration: 90})]],
            [44, [makeLapPoint({ duration: 100})]]
        ])
        annotatePb(index)
        expect(index.get(1)![0].isPb).toBe(true)
        expect(index.get(44)![0].isPb).toBe(true)
    })
})

const START = Date.parse('2025-01-01T00:00:00+00:00')

describe('buildSessionBest', () => {
    it('identifies fastest lap throughout the race at a certain time point', () => {
        const laps = [
            makeCompletedLap({ lap_duration: 90}),
            makeCompletedLap({ lap_duration: 85, date_start: '2025-01-01T01:00:00+00:00'}),
            makeCompletedLap({ lap_duration: 100, date_start: '2025-01-01T02:00:00+00:00'})
        ]
        const best = buildSessionBest(laps, START)
        expect(best).toEqual([
            { t: 90000, best: 90},
            { t: 3685000, best: 85}
        ])
    })
})

describe('buildLapMilestones', () => {
    it('creates a milestone for each new max', () => {
        const laps = [
            makeCompletedLap({ lap_number: 1}),
            makeCompletedLap({ lap_number: 2, date_start: '2025-01-01T00:01:30+00:00'}),
            makeCompletedLap({ lap_number: 3, date_start: '2025-01-01T00:03:00+00:00'})
        ]
        const milestones = buildLapMilestones(laps, START)
        expect(milestones).toEqual([
            { t: 90000, lapNumber: 1},
            { t: 180000, lapNumber: 2},
            { t: 270000, lapNumber: 3}
        ])
    })
    it('ignores laps thar don`t beat the current max', () => {
        const mixedLaps = [
            makeCompletedLap({ lap_number: 1, driver_number: 1 }),
            makeCompletedLap({ lap_number: 2, driver_number: 1, date_start: '2025-01-01T00:01:30+00:00' }),
            makeCompletedLap({ lap_number: 1, driver_number: 4, date_start: '2025-01-01T00:03:00+00:00' })
        ]
        const mixedMilestones = buildLapMilestones(mixedLaps, START)
        expect(mixedMilestones).toHaveLength(2)
        expect(mixedMilestones.map(m => m.lapNumber)).toEqual([1, 2])
    })
    it('tracks lap_number, not lap_duration (regression)', () => {
        const regressedLaps = [
            makeCompletedLap({ lap_number: 1, lap_duration: 500 }),
            makeCompletedLap({ lap_number: 2, lap_duration: 999, date_start: '2025-01-01T00:18:00+00:00'})
        ]
        const regressedMilestones = buildLapMilestones(regressedLaps, START)
        expect(regressedMilestones.map(m => m.lapNumber)).toEqual([1, 2])
    })
    it('returns empty array for empty input', () => {
    expect(buildLapMilestones([], 0)).toEqual([])
    })
})
