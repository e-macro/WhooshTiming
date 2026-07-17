import { describe, expect, it } from "vitest";
import type { Stint } from "../types/openf1";
import { buildStintIndex, stintAt } from "./stints";

const makeStint = (overrides: Partial<Stint> = {}): Stint => ({
    compound: 'SOFT',
    driver_number: 1,
    lap_end: 20,
    lap_start: 1,
    meeting_key: 1,
    session_key: 1,
    stint_number: 1,
    tyre_age_at_start: 1,
    ...overrides
})

describe('stintAt', () => {
    it('finds stint at a certain lap number', () => {
        const stints = [
            makeStint(),
            makeStint({lap_start: 21, lap_end: 45, compound: 'MEDIUM', stint_number: 2}),
            makeStint({lap_start: 46, lap_end: null, compound: 'HARD', stint_number: 3})
            
        ]
        const index = buildStintIndex(stints)
        expect(stintAt(index, 1, 20)?.lap_end).toBe(20)
        expect(stintAt(index, 1, 100)?.compound).toBe('HARD')
        expect(stintAt(index, 1, 21)?.lap_start).toBe(21)
        expect(stintAt(index, 99, 5)).toBe(null)
        expect(stintAt(index, 1, 0)).toBe(null)
    })
})