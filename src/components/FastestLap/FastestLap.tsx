'use client'

import type { useSessionIndexes } from "@/lib/hooks/useSessionIndexes"
import { searchLatest } from "@/lib/replay/timeIndex"
import type { Driver } from "@/lib/types/openf1"
import { useReplayStore } from "@/store/replayStore"
import { formatLapTime } from "@/lib/format"
import styles from "./FastestLap.module.css"

type Props = {
    sessionBest: ReturnType<typeof useSessionIndexes>['sessionBest'],
    drivers: Driver[]
}

export default function FastestLap({sessionBest, drivers}: Props) {
    const cursor = useReplayStore(s => s.cursor)
    // Cursor-aware on purpose: showing the session's final record from the
    // start would spoil the replay.
    const milestone = searchLatest(sessionBest, cursor)
    const driver = milestone
        ? drivers.find(d => d.driver_number === milestone.driverNumber)
        : undefined

    return (
        <section className={`card ${styles.wrap}`} aria-label="Найшвидше коло">
            <span className={styles.heading}>Найшвидше коло</span>
            {milestone ? (
                <div className={styles.body}>
                    <i
                        className={styles.teamBar}
                        style={{ background: driver ? `#${driver.team_colour}` : "var(--text-faint)" }}
                    />
                    <span className={styles.driver}>
                        <b className={styles.acronym}>{driver?.name_acronym ?? "—"}</b>
                        <span className={`${styles.num} tnum`}>{milestone.driverNumber}</span>
                    </span>
                    <span className={`${styles.time} tnum`}>{formatLapTime(milestone.best)}</span>
                    <span className={`${styles.lap} tnum`}>коло {milestone.lapNumber}</span>
                </div>
            ) : (
                <p className={styles.empty}>Ще не встановлено</p>
            )}
        </section>
    )
}
