import type { CarData } from "../types/openf1"

export type ChartPoint = {
    t: number, // [t] = ms since lap start
    value: number
}
export type ChartScale = {
    width: number;
    height: number;
    xMax: number;
    yMax: number;
    yMin: number
}

export function toSeries(records: CarData[], lapStartMs: number, pick: (r: CarData) => number): ChartPoint[] {
    return records.map(r => ({
        t: Date.parse(r.date) - lapStartMs,
        value: pick(r)
    }))
}

export function scalePoint(p: ChartPoint, s: ChartScale): {x: number, y: number} {
    const x = (p.t / s.xMax) * s.width
    const span = s.yMax - s.yMin
    const fraction = span === 0 ? 0.5 : (p.value - s.yMin) / span
    const y = s.height - fraction * s.height
    return { x, y }
}

export function buildChartPath(points: ChartPoint[], s: ChartScale): string {
    return points
        .map((p) => { const { x, y } = scalePoint(p, s); return `${x},${y}` })
        .join(" ")
}