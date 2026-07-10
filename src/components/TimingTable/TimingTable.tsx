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
};

type Props = {
  drivers: Driver[],
  positionIndex: ReturnType<typeof useSessionIndexes>['positionIndex'],
  intervalIndex: ReturnType<typeof useSessionIndexes>['intervalIndex'],
  lapIndex: ReturnType<typeof useSessionIndexes>['lapIndex'],
  sessionBest: ReturnType<typeof useSessionIndexes>['sessionBest']
}

export default function TimingTable({drivers, positionIndex, intervalIndex, lapIndex, sessionBest}: Props) {
  const cursor = useReplayStore(s => s.cursor)
  const rec = searchLatest(sessionBest, cursor)
  const rows: TimingRow[] = []
  for (const driver of drivers) {
    const point = latestAt(positionIndex, driver.driver_number, cursor)
    const time = latestAt(intervalIndex, driver.driver_number, cursor) 
    const lap = latestAt(lapIndex, driver.driver_number, cursor)
    if (point === null) {
        continue
    }
    rows.push({ 
      position: point.position,
      driverNumber: driver.driver_number, 
      acronym: driver.name_acronym, 
      teamColor: `#${driver.team_colour}`,
      gap: point.position === 1 ? 'LEADER' : formatGap(time?.gap ?? null, '-'),
      interval: point.position === 1 ? '-' : formatGap(time?.interval ?? null, '-'),
      lastLap: lap ? formatLapTime(lap.duration) : '-',
      lapState: lap && rec && lap.duration <= rec.best ? 'fastest'
              : lap?.isPb ? 'pb'
              : 'normal',
      inPit: false,
    })
  }
  rows.sort((a, b) => a.position - b.position)
  // TODO Later: DNF/DNS (or more united for both cases - OUT) row for any driver who is not participating in race in a certain timestamp
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
        <div key={row.driverNumber} className={styles.row}>
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
