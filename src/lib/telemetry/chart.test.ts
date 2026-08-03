import { describe, expect, it } from "vitest";
import type { CarData } from "../types/openf1";
import { buildChartPath, scalePoint, toSeries, type ChartScale } from "./chart";
import { atSec, START } from "../replay/testFactories";

const makeCarData = (overrides: Partial<CarData> = {}): CarData => ({
    brake: 0,
    date: '2026-01-01T00:00:00+00:00',
    driver_number: 1,
    drs: 12,
    meeting_key: 1,
    n_gear: 1,
    rpm: 0,
    session_key: 1,
    speed: 0,
    throttle: 0,
    ...overrides
})

const chartScale: ChartScale = {
        width: 100,
        height: 200,
        xMax: 100,
        yMax: 200,
        yMin: 0
    }

describe('toSeries', () => {
    it('returns parsed array of time (in miliseconds, not ISO time) and some variable', () => {
        const records = [
            makeCarData({speed: 310, date: atSec(0)}),
            makeCarData({speed: 250, date: atSec(10)}),
            makeCarData({speed: 100, date: atSec(20)}),
            makeCarData({speed: 80, date: atSec(30)})
        ]
        expect(toSeries(records, START, r => (r.speed))).toEqual([
            { t: 0, value: 310},
            { t: 10000, value: 250},
            { t: 20000, value: 100},
            { t: 30000, value: 80}
        ])
    })
})

describe('scalePoint', () => {
    it('returns height and width value on 0 value inputs', () => {
        expect(scalePoint({t: 100, value: 0}, chartScale)).toEqual({
            x: 100,
            y: 200
        })
    })
    it('returns center scale value on medium value inputs', () => {
        expect(scalePoint({t: 50, value: 100}, chartScale)).toEqual({
            x: 50,
            y: 100
        })
    })
    it('returns maximum scale value on maximum value inputs', () => {
        expect(scalePoint({t: 100, value: 200}, chartScale)).toEqual({
            x: 100,
            y: 0
        })
    })
    it('fraction is 0.5 on span === 0 so values on Y are centered', () => {
        expect(scalePoint({t: 100, value: 200}, {
        width: 100,
        height: 200,
        xMax: 100,
        yMax: 200,
        yMin: 200
    })).toEqual({
            x: 100,
            y: 100
        })
    })
})

describe('buildChartPath', () => {
    it('returns computed through scalePoint coordinate values as SVG points attribute', () => {
        expect(buildChartPath([{t: 0, value: 100}, {t: 100, value: 0}], chartScale)).toBe('0,100 100,200')
    })
})