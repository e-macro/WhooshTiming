import { describe, expect, it } from "vitest";
import type { RaceControl } from "../types/openf1";
import { buildTrackStatus } from "./trackStatus";

const START = Date.parse("2026-01-01T00:00:00+00:00");
const atSec = (s: number) => new Date(START + s * 1000).toISOString();


const makeMessage = (overrides: Partial<RaceControl> = {}): RaceControl => ({
    category: 'flag',
    date: '2026-01-01T00:00:00+00:00',
    driver_number: 1,
    flag: null,
    lap_number: 1,
    meeting_key: 1,
    message: 'DOUBLE YELLOW ON SECTOR 1',
    qualifying_phase: null,
    scope: null,
    sector: 1,
    session_key: 1,
    ...overrides
})

describe('buildTrackStatus', () => {
    it('handles a full safety car cycle', () => {
        const messages = [
            makeMessage({ category: 'SafetyCar', message: 'SAFETY CAR DEPLOYED', date: atSec(100)}),
            makeMessage({ category: 'SafetyCar', message: 'SAFETY CAR IN THIS LAP', date: atSec(200)}),
            makeMessage({ category: 'Flag', flag: 'CLEAR', scope: 'Track', date: atSec(250)})
        ]
        const milestones = buildTrackStatus(messages, START)
        expect(milestones).toEqual([
            { t: 100000, status: 'sc'},
            { t: 250000, status: 'green'}
        ])
    })
    it('handles a full virtual safety car cycle - identifies VSC messages as NOT safety car', () => {
        const messages = [
            makeMessage({ category: 'SafetyCar', message: 'VIRTUAL SAFETY CAR DEPLOYED', date: atSec(100)}),
            makeMessage({ category: 'SafetyCar', message: 'VIRTUAL SAFETY CAR ENDING', date: atSec(200)}),
            makeMessage({ category: 'Flag', flag: 'CLEAR', scope: 'Track', message: 'TRACK CLEAR', date: atSec(250)})
        ]
        const milestones = buildTrackStatus(messages, START)
        expect(milestones).toEqual([
            { t: 100000, status: 'vsc'},
            { t: 250000, status: 'green'}
        ])
    })
    it('handles a full red flag cycle', () => {
        const messages = [
            makeMessage({ category: 'Flag', flag: 'RED', scope: 'Track', message: 'RED FLAG', date: atSec(100)}),
            makeMessage({ category: 'Flag', flag: 'CLEAR', scope: 'Track', message: 'TRACK CLEAR', date: atSec(300)})
        ]
        const milestones = buildTrackStatus(messages, START)
        expect(milestones).toEqual([
            { t: 100000, status: 'red'},
            { t: 300000, status: 'green'}
        ])
    })
    it('handles a full yellow and double yellow flag cycle', () => {
        const messages = [
            makeMessage({ category: 'Flag', flag: 'YELLOW', scope: 'Track', message: 'YELLOW IN TRACK SECTOR 1', date: atSec(100)}),
            makeMessage({ category: 'Flag', flag: 'CLEAR', scope: 'Track', message: 'CLEAR IN TRACK SECTOR 1', date: atSec(200)}),
            makeMessage({ category: 'Flag', flag: 'DOUBLE YELLOW', scope: 'Track', message: 'DOUBLE YELLOW IN TRACK SECTOR 1', date: atSec(500)}),
            makeMessage({ category: 'Flag', flag: 'CLEAR', scope: 'Track', message: 'CLEAR IN TRACK SECTOR 1', date: atSec(600)}),
        ]
        const milestones = buildTrackStatus(messages, START)
        expect(milestones).toEqual([
            { t: 100000, status: 'yellow'},
            { t: 200000, status: 'green'},
            { t: 500000, status: 'yellow'},
            { t: 600000, status: 'green'}
        ])
    })
    it('ignores secotral Yellows', () => {
        const messages = [
            makeMessage({ category: 'Flag', flag: 'YELLOW', scope: 'sector', message: 'YELLOW IN TRACK SECTOR 1', date: atSec(100)}),
        ]
        const milestones = buildTrackStatus(messages, START)
        expect(milestones).toEqual([
        ])
    })
    it('handles a full safety car - red flag cycle', () => {
        const messages = [
            makeMessage({ category: 'SafetyCar', message: 'SAFETY CAR DEPLOYED', date: atSec(100)}),
            makeMessage({ category: 'Flag', flag: 'RED', scope: 'Track', message: 'RED FLAG', date: atSec(200)}),
            makeMessage({ category: 'Flag', flag: 'CLEAR', scope: 'Track', message: 'TRACK CLEAR', date: atSec(250)})
        ]
        const milestones = buildTrackStatus(messages, START)
        expect(milestones).toEqual([
            { t: 100000, status: 'sc'},
            { t: 200000, status: 'red'},
            { t: 250000, status: 'green'}
        ])
    })
    it('ignores noise messages and categories', () => {
        const messages = [
            makeMessage({ category: "Drs", message: "DRS ENABLED", date: atSec(10) }),
            makeMessage({ category: "Other", message: "RISK OF RAIN FOR F1 RACE IS 60%", date: atSec(20) }),
            makeMessage({ category: "Flag", flag: "BLUE", scope: "Driver", driver_number: 22, date: atSec(30) }),
            makeMessage({ category: "Flag", flag: "GREEN", scope: "Track", date: atSec(50) }),   // зелений по зеленому!
            makeMessage({ category: "SafetyCar", message: "SAFETY CAR IN THIS LAP", date: atSec(60) }),
        ];
        expect(buildTrackStatus(messages, START)).toEqual([]);
    })
    it('sets status to chequered flag', () => {
        const messages = [
            makeMessage({ category: 'Flag', flag: 'CHEQUERED', scope: 'Track', message: 'CHEQUERED FLAG', date: atSec(100)}),
            makeMessage({ category: 'Flag', flag: 'GREEN', scope: 'Track', message: 'TRACK CLEAR', date: atSec(250)})
        ]
        expect(buildTrackStatus(messages, START)).toEqual([
            { t: 100000, status: 'chequered' }
        ])
    })
})