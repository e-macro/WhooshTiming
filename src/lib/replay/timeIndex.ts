export type TimePoint<T> = T & {t: number}

export function buildTimeIndex<R extends { date: string, driver_number: number}, T>(records: R[], startMs: number, toPoint: (record: R) => T): Map<number, TimePoint<T>[]> {
    const driver = new Map<number, TimePoint<T>[]>
    for (const record of records) {
        const t = new Date(record.date).getTime() - startMs
        let pos = driver.get(record.driver_number)
        if (!pos) {
            pos = []
            driver.set(record.driver_number, pos)
        }
        pos.push( {...toPoint(record), t} )
    }
    return driver
}

export function latestAt<P extends {t: number}>(index: Map<number, P[]>, driverNumber: number, cursorMs: number): P | null {
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
    return found === -1 ? null : points[found]  
}