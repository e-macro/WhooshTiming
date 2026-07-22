import { describe, expect, it } from "vitest";
import { windowBounds, windowIndexesFor } from "./locationWindows";

const SESSION_START_MS = new Date('2025-07-29T15:05:00+00:00').getTime()

describe('windowIndexesFor', () => {
    it('returns 3-index array based on cursor', () => {
        expect(windowIndexesFor(0)).toEqual([0, 1, 2])
        expect(windowIndexesFor(150000)).toEqual([1, 2, 3])
        expect(windowIndexesFor(120000)).toEqual([1, 2, 3])
        expect(windowIndexesFor(-1)).toEqual([0, 1, 2])
    })
})

describe('windowBounds', () => {
    it('returns a ISO formatted time of window', () => {
        expect(windowBounds(0, SESSION_START_MS)).toEqual({
            from: '2025-07-29T15:05:00.000Z',
            to: '2025-07-29T15:07:00.000Z'
        })
        expect(windowBounds(1, SESSION_START_MS)).toEqual({
            from: '2025-07-29T15:07:00.000Z',
            to: '2025-07-29T15:09:00.000Z' 
        })
    })
})