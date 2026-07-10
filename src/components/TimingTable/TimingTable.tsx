"use client";

import type { Driver, Position } from "@/lib/types/openf1";
import styles from "./TimingTable.module.css";
import { buildPositionIndex, positionAt } from "@/lib/replay/positions";
import { useMemo } from "react";
import { useReplayStore } from "@/store/replayStore";

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
  positions: Position[],
  sessionStartMs: number
}

export default function TimingTable({drivers, positions, sessionStartMs}: Props) {
  const index = useMemo(() => buildPositionIndex(positions, sessionStartMs), [positions, sessionStartMs])
  const cursor = useReplayStore(s => s.cursor)
  const rows: TimingRow[] = []
  for (const driver of drivers) {
    const position = positionAt(index, driver.driver_number, cursor) 
    if (position === null) {
        continue
    }
    rows.push({ 
      position, 
      driverNumber: driver.driver_number, 
      acronym: driver.name_acronym, 
      teamColor: `#${driver.team_colour}`,
      gap: '-',
      interval: '-',
      lastLap: '-',
      lapState: 'normal',
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
