import { describe, expect, it } from "vitest";
import { atSec, makeCompletedLap, makeLocation, START } from "./testFactories";
import { applyTransform, boundaryTick, computeTrackTransform, findFastestLap, findNearestIndex, findSectorBoundaryIndexes, normalizeTrackPoints } from "./trackMap";

describe('findFastestLap', () => {
    it('finds fastest lap', () => {
        const laps = [
            makeCompletedLap({ lap_duration: 95, driver_number: 44 }),
            makeCompletedLap({ lap_duration: 100, driver_number: 63 }),
            makeCompletedLap({ driver_number: 2 }),
            makeCompletedLap({lap_duration: 85, driver_number: 4 })
        ]
        expect(findFastestLap(laps)?.lap_duration).toBe(85)
    })
    it('returns null per empty array', () => {
        expect(findFastestLap([])).toBe(null)
    })
})

describe('computeTrackTransform', () => {
    it('returns measurement object', () => {
        expect(computeTrackTransform([{ x: 10, y: 20}, {x: 110, y: 20}, {x: 110, y: 70}, {x: 10, y: 70}], 500))
            .toEqual({
                minX: 10,
                maxY: 70,
                scale: 5,
                offsetX: 0,
                offsetY: 125
            })
    })
    it('returns null per empty array', () => {
        expect(computeTrackTransform([], 500)).toEqual(null)
    })
})

describe('applyTransform', () => {
    it('returns transformed coordinates', () => {
        const points = [{ x: 10, y: 20}, {x: 110, y: 20}, {x: 110, y: 70}, {x: 10, y: 70}]
        const transform = computeTrackTransform(points, 500)
        expect(applyTransform({x: 30, y: 40}, transform!)).toEqual({
            x: 100, y: 275
        })
    })
})

describe('normalizeTrackPoints', () => {
    it('returns normalized array of coordinates', () => {
        expect(normalizeTrackPoints([{ x: 10, y: 20}, {x: 110, y: 20}, {x: 110, y: 70}, {x: 10, y: 70}], 500))
            .toEqual([
                {x: 0, y: 375},
                {x: 500, y: 375},
                {x: 500, y: 125},
                {x: 0, y: 125}
            ])
    })
    it('returns an empty array per empty array', () => {
        expect(normalizeTrackPoints([], 500)).toEqual([])
    })
})

describe('findNearestIndex', () => {
    it('returns nearest index to selected time', () => {
        const points = [
        makeLocation({ date: atSec(0) }),
        makeLocation({ date: atSec(10) }),
        makeLocation({ date: atSec(20) }),
        ]
        expect(findNearestIndex(points, START-16000)).toEqual(0)
        expect(findNearestIndex(points, START+10000)).toEqual(1)
        expect(findNearestIndex(points, START+16000)).toEqual(2)
        expect(findNearestIndex(points, START+22000)).toEqual(2)
    })
})

describe('findSectorBoundaryIndex', () => {
    it('returns nearest time indexes of s1/s2 and s2/s3 boundaries', () => {
        const points = [
        makeLocation({ date: atSec(0) }),
        makeLocation({ date: atSec(10) }),
        makeLocation({ date: atSec(20) }),
        ]
        expect(findSectorBoundaryIndexes(points, makeCompletedLap({date_start: atSec(0), duration_sector_1: 10, duration_sector_2: 10}))).toEqual([1, 2])
    })
    it('returns null per at least ONE null-sector', () => {
        const points = [
        makeLocation({ date: atSec(0) }),
        makeLocation({ date: atSec(10) }),
        makeLocation({ date: atSec(20) }),
        ]
        expect(findSectorBoundaryIndexes(points, makeCompletedLap({date_start: atSec(0), duration_sector_1: 10, duration_sector_2: null}))).toEqual(null)
    })
    it('returns null per empty array', () => {
        expect(findSectorBoundaryIndexes([], makeCompletedLap())).toEqual(null)
    })
})

describe('boundaryTick', () => {
    it('returns a perpendicular tick centered on the boundary point', () => {
        // Horizontal track direction → tick must be vertical
        const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }]
        expect(boundaryTick(points, 1, 5)).toEqual({ x1: 10, y1: -5, x2: 10, y2: 5 })
    })
    it('clamps neighbour lookup at array edges', () => {
        const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }]
        expect(boundaryTick(points, 0, 5)).toEqual({ x1: 0, y1: -5, x2: 0, y2: 5 })
    })
    it('returns a degenerate tick when neighbours coincide (zero direction)', () => {
        const points = [{ x: 5, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 5 }]
        expect(boundaryTick(points, 1, 5)).toEqual({ x1: 5, y1: 5, x2: 5, y2: 5 })
    })
})