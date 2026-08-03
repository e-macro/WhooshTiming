"use client"

import { openf1 } from "@/lib/api/openf1"
import QueryStateCard, { queryStateOf } from "@/components/QueryState/QueryState"
import type { CompletedLap } from "@/lib/replay/timeIndex"
import { findFastestLap } from "@/lib/replay/trackMap"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { toSeries } from "@/lib/telemetry/chart"
import TelemetryChart, { type ChartSeries } from "@/components/TelemetryChart/TelemetryChart"
import styles from './telemetry.module.css'
import type { CarData, Driver } from "@/lib/types/openf1"
import { formatLapTime } from "@/lib/format"

type TelemetryEntry = {
    driver: Driver
    lap: CompletedLap
    color: string
    dashed: boolean
}

type Props = {
    sessionKey: string
}

export default function TelemetryClient({ sessionKey }: Props) {
    const [driverNumbers, setDriverNumbers] = useState<number[] | null>(null)
    const [lapNumber, setLapNumber] = useState<number | null>(null)
    const [hoverT, setHoverT] = useState<number | null>(null)
    const drivers = useQuery({
        queryKey: ['drivers', sessionKey],
        queryFn: () => openf1.drivers(Number(sessionKey))
    })
    const laps = useQuery({
        queryKey: ['laps', sessionKey],
        queryFn: () => openf1.laps(Number(sessionKey)),
    })

    const activeDrivers = driverNumbers ?? (drivers.data?.[0] ? [drivers.data?.[0]?.driver_number] : [])
    const toggleDriver = (d: number) => {
        const selected = activeDrivers.includes(d)
        if(selected && activeDrivers?.length === 1) {
            return
        } 
        setDriverNumbers(selected ? activeDrivers.filter(n => n !== d) : [...activeDrivers, d])
    }
    const driverLaps = (laps.data ?? []).filter((l): l is CompletedLap => l.driver_number === activeDrivers[0] && l.lap_duration !== null)
    const activeLap = lapNumber ?? findFastestLap(driverLaps)?.lap_number
    const entries: TelemetryEntry[] = []
    const seen = new Set<string>()
    for (const num of activeDrivers) {
        const driver = drivers.data?.find(d => d.driver_number === num)
        const lap = (laps.data ?? []).find((l): l is CompletedLap => l.driver_number === num && l.lap_number === activeLap && l.lap_duration !== null)
        if(!driver || !lap) continue
        const color = `#${driver.team_colour}`
        const dashed = seen.has(color)
        seen.add(color)
        entries.push({ driver, lap, color, dashed })
    }
    const results = useQueries({
        queries: entries.map(({ driver, lap }) => ({
            queryKey: ['carData', sessionKey, driver.driver_number, lap.lap_number],
            queryFn: () => {
            const dateFrom = lap.date_start
            const dateTo = new Date(new Date(dateFrom).getTime() + lap.lap_duration * 1000).toISOString()
            return openf1.carData(Number(sessionKey), driver.driver_number, dateFrom, dateTo)
            },
            staleTime: Infinity,
        })),
    })
    // const lapStartMs = selectedLap ? Date.parse(selectedLap.date_start) : 0
    const seriesFor = (pick: (r: CarData) => number): ChartSeries[] => 
        entries.map((e, i) => ({
            points: toSeries(results[i].data ?? [], Date.parse(e.lap.date_start), pick),
            label: e.driver.name_acronym,
            color: e.color,
            dashed: e.dashed,
        }))
    const speedSeries = seriesFor(r => r.speed)
    const maxSpeed = speedSeries
        .flatMap(s => s.points)
        .reduce((acc, p) => Math.max(acc, p.value), 0)
    const yMaxSpeed = Math.ceil(maxSpeed / 50) * 50
    const first = entries[0]
    const markers = first?.lap.duration_sector_1 && first.lap.duration_sector_2 
    ? [
        { t: first.lap.duration_sector_1 * 1000, label: 'S2' },
        { t: (first.lap.duration_sector_1 + first.lap.duration_sector_2) * 1000, label: 'S3' },
    ]
    : []
    const state = queryStateOf([drivers, laps])
    if (state.isPending) {
        return <QueryStateCard variant="loading" text={state.loadingText} />
    }
    if (state.isError) {
        return <QueryStateCard variant="error" text="Ох йойки! Щось пішло не так. Скоро вирішимо проблему!" />
    }
    const lapDuration = (first?.lap.lap_duration ?? 0) * 1000
    return (<div className={styles.page}>
        <div className={styles.head}>
            <div>
                <p className={styles.eyebrow}>Телеметрія</p>
                <h1 className={styles.title}>
                    LAP {activeLap} -
                    {entries.map(e => (
                        <span
                        key={e.driver.driver_number}
                        > {e.driver.name_acronym} #{e.driver.driver_number} {formatLapTime(e.lap.lap_duration)}</span>
                    ))}
                </h1>
            </div>
            <select value={activeLap ?? ''} onChange={(e) => {
                        setLapNumber(Number(e.target.value))
                        }}
                        className={styles.select}
                    >
                    {driverLaps.map((l) => (
                        <option value={l.lap_number} key={l.lap_number}>
                            LAP {l.lap_number}
                        </option>
                    ))}
                </select>
                <div className={styles.chips}>
                    {drivers.data!.map(d => {
                        const selected = activeDrivers.includes(d.driver_number)
                        return (
                            <button
                            key={d.driver_number}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleDriver(d.driver_number)}
                            className={`${styles.chip} ${selected ? styles.chipActive : ""}`}
                            style={{ "--team-color": `#${d.team_colour}` } as React.CSSProperties}
                            >
                                {d.name_acronym}
                            </button>
                        )
                    })}
                </div>
        </div>
        {entries.length === 0
        ?   <p className={styles.empty}>Для цього вибору немає телеметрії</p>
        :   <div className={styles.charts}>
            <TelemetryChart
                series={speedSeries}
                xMax={lapDuration}
                yMin={0}
                yMax={yMaxSpeed}
                label="SPEED"
                unit="km/h"
                markers={markers}
                hoverT={hoverT}
                onHoverChange={setHoverT}
            />
            <TelemetryChart
                series={seriesFor(r => r.throttle)}
                xMax={lapDuration}
                yMin={0}
                yMax={100}
                label="THROTTLE"
                unit="%"
                markers={markers}
                hoverT={hoverT}
                onHoverChange={setHoverT}
            />
            <TelemetryChart
                series={seriesFor(r => r.brake)}
                xMax={lapDuration}
                yMin={0}
                yMax={100}
                label="BRAKE"
                markers={markers}
                hoverT={hoverT}
                onHoverChange={setHoverT}
            />
        </div>}
    </div>)
}