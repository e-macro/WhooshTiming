import { describe, expect, it } from "vitest";
import { formatGap, formatLapTime, formatTime } from "./format";

describe('formatTime', () => {
    it('formats milliseconds into H:MM:SS format', () => {
        expect(formatTime(0)).toEqual('0:00:00')
        expect(formatTime(61000)).toEqual('0:01:01')
        expect(formatTime(5400000)).toEqual('1:30:00')
    })
})

describe('formatLapTime', () => {
    it('formats lap time (in seconds) into M:SS:MSMSMS format', () => {
        expect(formatLapTime(86.734)).toEqual('1:26.734')
        expect(formatLapTime(59.05)).toEqual('0:59.050')
        expect(formatLapTime(90.007)).toEqual('1:30.007')
    })
})

describe('formatGap', () => {
    it('formats time gap in seconds into +seconds', () => {
        expect(formatGap(1.2, 'no gap')).toEqual('+1.200')
    })
    it('formats time gap in laps into +N LAP', () => {
        expect(formatGap('+1 LAP', 'no gap')).toEqual('+1 LAP')
    })
    it('returns fallback text on null gap', () => {
        expect(formatGap(null, 'no gap')).toEqual('no gap')
    })
})