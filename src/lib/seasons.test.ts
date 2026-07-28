import { describe, expect, it } from "vitest";
import { parseSeason, SEASONS } from "./seasons";

describe('parseSeason', () => {
    it('returns valid season value in number', () => {
        expect(parseSeason('2024')).toEqual(2024)
    })
    it('returns default value on non-valid input', () => {
        expect(parseSeason('banana')).toBe(Math.max(...SEASONS))
    })
    it('returns default value on undefined', () => {
        expect(parseSeason(undefined)).toBe(Math.max(...SEASONS))
    })
    // SEASONS = [2023, 2024, 2025, 2026]
    it('returns default value on valid year which is not in SEASONS array', () => {
        expect(parseSeason('1999')).toBe(Math.max(...SEASONS))
    })
})