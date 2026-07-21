import type { Location } from "../types/openf1";
import type { CompletedLap } from "./timeIndex";

export const START = Date.parse("2026-01-01T00:00:00+00:00");
export const atSec = (s: number) => new Date(START + s * 1000).toISOString();

export const makeCompletedLap = (overrides: Partial<CompletedLap> = {}): CompletedLap => ({
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

export const makeLocation = (overrides: Partial<Location> = {}): Location => ({
    session_key: 1,
    driver_number: 1,
    x: 0,
    y: 0,
    z: 0,
    date: '2026-01-01T00:00:00+00:00',
    ...overrides,
})
