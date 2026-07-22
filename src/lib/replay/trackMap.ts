import type { Location } from "../types/openf1";
import type { CompletedLap } from "./timeIndex";

type TrackTransform = {
    minX: number,
    maxY: number,
    scale: number,
    offsetX: number,
    offsetY: number
}

export function findFastestLap(completedLaps: CompletedLap[]): CompletedLap | null {
    let best: CompletedLap | null = null
    for (const lap of completedLaps) {
        if (best === null || lap.lap_duration < best?.lap_duration) {
            best = lap
        }
    }
    return best
}

export function computeTrackTransform(
    points: { x: number, y: number}[],
    viewBoxSize: number
): TrackTransform | null {
    if(points.length === 0) {
        return null
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const p of points) {
        if(p.x < minX) {
            minX = p.x
        }
        if(p.x > maxX) {
            maxX = p.x
        }
        if(p.y < minY) {
            minY = p.y
        }
        if(p.y > maxY) {
            maxY = p.y
        }
    }
    const width = maxX - minX, height = maxY - minY
    const scale = viewBoxSize / Math.max(width, height)
    const offsetX = (viewBoxSize - width * scale) / 2, offsetY = (viewBoxSize - height * scale) / 2
    return {minX, maxY, scale, offsetX, offsetY}
}

export function applyTransform(p: {x: number, y: number}, t: TrackTransform): {x: number, y: number} {
    return { x: (p.x - t.minX) * t.scale + t.offsetX, y: (t.maxY - p.y) * t.scale + t.offsetY}
}

export function normalizeTrackPoints(
    points: { x: number, y: number}[],
    viewBox: number
): { x: number, y: number }[] {
    const transform = computeTrackTransform(points, viewBox)
    if (transform === null) {
        return []
    }
    return points.map(p => applyTransform(p, transform))
}

export function findNearestIndex(points: Location[], targetMs: number): number {
    let bestIdx = 0, bestDiff = Infinity
    for (let i = 0; i < points.length; i++) {
        const diff = Math.abs(Date.parse(points[i].date) - targetMs)
        if (diff < bestDiff) {
            bestDiff = diff
            bestIdx = i
        }
    }
    return bestIdx
}

export function findSectorBoundaryIndexes(rawLocation: Location[], fastestLap: CompletedLap): [number, number] | null {
    if(rawLocation.length === 0 || fastestLap.duration_sector_1 === null || fastestLap.duration_sector_2 === null) {
        return null
    }
    const t0 = Date.parse(fastestLap.date_start)
    const t1 = t0 + fastestLap.duration_sector_1 * 1000
    const t2 = t1 + fastestLap.duration_sector_2 * 1000
    return [findNearestIndex(rawLocation, t1), findNearestIndex(rawLocation, t2)]
}

export function boundaryTick(points: {x: number, y: number}[], index: number, halfLen: number): { x1: number, y1: number, x2: number, y2: number} {
    const prev = points[Math.max(index - 1, 0)]
    const next = points[Math.min(index + 1, points.length - 1)]
    const dx = next.x - prev.x
    const dy = next.y - prev.y
    const len = Math.hypot(dx, dy)
    if(len === 0) {
        return { x1: points[index].x, y1: points[index].y, x2: points[index].x, y2: points[index].y}
    }
    const nx = -dy / len, ny = dx / len
    return { x1: points[index].x - nx*halfLen, y1: points[index].y - ny*halfLen, x2: points[index].x + nx*halfLen, y2: points[index].y + ny*halfLen}
}

