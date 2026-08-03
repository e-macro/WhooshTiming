import { buildChartPath, scalePoint, type ChartPoint, type ChartScale } from "@/lib/telemetry/chart"
import { formatLapTime } from "@/lib/format"
import styles from "./TelemetryChart.module.css"
import { searchLatest } from "@/lib/replay/timeIndex"

export type ChartMarker = {
    t: number      // ms from lap start
    label: string  // e.g. "S2"
}

export type ChartSeries = {
    points: ChartPoint[],
    label: string, // Driver's acronym
    color?: string, // колір лінії
    dashed?: boolean
}

type Props = {
    series: ChartSeries[]
    xMax: number,
    yMin: number,
    yMax: number,
    label: string,
    unit?: string, // km/h / %
    markers?: ChartMarker[], // vertical guides, e.g. sector boundaries
    hoverT: number | null,
    onHoverChange: (t: number | null) => void
}

const WIDTH = 300
const HEIGHT = 100

/** Horizontal guides across the value domain, top to bottom.
 *  Drives both the grid lines and the axis labels, so they cannot drift apart. */
const GRID_FRACTIONS = [1, 0.75, 0.5, 0.25, 0]

export default function TelemetryChart({
    series, xMax, yMax, yMin, label, unit, markers = [], hoverT, onHoverChange
}: Props) {
    const scale: ChartScale = { width: WIDTH, height: HEIGHT, xMax, yMax, yMin }

    // Scaling a single value is exactly what `scalePoint` is for — the grid
    // and the trace therefore share one source of truth about the domain.
    const yFor = (value: number) => scalePoint({ t: 0, value }, scale).y
    const percentFor = (t: number) => (xMax > 0 ? (t / xMax) * 100 : 0)
    const xFor = (t: number) => (percentFor(t) / 100) * WIDTH

    const hoverX = hoverT !== null ? xFor(hoverT) : 0
    const rows = series.map(s => ({
        ...s,
        hoverPoint: hoverT !== null ? searchLatest(s.points, hoverT) : null
    }))
    const seriesStyle = (color?: string) => color ? ({ "--trace-color": color } as React.CSSProperties) : undefined

    return (
        <section
            className={`card ${styles.wrap}`}
        >
            <div className={styles.head}>
                <div className={styles.info}>
                    <span className={styles.label}>{label}</span>
                    {unit && <span className={styles.unit}>{unit}</span>}
                </div>
                <div className={styles.info} >
                {rows.map(r => (
                    <span key={r.label} className={styles.legendItem} style={seriesStyle(r.color)}>
                        <i className={`${styles.swatch} ${r.dashed ? styles.swatchDashed : ''}`} />
                        <span className={styles.legendLabel}>{r.label}</span>
                        {r.hoverPoint && (
                            <span className={`${styles.value} tnum`}>{Math.round(r.hoverPoint.value)}</span>
                        )}
                    </span>
                ))}
                    {hoverT !== null && <span className={`${styles.time} tnum`}>{formatLapTime(hoverT / 1000)}</span>}
                    </div>
            </div>
            <div className={styles.body}>
                <div className={`${styles.yAxis} tnum`}>
                    {GRID_FRACTIONS.map((f) => (
                        <span key={f}>{Math.round(yMin + (yMax - yMin) * f)}</span>
                    ))}
                </div>

                <div className={styles.plot}>
                    <div className={styles.plotArea}>
                    
                        <svg
                            className={styles.svg}
                            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                            preserveAspectRatio="none"
                            role="img"
                            aria-label={`${label} за коло`}
                            onPointerMove={e => {
                                const rect = e.currentTarget.getBoundingClientRect()
                                const fraction = (e.clientX - rect.left) / rect.width
                                const clampedFraction = Math.min(Math.max(fraction, 0), 1)
                                onHoverChange(clampedFraction * xMax)
                            }}
                            onPointerLeave={() => onHoverChange(null)}
                        >
                            {GRID_FRACTIONS.map((f) => {
                                const y = yFor(yMin + (yMax - yMin) * f)
                                return <line key={f} x1={0} y1={y} x2={WIDTH} y2={y} className={styles.grid} />
                            })}
                            {markers.map((m) => {
                                const x = xFor(m.t)
                                return <line key={m.label} x1={x} y1={0} x2={x} y2={HEIGHT} className={styles.marker} />
                            })}
                            {series.map(s => (
                                <g key={s.label} style={seriesStyle(s.color)}>
                                    <polyline
                                        points={buildChartPath(s.points, scale)}
                                        className={`${styles.trace} ${s.dashed ? styles.traceDashed : ""}`}
                                    />
                                </g>))}
                            {hoverT !== null && <line x1={hoverX} y1={0} x2={hoverX} y2={HEIGHT} className={styles.cursor} />}
                        </svg>

                    {/* The dot lives in HTML, not in the SVG: with
                        preserveAspectRatio="none" the plot is stretched
                        unevenly, which would squash a <circle> into an ellipse.
                        Percentages are immune — they resolve against the box. */}
                    {rows.map(r => r.hoverPoint && (
                        <span
                        key={r.label}
                            className={styles.dot}
                            style={{
                                left: `${percentFor(r.hoverPoint.t)}%`,
                                top: `${(scalePoint(r.hoverPoint, scale).y / HEIGHT) * 100}%`,
                                "--trace-color": r.color 
                            } as React.CSSProperties}
                        />
                    ))}
                    </div>

                    {/* Axis labels live in HTML: the plot is stretched with
                        preserveAspectRatio="none", which would distort SVG text. */}
                    <div className={`${styles.xAxis} tnum`}>
                        <span className={styles.xStart}>0:00.000</span>
                        {markers.map((m) => (
                            <span
                                key={m.label}
                                className={styles.xMarker}
                                style={{ left: `${percentFor(m.t)}%` }}
                            >
                                {m.label}
                            </span>
                        ))}
                        <span className={styles.xEnd}>{formatLapTime(xMax / 1000)}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
