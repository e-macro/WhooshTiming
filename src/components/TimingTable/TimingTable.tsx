"use client";

import type { Driver } from "@/lib/types/openf1";
import styles from "./TimingTable.module.css";
import { latestAt, searchLatest} from "@/lib/replay/timeIndex";
import { useReplayStore } from "@/store/replayStore";
import { formatGap, formatLapTime } from "@/lib/format";
import type { useSessionIndexes } from "@/lib/hooks/useSessionIndexes";

type TimingRow = {
  position: number;
  driverNumber: number;
  acronym: string;
  teamColor: string; // hex from /v1/drivers team_colour
  gap: string;       // "LEADER" | "+1.234" | "+1 LAP"
  interval: string;
  lastLap: string;
  lapState: "fastest" | "pb" | "normal";
  inPit: boolean;
  isOut: boolean
};

type Props = {
  drivers: Driver[],
  positionIndex: ReturnType<typeof useSessionIndexes>['positionIndex'],
  intervalIndex: ReturnType<typeof useSessionIndexes>['intervalIndex'],
  lapIndex: ReturnType<typeof useSessionIndexes>['lapIndex'],
  sessionBest: ReturnType<typeof useSessionIndexes>['sessionBest']
  pitIndex: ReturnType<typeof useSessionIndexes>['pitIndex']
}

const OUT_THRESHOLD_MS = 180000

export default function TimingTable({drivers, positionIndex, intervalIndex, lapIndex, pitIndex, sessionBest}: Props) {
  const cursor = useReplayStore(s => s.cursor)
  const rec = searchLatest(sessionBest, cursor)
  const rows: TimingRow[] = []
  for (const driver of drivers) {
    const point = latestAt(positionIndex, driver.driver_number, cursor)
    const time = latestAt(intervalIndex, driver.driver_number, cursor) 
    const lap = latestAt(lapIndex, driver.driver_number, cursor)
    const pit = latestAt(pitIndex, driver.driver_number, cursor)
    if (point === null) {
        continue
    }
    const allLaps = lapIndex.get(driver.driver_number)
    const lastLap = allLaps?.[allLaps.length - 1]
    const lastActivity = lastLap?.t ?? 0
    const isOut = cursor - lastActivity > OUT_THRESHOLD_MS
    rows.push({ 
      position: point.position,
      driverNumber: driver.driver_number, 
      acronym: driver.name_acronym, 
      teamColor: `#${driver.team_colour}`,
      gap: point.position === 1 ? 'LEADER' 
          : isOut ? 'OUT'
          : formatGap(time?.gap ?? null, '-'),
      interval: point.position === 1 ? '-' 
              : isOut ? '-'
              : formatGap(time?.interval ?? null, '-'),
      lastLap: lap ? formatLapTime(lap.duration) : '-',
      lapState: lap && rec && lap.duration <= rec.best ? 'fastest'
              : lap?.isPb ? 'pb'
              : 'normal',
      inPit: pit !== null && cursor <= pit.t + pit.pitDuration * 1000,
      isOut
    })
  }
  rows.sort((a, b) => Number(a.isOut) - Number(b.isOut) || a.position - b.position)
  return (
    <section className={`card ${styles.wrap}`} aria-label="Live timing">
      <div className={`${styles.row} ${styles.head}`}>
        <span>POS</span>
        <span>DRIVER</span>
        <span className={styles.right}>GAP</span>
        <span className={styles.right}>INT</span>
        <span className={styles.right}>LAST LAP</span>
      </div>

      {rows.map((row) => (
        <div key={row.driverNumber} className={styles.row} data-out={row.isOut}>
          <span className={`${styles.pos} tnum`}>{row.position}</span>
          <span className={styles.driver}>
            <i className={styles.teamBar} style={{ background: row.teamColor }} />
            <b>{row.acronym}</b>
            <span className={`${styles.num} tnum`}>{row.driverNumber}</span>
            {row.inPit && <span className={styles.pit}>PIT</span>}
          </span>
          <span className={`${styles.right} tnum`}>{row.gap}</span>
          <span className={`${styles.right} ${styles.dim} tnum`}>{row.interval}</span>
          <span className={`${styles.right} ${styles[row.lapState]} tnum`}>{row.lastLap}</span>
        </div>
      ))}
    </section>
  );
}
