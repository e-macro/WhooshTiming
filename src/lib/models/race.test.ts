import { describe, it, expect } from "vitest";
import type { Meeting, Session } from "../types/openf1";
import { findLastPastSession, toRaceListItem } from "./race";

const makeMeeting = (overrides: Partial<Meeting> = {}): Meeting => ({
    meeting_key: 1,
    meeting_name: 'Test GP',
    meeting_official_name: 'Test Grand Prix',
    circuit_key: 1,
    circuit_short_name: "Test",
    country_name: 'Test',
    country_code: 'Test',
    location: 'Test',
    year: 2026,
    is_cancelled: false,
    date_start: '2026-01-01T00:00:00+00:00',
    ...overrides
})

const makeSession = (overrides: Partial<Session> = {}): Session => ({
    session_key: 1,
    meeting_key: 1,
    session_name: 'Test',          // "Race" | "Qualifying" | "Sprint" | ...
    session_type: 'Test',         // "Race" | "Qualifying" | "Practice"
    date_start: '2026-01-01T00:00:00+00:00',
    date_end: '2026-01-01T02:00:00+00:00',
    circuit_short_name: 'Test',
    country_name: 'Test',
    year: 2026,
    ...overrides
})

const NOW = Date.parse("2026-07-01T00:00:00+00:00");
const PAST_DATE = "2026-06-01T00:00:00+00:00";    // до NOW
const FUTURE_DATE = "2026-08-01T00:00:00+00:00";  // після NOW


describe('toRaceListItem', () => {
    it('marks race as past when its date is before now', () => {
        const item = toRaceListItem(makeMeeting(), makeSession({date_start: PAST_DATE}), 1, NOW);
        expect(item.status).toBe('past')
    })
    it('marks race as upcoming when its date is after NOW', () => {
        const item = toRaceListItem(makeMeeting(), makeSession({date_start: FUTURE_DATE}), 1, NOW);
        expect(item.status).toBe('upcoming')
    })
    it('marks race as cancelled with date is after NOW', () => {
        const item = toRaceListItem(makeMeeting({ is_cancelled: true }), makeSession({date_start: FUTURE_DATE}), 1, NOW);
        expect(item.status).toBe('cancelled')
    })
})

describe('findLastPastSession', () => {
    it('returns last race by date', () => {
        const sessions = [
            makeSession({session_key: 4}),
            makeSession({date_start: '2025-12-01T00:00:00+00:00', session_key: 3}),
            makeSession({date_start: '2025-11-01T00:00:00+00:00', session_key: 2}),
            makeSession({date_start: '2025-10-01T00:00:00+00:00', session_key: 1}),
        ]
        expect(findLastPastSession(sessions, NOW)?.session_key).toBe(4)
    })
    it('returns null for empty array', () => {
        expect(findLastPastSession([], NOW)).toBe(null)
    })
})