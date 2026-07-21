import type { Lap } from "../types/openf1";

export type TimePoint<T> = T & {t: number}
export type LapPoint = TimePoint<{ duration: number; lapNumber: number; isPb: boolean}>
export type CompletedLap = Lap & { lap_duration: number }

export function buildTimeIndex<R extends { driver_number: number}, T>(records: R[], startMs: number, toPoint: (record: R) => T, toTime: (record: R) => number): Map<number, TimePoint<T>[]> {
    const driver = new Map<number, TimePoint<T>[]>()
    for (const record of records) {
        const t = toTime(record) - startMs
        let pos = driver.get(record.driver_number)
        if (!pos) {
            pos = []
            driver.set(record.driver_number, pos)
        }
        pos.push( {...toPoint(record), t} )
    }
    return driver
}

export function searchLatest<P extends {t: number}>(points: P[], cursorMs: number): P | null {
    let lo = 0;
    let hi = points.length - 1
    let found = -1
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2)
        if(points[mid].t <= cursorMs) {
            found = mid
            lo = mid+1
        } else {
            hi = mid - 1
        }
    } 
    return found === -1 ? null : points[found]  
}

export function latestAt<P extends {t: number}>(index: Map<number, P[]>, driverNumber: number, cursorMs: number): P | null {
    const points = index.get(driverNumber)
    if (!points) {
        return null
    }
    return searchLatest(points, cursorMs)
}

export function annotatePb(index: Map<number, LapPoint[]>) {
    for (const points of index.values()) {
        let best = Infinity;
        for (const point of points) {
            if (point.duration < best) {
                point.isPb = true
                best = point.duration
            } else point.isPb = false
        }
    }
}

export function buildSessionBest(completedLaps: CompletedLap[], startMs: number): {t: number, best: number}[] {
    const points = completedLaps.map(l => ({
        t: new Date(l.date_start).getTime() + l.lap_duration * 1000 - startMs,
        duration: l.lap_duration
    }))
    points.sort((a, b) => a.t - b.t)
    const result: {t: number, best: number}[] = []
    let best = Infinity
    for (const p of points) {
        if (p.duration < best) {
            best = p.duration
            result.push({t: p.t, best: p.duration})
        }
    }
    return result
}

export function buildLapMilestones(completedLaps: CompletedLap[], startMs: number): {t: number, lapNumber: number}[] {
    const points = completedLaps.map(l => ({
        t: new Date(l.date_start).getTime() + l.lap_duration * 1000 - startMs,
        lapNumber: l.lap_number
    }))
    points.sort((a, b) => a.t - b.t)
    const laps: {t: number, lapNumber: number}[] = []
    let maxLap  = 0
    for (const p of points) {
        if (p.lapNumber > maxLap) {
            maxLap = p.lapNumber
            laps.push({t: p.t, lapNumber: p.lapNumber})
        }
    }
    return laps
}
