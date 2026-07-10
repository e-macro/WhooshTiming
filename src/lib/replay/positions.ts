import type { Position } from "../types/openf1";

export type PositionPoint = {
    t: number,
    position: number
}

export function buildPositionIndex(positions: Position[], sessionStartMs: number): Map<number, PositionPoint[]>{
    const driver = new Map<number, PositionPoint[]>
    for (const position of positions) {
        const t = new Date(position.date).getTime() - sessionStartMs
        let pos = driver.get(position.driver_number)
        if (!pos) {
            pos = []
            driver.set(position.driver_number, pos)
        }
        pos.push({ t, position: position.position})
    }
    return driver
}

export function positionAt(index: Map<number, PositionPoint[]>, driverNumber: number, cursorMs: number): number | null {
    const points = index.get(driverNumber)
    if (!points) {
        return null
    }
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
    return found === -1 ? null : points[found].position  
}