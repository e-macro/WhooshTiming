import type { Stint } from "../types/openf1";

export function buildStintIndex(stints: Stint[]): Map<number, Stint[]> {
    const index = new Map<number, Stint[]>()
    for (const stint of stints) {
        let stintList = index.get(stint.driver_number)
        if(!stintList) {
            stintList = []
            index.set(stint.driver_number, stintList)
        }
        stintList.push(stint)
    }
    for (const stintList of index.values()) {
        stintList.sort((a, b) => a.lap_start - b.lap_start)
    }
    return index
}

export function stintAt(index: Map<number, Stint[]>, driverNumber: number, currentLap: number): Stint | null {
    const stintList = index.get(driverNumber)
    if(!stintList) {
        return null
    }
    const found = stintList.find(s => currentLap >= s.lap_start && (s.lap_end === null || currentLap <= s.lap_end))
    return found ?? null
}